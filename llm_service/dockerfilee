# FROM python:3.9-slim: Uses a slim version of Python 3.9 to reduce image size.
# WORKDIR /app: Sets the working directory inside the container.
# COPY requirements.txt /app/ and RUN pip install --no-cache-dir -r requirements.txt: Installs the necessary Python packages without caching.
# COPY . /app: Copies all files from llm_service/ on your local machine to /app in the container.
# CMD ["python", "llm_service.py"]: Specifies the command to run the application when the container starts.

# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 9092 available to the world outside this container
EXPOSE 9092

# Run llm_service.py when the container launches
CMD ["python3", "llm_service.py"]
