# generative-ai

A basic Generative AI microservice integrates Node.js with TypeScript and Python for backend services, leverages Apache Kafka for messaging, Postgres for structured data storage, Pinecone for vector storage, ElasticSearch for search functionality, and OpenAI's API for LLMs. The app is deployed using Kubernetes and monitored with DataDog, while React handles the frontend interface.

## Architecture Overview

1. **Frontend**: React-based UI to interact with the AI service, which sends requests to the backend.
2. **Backend**: Node.js (TypeScript) microservice acts as the API gateway, processing requests and responses.
3. **LLM Integration**: A Python-based microservice interacts with OpenAI API for LLM queries.
4. **Messaging**: Apache Kafka to handle message queues and asynchronous tasks.
5. **Storage**:
   - Postgres for structured data like user profiles, logs, and configuration.
   - Pinecone for vector embeddings to store and retrieve contextual information.
   - ElasticSearch for fast, keyword-based search.
6. **Deployment**: Kubernetes for container orchestration, AWS for infrastructure, and DataDog for monitoring
