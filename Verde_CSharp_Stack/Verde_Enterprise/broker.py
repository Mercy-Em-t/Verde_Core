import json
import threading
import os
import redis

class RedisBroker:
    def __init__(self, port=6379, channel='verde_events'):
        self.channel = channel
        self.subscribers = []
        
        # Check if we are running in Docker with a Redis container
        self.host = os.getenv('REDIS_HOST')
        self.use_redis = self.host is not None
        
        if self.use_redis:
            print(f"[Broker] Connecting to Docker Redis at {self.host}:{port}...")
            self.r = redis.Redis(host=self.host, port=port, decode_responses=True)
            self.pubsub = self.r.pubsub()
            self.pubsub.subscribe(self.channel)
            self.thread = threading.Thread(target=self._listen, daemon=True)
            self.thread.start()
        else:
            print("[Broker] Using in-memory fallback (No REDIS_HOST configured).")
            
    def _listen(self):
        for message in self.pubsub.listen():
            if message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                    for sub in self.subscribers:
                        sub.receive_message(data)
                except Exception as e:
                    print(f"[Broker Error] {e}")

    def publish(self, msg):
        if self.use_redis:
            self.r.publish(self.channel, json.dumps(msg))
        else:
            def deliver():
                for sub in self.subscribers:
                    try:
                        sub.receive_message(msg)
                    except Exception as e:
                        print(f"[Broker Error] {e}")
            threading.Thread(target=deliver, daemon=True).start()
        
    def subscribe(self, subscriber):
        self.subscribers.append(subscriber)
