# Use lightweight Python image
FROM python:3.12-slim

# Prevent Python from buffering logs (important for Docker logs)
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Copy dependency file first (better caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run the worker
CMD ["python", "main.py"]
