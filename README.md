# Generative-AI-Playground-v0.9 ![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)

A basic Generative AI microservice integrates Node.js with TypeScript and Python for backend services.

Leverages Apache Kafka for messaging.

Postgres for structured data storage, Pinecone for vector storage.

ElasticSearch for search functionality, OpenAI's API for LLMs.

The OpenAI Realtime API is a stateful, event-based API that communicates over a WebSocket.

The app will be deployed using Kubernetes, AWS EKS, ECR and monitored with DataDog, while React handles the frontend interface.

## Architecture Overview

1. **Frontend**: The _React_ UI sends prompt requests to the backend and establishes a _WebSocket_ connection to receive _AI_ responses in real-time.
2. **Backend**: _Node.js_ (_TypeScript_) microservice acts as the _API_ gateway, processing requests and responses.
   - **API Endpoint**: The backend’s HTTP endpoint accepts prompt requests and produces them to _Kafka_.
   - **WebSocket Server**: A _WebSocket_ server runs alongside the HTTP server, forwarding responses from Kafka’s `response-topic` to the frontend.
3. **LLM Integration**: A _Python_-based microservice interacts with _OpenAI API_ for LLM queries.
   - This service consumes prompts from Kafka’s `generate-text` topic, processes them with OpenAI, and produces the response to `response-topic`.
   - Integrate _WebSocket_ and configure code based on [OpenAI Realtime API (beta) doc](https://platform.openai.com/docs/guides/realtime/overview)
   - Check usage, bill, balance of my API key, [OpenAI API Usage check](https://platform.openai.com/settings/organization/usage)
4. **Messaging**: _Apache Kafka_ to handle message queues and asynchronous tasks.
5. **Storage**: (TBD)
   - _Postgres_ for structured data like user profiles, logs, and configuration.
   - _Pinecone_ for vector embeddings to store and retrieve contextual information.
   - _ElasticSearch_ for fast, keyword-based search.
6. **Deployment**: _Kubernetes_ for _Docker_ container orchestration, _AWS_ EKS, ECR for infrastructure, and _DataDog_ for monitoring

## Docker and Docker-Compose Setup for _Dev_

To containerize the three microservices and test their communication:

1. **Dockerize Microservices**: Create Dockerfiles for each of the three microservices (Frontend, Backend, LLM Integration).
2. **Docker-Compose Configuration**: Set up a `docker-compose.yml` file to define and manage the multi-container application.
3. **Testing Communication**: Use Docker-Compose to build and run the containers, ensuring they can communicate with each other.

### Steps to Test

1. **Build and Start Containers**: Run `docker-compose up --build` to build and start all services.
2. **Verify Communication**: Ensure that the frontend can send requests to the backend, and the backend can communicate with the LLM service.

Refer to the respective Dockerfile and service documentation for detailed setup instructions.

## Deployment on AWS EKS for _PROD_

Deploying 3 Dockerized microservices using AWS Elastic Kubernetes Service (EKS) leverages Kubernetes for orchestration and AWS for infrastructure.

1. **Setup AWS EKS Cluster**:

   - Create an EKS cluster using the AWS Management Console, AWS CLI, or Infrastructure as Code (IaC) tools like Terraform.
   - Ensure cluster has the necessary IAM roles and policies for EKS to manage resources.

2. **Configure kubectl**:

   - Install and configure `kubectl` to interact with your EKS cluster.
   - Update kubeconfig file to include the EKS cluster context.

3. **Create Kubernetes Manifests**:

   - Define Kubernetes manifests for my microservices, including Deployments, Services, ConfigMaps, and Secrets.
   - Ensure each microservice has a corresponding Deployment and Service for load balancing.

4. **Deploy Microservices**:

   - Apply Kubernetes manifests using `kubectl apply -f <manifest-file>.yaml`.
   - Verify that the pods are running and services are correctly exposed.

5. **Setup AWS ECR**:

   - Push Docker images to AWS Elastic Container Registry (ECR).
   - Update Kubernetes manifests to pull images from ECR.

6. **Monitor and Scale**:
   - Use Kubernetes Horizontal Pod Autoscaler (HPA) to scale your microservices based on demand.
   - Monitor your cluster and applications using AWS CloudWatch and DataDog.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
