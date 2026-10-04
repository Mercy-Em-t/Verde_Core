import re

def run():
    with open('gatekeeper.py', 'r', encoding='utf-8') as f:
        code = f.read()

    inject_logic = """
        elif event_type == "AUTH_RECOVERY":
            uid, rec_key, new_pwd = msg.get("userid"), msg.get("recovery_key"), msg.get("new_password")
            req_id = msg.get("req_id")
            response = None
            
            with self.get_connection() as conn:
                user = conn.run("SELECT RecoveryHash FROM Users WHERE UserId = :uid", uid=uid)
                if not user:
                    response = {"type": "RECOVERY_FAILED", "msg": "User not found."}
                else:
                    db_rec_hash = user[0][0]
                    if self._hash(rec_key) == db_rec_hash:
                        conn.run("UPDATE Users SET PasswordHash = :pwd, FailedAttempts = 0, IsLocked = FALSE WHERE UserId = :uid", 
                                 pwd=self._hash(new_pwd), uid=uid)
                        response = {"type": "RECOVERY_SUCCESS", "msg": "Account unlocked and password reset."}
                    else:
                        response = {"type": "RECOVERY_FAILED", "msg": "Invalid recovery key."}
            
            if response:
                self.broker.publish({"type": "AUTH_RESPONSE", "req_id": req_id, "response": response})
"""

    if "AUTH_RECOVERY" not in code:
        # Inject right before the trailing `except Exception as e:` block inside listen()
        # Find `elif event_type == "AUTH_ATTEMPT":` block end. It's safer to just inject it right before `except Exception as e:`
        pattern = r'(\s*except Exception as e:\s*print\("\[GateKeeper\] Error")'
        code = re.sub(pattern, inject_logic + r'\1', code)
        with open('gatekeeper.py', 'w', encoding='utf-8') as f:
            f.write(code)
        print("Injected AUTH_RECOVERY into gatekeeper.py")
    else:
        print("Already injected")

if __name__ == '__main__':
    run()
