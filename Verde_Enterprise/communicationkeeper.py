class CommunicationKeeper:
    """
    Enterprise Notification Service.
    Listens to domain events on the Redis bus and triggers external communications (Emails, SMS, Webhooks).
    """
    def __init__(self, broker):
        self.broker = broker
        self.broker.subscribe(self)
        self.broker.publish({"type": "LOG", "msg": "CommunicationKeeper: Initialized and listening for events."})

    def receive_message(self, msg):
        event_type = msg.get("type")
        
        if event_type == "LEAD_CREATED":
            lead_email = msg.get("email", "Unknown")
            lead_name = msg.get("name", "New Lead")
            
            # 1. Notify Admin
            admin_msg = f"INTERNAL ALERT: A new lead ({lead_name}) has just submitted the website form. Please review the dashboard."
            self._send_email(to="admin@verdesystem.com", subject="New Lead Captured", body=admin_msg)
            
            # 2. Acknowledge Lead
            lead_msg = f"Hello {lead_name},\n\nWe have successfully received your submission! Our team is currently reviewing your details and will communicate with you shortly.\n\nBest,\nThe Verde Team"
            self._send_email(to=lead_email, subject="Submission Received - Verde", body=lead_msg)

        elif event_type == "LEAD_STATE_CHANGED":
            new_state = msg.get("new_state")
            lead_email = msg.get("lead_email")
            lead_name = msg.get("lead_name", "Valued Client")
            
            if new_state == "QUALIFIED" and lead_email:
                qual_msg = f"Congratulations {lead_name}!\n\nYour lead profile has been successfully Qualified. You are now officially entering Phase Zero (Pre-Engagement).\n\nPlease proceed to complete steps X, Y, and Z on your portal so we can officially determine your Project's starting phase.\n\nBest,\nThe Verde Team"
                self._send_email(to=lead_email, subject="You are Qualified! Next Steps", body=qual_msg)

        elif event_type == "PROJECT_STATE_CHANGED":
            new_state = msg.get("new_state")
            old_state = msg.get("old_state")
            project_id = msg.get("project_id")
            
            # Note: In a real system, we would query the Postgres DB for the Client's Email.
            # For this MVP stub, we will just send it to a generic client address.
            client_email = f"client_for_project_{project_id}@example.com"
            
            if new_state == "COMPLETED":
                body = f"Hello,\n\nYour Project (ID {project_id}) has been officially marked as COMPLETED! All final documents and deliverables are now available in your Vault.\n\nThank you for choosing Verde! This concludes the current engagement."
                self._send_email(to=client_email, subject=f"Project {project_id} - Official Sign-off & Handoff", body=body)
            else:
                body = f"Hello,\n\nGood news! Your previous phase has been fully accepted, signed off, and cleared.\n\nWe are now officially initiating {new_state}. Please log into your dashboard to review and sign the new Statement of Work (SOW) for this phase, and clear the pending invoice so work can begin.\n\nBest,\nThe Verde Team"
                self._send_email(to=client_email, subject=f"Project {project_id} - Initiating {new_state}", body=body)

        elif event_type == "WORKER_ASSIGNED":
            worker_email = msg.get("worker_email")
            project_id = msg.get("project_id")
            phase = msg.get("target_phase")
            
            body = f"Hello,\n\nYou have been officially assigned as a Contracted Worker to Project {project_id} for {phase}.\n\nPlease log into your Worker Dashboard to review your tasks and upload your deliverables directly to the Vault when completed.\n\nBest,\nVerde Dispatch"
            self._send_email(to=worker_email, subject=f"New Assignment: Project {project_id}", body=body)

    def _send_email(self, to, subject, body):
        # Stub for actual SMTP / SendGrid / AWS SES integration
        print("\n" + "="*50)
        print(f"📧 EMAIL DISPATCHED TO: {to}")
        print(f"📌 SUBJECT: {subject}")
        print("-" * 50)
        print(body)
        print("="*50 + "\n")
        
        # Log to enterprise bus
        self.broker.publish({"type": "LOG", "msg": f"Email Sent to {to}: {subject}"})
