import json
import os
import openai
from openai import OpenAI
from kafka import KafkaConsumer, KafkaProducer, KafkaAdminClient
from kafka.admin import NewTopic
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Logging configuration
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

logging.info(f"OpenAI library version: {openai.__version__}")

try:
    client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY"),
        max_retries=0,
    )
except Exception as e:
    logging.error(f"Failed to initialize OpenAI client: {e}")
    raise e


kafka_bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
input_topic = os.getenv("INPUT_TOPIC")
output_topic = os.getenv("OUTPUT_TOPIC")

if not input_topic or not output_topic:
    logging.error(
        "INPUT_TOPIC or OUTPUT_TOPIC is not defined in environment variables."
    )
    raise ValueError("Missing Kafka topic configuration.")


def safe_deserialize(value):
    try:
        return json.loads(value.decode("utf-8"))
    except (json.JSONDecodeError, AttributeError):
        print("Received a malformed or empty message.")
        return None  # Return None if decoding fails


# Configure Kafka topic retention
def configure_topic_retention():
    try:
        admin_client = KafkaAdminClient(
            bootstrap_servers=[kafka_bootstrap_servers], client_id="admin-client"
        )
    except Exception as e:
        logging.error(f"Failed to create KafkaAdminClient: {e}")
        return

    topic_config = {"retention.ms": "600000"}  # Set retention to 10 minutes

    new_topic = NewTopic(
        name=input_topic,
        num_partitions=1,
        replication_factor=1,
        topic_configs=topic_config,
    )

    try:
        admin_client.create_topics(new_topics=[new_topic], validate_only=False)
        print(f"Retention policy set to 10 minutes for topic {input_topic}")
    except Exception as e:
        print(f"Topic configuration error or topic already exists: {e}")
    finally:
        admin_client.close()


# Apply retention policy at startup
try:
    configure_topic_retention()
except Exception as e:
    logging.error(f"Error configuring Kafka topic retention: {e}")


# Initialize Kafka Consumer and Producer
# Listens to messages on the generate-text topic.
try:
    consumer = KafkaConsumer(
        input_topic,
        bootstrap_servers=[kafka_bootstrap_servers],
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        # group_id="llm-service-group",
        # value_deserializer=lambda x: json.loads(x.decode("utf-8")),
        value_deserializer=safe_deserialize,
    )
    logging.info("Kafka consumer initialized successfully.")
except Exception as e:
    logging.error(f"Failed to initialize Kafka consumer: {e}")
    raise e


# Kafka Producer: Sends responses back to Kafka on the response-topic.
try:
    producer = KafkaProducer(
        bootstrap_servers=[kafka_bootstrap_servers],
        value_serializer=lambda x: json.dumps(x).encode("utf-8"),
    )
    logging.info("Kafka producer initialized successfully.")
except Exception as e:
    logging.error(f"Failed to initialize Kafka producer: {e}")
    raise e


# Uses OpenAI’s API to generate a response based on the input prompt.
def handle_request(input_text):
    """
    Send a prompt to OpenAI and retrieve the response text.
    """
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": input_text}],
            # Replace with "gpt-4o" if you have access and prefer GPT-4o
            model=os.getenv("OPENAI_API_VER", "gpt-4o-mini"),
            # stream=True,
        )
        # return response.choices[0].text.strip()
        return response.choices[0].message.content
    except openai.APIConnectionError as e:
        print("The server could not be reached")
        print(e.__cause__)  # an underlying Exception, likely raised within httpx.
    except openai.RateLimitError as e:
        print("A 429 status code was received; we should back off a bit.")
        print(e.response)
    except openai.APIStatusError as e:
        logging.error(f"Non-200-range status code received: {e.status_code}")
        logging.error(e.response)
    except Exception as e:
        logging.error(f"Unexpected error during OpenAI request: {e}")
    return None


# print("LLM Service is running and waiting for messages...")
logging.info("LLM Service is running and waiting for messages...")


# Listen to Kafka and process messages
try:
    for message in consumer:
        try:
            input_data = message.value
            if input_data is None:
                logging.warning("Skipped malformed or empty message.")
                continue

            input_text = input_data.get("input", "")

            if input_text:
                logging.info(f"Received input: {input_text}")
                # Process input with OpenAI
                response_text = handle_request(input_text)
                if response_text:
                    producer.send(output_topic, {"response": response_text})
                    logging.info(f"Sent response: {response_text}")
                else:
                    logging.warning("No response generated by OpenAI.")
        except Exception as e:
            logging.error(f"Error processing Kafka message: {e}")
except Exception as e:
    logging.error(f"Error in Kafka message loop: {e}")
finally:
    logging.info("Shutting down Kafka consumer and producer.")
    consumer.close()
    producer.close()
