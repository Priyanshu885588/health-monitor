import os
import time
import requests
from redis import Redis

# Configuration
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
JAVA_SERVICE_URL = os.getenv('JAVA_SERVICE_URL', 'http://java-core:8080/alerts')
STREAM_NAME = "health_events"
GROUP_NAME = "analytics_group"
CONSUMER_NAME = "python_processor_1"

redis = Redis(host=REDIS_HOST, port=6379, decode_responses=True)

# 1. Create Consumer Group if it doesn't exist
try:
    redis.xgroup_create(STREAM_NAME, GROUP_NAME, id='0', mkstream=True)
except Exception:
    print("Group already exists")

def process_metrics():
    print(f"Python Analytics Service started. Watching {STREAM_NAME}...")
    
    while True:
        # 2. Read new messages from the stream
        # '>' means read only messages that haven't been delivered to other consumers
        messages = redis.xreadgroup(GROUP_NAME, CONSUMER_NAME, {STREAM_NAME: '>'}, count=1, block=5000)

        if not messages:
            continue

        for _, stream_msgs in messages:
            for message_id, data in stream_msgs:
                hr = int(data['heart_rate'])
                user_id = data['user_id']

                # 3. ANALYTICS LOGIC (The "Doctor" Check)
                if hr > 150:
                    print(f"⚠️ HIGH HEART RATE DETECTED: {hr} for User {user_id}")
                    trigger_alert(user_id, hr)

                # 4. Acknowledge the message so it's removed from the pending list
                redis.xack(STREAM_NAME, GROUP_NAME, message_id)

def trigger_alert(user_id, hr):
    try:
        # In the next step, this will hit the Java Spring Boot service
        payload = {"userId": user_id, "heartRate": hr, "message": "Emergency: Critical HR detected"}
        requests.post(JAVA_SERVICE_URL, json=payload)
        print(f"Sent critical alert to Java Service for User {user_id}")
    except Exception as e:
        print(f"Failed to reach Java service: {e}")

if __name__ == "__main__":
    process_metrics()