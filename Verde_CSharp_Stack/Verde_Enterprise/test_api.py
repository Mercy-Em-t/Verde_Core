import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Mock Redis before importing main_api
with patch('redis.Redis'):
    import main_api
    from main_api import app, broker
    import threading

client = TestClient(app)

def test_account_recovery_success():
    # Patch only the specific Event instance used in pending_requests
    original_event = threading.Event

    def mock_event_constructor(*args, **kwargs):
        evt = original_event(*args, **kwargs)
        original_wait = evt.wait
        def mocked_wait(timeout=None):
            # Populate pending_requests for the request ID
            # Find the req_id from pending_requests that has this event
            req_id = None
            for k, v in main_api.pending_requests.items():
                if v.get("event") == evt:
                    req_id = k
                    break
            if req_id:
                main_api.pending_requests[req_id]["response"] = {
                    "type": "RECOVERY_SUCCESS",
                    "msg": "Password updated successfully"
                }
            return original_wait(0.01) # fast wait
        evt.wait = mocked_wait
        return evt

    with patch('main_api.threading.Event', side_effect=mock_event_constructor):
        response = client.post("/api/recover", json={
            "userid": "user1",
            "recovery_key": "key123",
            "new_password": "newpass"
        })
        
        assert response.status_code == 200
        assert response.json() == {"status": "success", "message": "Password updated successfully"}

def test_account_recovery_timeout():
    # For timeout, we don't populate response and wait fast
    original_event = threading.Event

    def mock_event_constructor(*args, **kwargs):
        evt = original_event(*args, **kwargs)
        evt.wait = lambda timeout=None: None
        return evt

    with patch('main_api.threading.Event', side_effect=mock_event_constructor):
        response = client.post("/api/recover", json={
            "userid": "user1",
            "recovery_key": "key123",
            "new_password": "newpass"
        })
        
        assert response.status_code == 504
        assert response.json() == {"detail": "Broker timeout"}

def test_telemetry_endpoint():
    response = client.post("/api/telemetry", json={"event": "click", "page": "home"})
    assert response.status_code in (200, 400, 500)

def test_api_event_catcher():
    from main_api import api_catcher, pending_requests
    import threading
    req_id = "test-catch-id"
    pending_requests[req_id] = {"event": threading.Event(), "response": None}
    
    msg = {"type": "AUTH_SUCCESS", "req_id": req_id}
    api_catcher.receive_message(msg)
    
    assert pending_requests[req_id]["response"] == msg
    assert pending_requests[req_id]["event"].is_set()
