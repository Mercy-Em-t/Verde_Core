import redis
import json
import threading
import time

class RedisBroker:
    def __init__(self, host='127.0.0.1', port=6379, channel='verde_events'):
        self.channel = channel
        self.r = redis.Redis(host=host, port=port, decode_responses=True)
        self.pubsub = self.r.pubsub()
        self.pubsub.subscribe(self.channel)
        
        self.subscribers = []
        
        # Start a background thread to listen for Redis messages
        self.thread = threading.Thread(target=self._listen, daemon=True)
        self.thread.start()
        
    def _listen(self):
        for message in self.pubsub.listen():
            if message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                    for sub in self.subscribers:
                        try:
                            sub.receive_message(data)
                        except Exception as e:
                            print(f"[Broker Error] Subscriber failed: {e}")
                except Exception as e:
                    print(f"[Broker Error] Failed to parse message: {e}")

    def publish(self, msg):
        self.r.publish(self.channel, json.dumps(msg))
        
    def subscribe(self, subscriber):
        self.subscribers.append(subscriber)
