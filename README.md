# Generative-AI-Playground-v0.1 ![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)

A basic Generative AI microservice integrates Node.js with TypeScript and Python for backend services.

Leverages Apache Kafka for messaging.

Postgres for structured data storage, Pinecone for vector storage.

ElasticSearch for search functionality, OpenAI's API for LLMs.

The OpenAI Realtime API is a stateful, event-based API that communicates over a WebSocket.

The app will be deployed using Kubernetes and monitored with DataDog, while React handles the frontend interface.

## Architecture Overview

1. **Frontend**: The _React_ UI sends prompt requests to the backend and establishes a WebSocket connection to receive AI responses in real-time.
2. **Backend**: Node.js (TypeScript) microservice acts as the API gateway, processing requests and responses.
   - **API Endpoint**: The backend’s HTTP endpoint accepts prompt requests and produces them to Kafka.
   - **WebSocket Server**: A WebSocket server runs alongside the HTTP server, forwarding responses from Kafka’s `response-topic` to the frontend.
3. **LLM Integration**: A _Python_-based microservice interacts with _OpenAI API_ for LLM queries.
   - This service consumes prompts from Kafka’s `generate-text` topic, processes them with OpenAI, and produces the response to `response-topic`.
   - Integrate _WebSocket_ and configure code based on [OpenAI Realtime API (beta) doc](https://platform.openai.com/docs/guides/realtime/overview)
   - Check usage, bill, balance of my API key, [OpenAI API Usage check](https://platform.openai.com/settings/organization/usage)
4. **Messaging**: _Apache Kafka_ to handle message queues and asynchronous tasks.
5. **Storage**: (TBD)
   - _Postgres_ for structured data like user profiles, logs, and configuration.
   - _Pinecone_ for vector embeddings to store and retrieve contextual information.
   - _ElasticSearch_ for fast, keyword-based search.
6. **Deployment**: _Kubernetes_ for _Docker_ container orchestration, AWS for infrastructure, and DataDog for monitoring

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
