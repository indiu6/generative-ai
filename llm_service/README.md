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
