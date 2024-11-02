# Set Up a Virtual Environment: It’s recommended to use a virtual environment to manage dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install kafka-python openai python-dotenv
```

## From the project root, run python llm_service in local

```bash
 python3 llm_service.py
```

## From the project root, build and run the Docker container for the Python microservice

```bash
docker build -t llm_service .
docker run --env-file .env llm_service
```

## AWS EKS ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 134428267718.dkr.ecr.us-east-1.amazonaws.com
```

```bash
docker build -t llm_service .
```

```bash
docker tag llm_service:latest 134428267718.dkr.ecr.us-east-1.amazonaws.com/llm_service:latest
```

```bash
docker push 134428267718.dkr.ecr.us-east-1.amazonaws.com/llm_service:latest
```

```bash
docker buildx build --platform linux/amd64 -t 134428267718.dkr.ecr.us-east-1.amazonaws.com/llm_service:latest .
```

```bash
kubectl rollout restart deployment llm-service
```
