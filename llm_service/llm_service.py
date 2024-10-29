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

# Initialize Kafka Consumer and Producer
consumer = KafkaConsumer(
    input_topic,
    bootstrap_servers=[kafka_bootstrap_servers],
    auto_offset_reset="earliest",
    enable_auto_commit=True,
    group_id="llm-service-group",
    value_deserializer=lambda x: json.loads(x.decode("utf-8")),
)

producer = KafkaProducer(
    bootstrap_servers=[kafka_bootstrap_servers],
    value_serializer=lambda x: json.dumps(x).encode("utf-8"),
)


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
    input_text = input_data.get("input", "")

    if input_text:
        print(f"Received input: {input_text}")
        # Process input with OpenAI
        response_text = handle_request(input_text)
        # Send response back to Kafka
        producer.send(output_topic, {"response": response_text})
        print(f"Sent response: {response_text}")
