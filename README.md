# generative-ai

A basic Generative AI microservice integrates Node.js with TypeScript and Python for backend services,
leverages Apache Kafka for messaging,
Postgres for structured data storage,
Pinecone for vector storage, ElasticSearch for search functionality, OpenAI's API for LLMs.

The app is deployed using Kubernetes and monitored with DataDog, while React handles the frontend interface.

## Architecture Overview

1. **Frontend**: The _React_ UI sends prompt requests to the backend and establishes a WebSocket connection to receive AI responses in real-time.
2. **Backend**: Node.js (TypeScript) microservice acts as the API gateway, processing requests and responses.
   - **API Endpoint**: The backend’s HTTP endpoint accepts prompt requests and produces them to Kafka.
   - **WebSocket Server**: A WebSocket server runs alongside the HTTP server, forwarding responses from Kafka’s `response-topic` to the frontend.
3. **LLM Integration**: A _Python_-based microservice interacts with _OpenAI API_ for LLM queries.
   - This service consumes prompts from Kafka’s generate-text topic, processes them with OpenAI, and produces the response to response-topic.
4. **Messaging**: _Apache Kafka_ to handle message queues and asynchronous tasks.
5. **Storage**:
   - _Postgres_ for structured data like user profiles, logs, and configuration.
   - _Pinecone_ for vector embeddings to store and retrieve contextual information.
   - _ElasticSearch_ for fast, keyword-based search.
6. **Deployment**: _Kubernetes_ for _Docker_ container orchestration, AWS for infrastructure, and DataDog for monitoring
