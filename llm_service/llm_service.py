import json
import os
import openai
from kafka import KafkaConsumer, KafkaProducer
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

kafka_bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS")
input_topic = os.getenv("INPUT_TOPIC")
output_topic = os.getenv("OUTPUT_TOPIC")


def safe_deserialize(value):
    try:
        return json.loads(value.decode("utf-8"))
    except (json.JSONDecodeError, AttributeError):
        print("Received a malformed or empty message.")
        return None  # Return None if decoding fails


# Initialize Kafka Consumer and Producer
# Listens to messages on the generate-text topic.
consumer = KafkaConsumer(
    os.getenv("INPUT_TOPIC"),
    bootstrap_servers=[os.getenv("KAFKA_BOOTSTRAP_SERVERS")],
    auto_offset_reset="earliest",
    enable_auto_commit=True,
    group_id="llm-service-group",
    # value_deserializer=lambda x: json.loads(x.decode("utf-8")),
    value_deserializer=safe_deserialize,
)

# Kafka Producer: Sends responses back to Kafka on the response-topic.
producer = KafkaProducer(
    bootstrap_servers=[kafka_bootstrap_servers],
    value_serializer=lambda x: json.dumps(x).encode("utf-8"),
)


# Uses OpenAI’s API to generate a response based on the input prompt.
def handle_request(input_text):
    """
    Send a prompt to OpenAI and retrieve the response text.
    """
    try:
        response = openai.Completion.create(
            engine="text-davinci-003",  # Or another model like gpt-3.5-turbo
            prompt=input_text,
            max_tokens=100,
        )
        return response.choices[0].text.strip()
    except Exception as e:
        print(f"Error with OpenAI API: {e}")
        return "Error generating response."


print("LLM Service is running and waiting for messages...")

# Listen to Kafka and process messages
for message in consumer:
    input_data = message.value

    if input_data is None:
        continue  # Skip processing if the message is malformed or empty

    input_text = input_data.get("input", "")

    if input_text:
        print(f"Received input: {input_text}")
        # Process input with OpenAI
        response_text = handle_request(input_text)
        # Send response back to Kafka
        producer.send(output_topic, {"response": response_text})
        print(f"Sent response: {response_text}")
