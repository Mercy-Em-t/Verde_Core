import datetime
from pg8000.native import Connection

class BillingKeeper:
    def __init__(self, broker, db_params):
        self.broker = broker
        self.broker.subscribe(self)
        self.db_params = db_params

    def get_connection(self):
        return Connection(**self.db_params)

    def receive_message(self, msg):
        event_type = msg.get("type")
        
        if event_type == "GENERATE_INVOICE":
            project_id = msg["project_id"]
            target_phase = msg["target_phase"]
            amount_due = float(msg["amount_due"])
            service_names = msg.get("service_names", [])
            req_id = msg.get("req_id")
            
            with self.get_connection() as conn:
                timestamp = datetime.datetime.now()
                # Get ClientId from Project
                client_row = conn.run("SELECT ClientId FROM Projects WHERE Id = :pid", pid=project_id)
                client_id = client_row[0][0] if client_row else None
                
                # Insert UNPAID Invoice
                res = conn.run('''INSERT INTO Payments (ProjectId, ClientId, Amount, AmountPaid, TargetPhase, Status, PaymentDate) 
                                  VALUES (:pid, :cid, :amt, 0, :tphase, 'UNPAID', :ts) RETURNING Id''',
                               pid=project_id, cid=client_id, amt=amount_due, tphase=target_phase, ts=timestamp)
                invoice_id = res[0][0]
                
            # Generate a physical text/PDF document for the Vault
            invoice_text = f"VERDE SYSTEM - OFFICIAL INVOICE #{invoice_id}\n"
            invoice_text += f"Date: {timestamp}\nProject ID: {project_id}\nTarget Phase: {target_phase}\n"
            invoice_text += "-"*30 + "\n"
            for svc in service_names:
                invoice_text += f"- {svc}\n"
            invoice_text += "-"*30 + "\n"
            invoice_text += f"TOTAL DUE: ${amount_due:.2f}\n"
            
            import base64
            b64_content = base64.b64encode(invoice_text.encode('utf-8')).decode('utf-8')
            
            # Send the official physical document to VaultKeeper
            self.broker.publish({
                "type": "UPLOAD_DOCUMENT",
                "project_id": project_id,
                "filename": f"Invoice_{invoice_id}_{target_phase}.txt",
                "b64_content": b64_content,
                "uploaded_by": "System Billing",
                "req_id": None # No need to block API for file save
            })
            
            self.broker.publish({"type": "LOG", "msg": f"BillingKeeper: Invoice {invoice_id} generated for Project {project_id}"})
            if req_id:
                self.broker.publish({"type": "INVOICE_GENERATED", "invoice_id": invoice_id, "req_id": req_id})
                
        elif event_type == "SUBMIT_PAYMENT":
            project_id = msg["project_id"]
            amount = float(msg["amount"])
            target_phase = msg.get("target_phase")
            req_id = msg.get("req_id")
            
            with self.get_connection() as conn:
                timestamp = datetime.datetime.now()
                # Simplified: In reality you might create a new Payment record or update an existing invoice
                # Let's see if an invoice exists for this phase
                rows = conn.run("SELECT Id, AmountDue, AmountPaid FROM Payments WHERE ProjectId = :pid AND TargetPhase = :tphase",
                                pid=project_id, tphase=target_phase)
                
                if not rows:
                    # Create an ad-hoc payment record
                    conn.run('''INSERT INTO Payments (ProjectId, Amount, AmountPaid, TargetPhase, Status, PaymentDate) 
                                VALUES (:pid, :amt, :amt_paid, :tphase, 'CLEARED', :ts)''',
                             pid=project_id, amt=amount, amt_paid=amount, tphase=target_phase, ts=timestamp)
                else:
                    pay_id, due, paid = rows[0]
                    new_paid = float(paid) + amount
                    status = "CLEARED" if new_paid >= float(due) else "PARTIAL"
                    conn.run("UPDATE Payments SET AmountPaid = :paid, Status = :stat WHERE Id = :id",
                             paid=new_paid, stat=status, id=pay_id)
                             
            self.broker.publish({"type": "LOG", "msg": f"BillingKeeper: Payment of {amount} processed for Project {project_id} Phase {target_phase}"})
            if req_id:
                self.broker.publish({"type": "PAYMENT_SUCCESS", "req_id": req_id})
