from pg8000.native import Connection

class StateMachineManager:
    def __init__(self, broker, db_params):
        self.broker = broker
        self.broker.subscribe(self)
        self.db_params = db_params
        
        # Strict Workflow Guardrails for CRM
        self.lead_rules = {
            "NEW": ["IN_REVIEW", "DISQUALIFIED"],
            "IN_REVIEW": ["QUALIFIED", "DISQUALIFIED"],
            "QUALIFIED": ["CONVERTED"],
            "DISQUALIFIED": ["NEW"],
            "CONVERTED": []
        }
        
        self.project_rules = {
            "PRE_ENGAGEMENT": ["PHASE_1", "PHASE_2", "PHASE_3", "PHASE_4", "PHASE_5", "COMPLETED"],
            "PHASE_1": ["PHASE_2", "COMPLETED"],
            "PHASE_2": ["PHASE_3", "COMPLETED"],
            "PHASE_3": ["PHASE_4", "COMPLETED"],
            "PHASE_4": ["PHASE_5", "COMPLETED"],
            "PHASE_5": ["COMPLETED"]
        }

    def get_connection(self):
        return Connection(**self.db_params)

    def receive_message(self, msg):
        if msg.get("type") == "REQUEST_LEAD_TRANSITION":
            lead_id = msg["lead_id"]
            requested_state = msg["new_state"]
            req_id = msg.get("req_id")
            
            with self.get_connection() as conn:
                row = conn.run("SELECT State, Name, Email FROM Leads WHERE Id = :id", id=lead_id)
                if not row:
                    self.broker.publish({"type": "LOG", "msg": f"StateMachine: Lead {lead_id} not found."})
                    return
                
                current_state = row[0][0]
                lead_name = row[0][1]
                lead_email = row[0][2]
                
            allowed_transitions = self.lead_rules.get(current_state, [])
            if requested_state in allowed_transitions:
                with self.get_connection() as conn:
                    conn.run("UPDATE Leads SET State = :state WHERE Id = :id", state=requested_state, id=lead_id)
                self.broker.publish({"type": "LOG", "msg": f"Lead {lead_id} transitioned to {requested_state}"})
                
                # Broadcast the domain event for CommunicationKeeper
                self.broker.publish({
                    "type": "LEAD_STATE_CHANGED", 
                    "lead_id": lead_id, 
                    "new_state": requested_state,
                    "lead_name": lead_name,
                    "lead_email": lead_email
                })
                
                if req_id:
                    self.broker.publish({"type": "TRANSITION_SUCCESS", "req_id": req_id})
            else:
                self.broker.publish({"type": "LOG", "msg": f"SECURITY BLOCK: Cannot transition Lead from {current_state} to {requested_state}"})
                if req_id:
                    self.broker.publish({"type": "TRANSITION_FAILED", "msg": f"Invalid transition from {current_state}", "req_id": req_id})
                    
        elif msg.get("type") == "REQUEST_PROJECT_TRANSITION":
            project_id = msg["project_id"]
            requested_state = msg["new_state"]
            req_id = msg.get("req_id")
            
            with self.get_connection() as conn:
                row = conn.run("SELECT State FROM Projects WHERE Id = :id", id=project_id)
                if not row:
                    self.broker.publish({"type": "LOG", "msg": f"StateMachine: Project {project_id} not found."})
                    return
                current_state = row[0][0]
                
            allowed_transitions = self.project_rules.get(current_state, [])
            if requested_state not in allowed_transitions:
                self.broker.publish({"type": "LOG", "msg": f"SECURITY BLOCK: Cannot transition Project from {current_state} to {requested_state}"})
                if req_id:
                    self.broker.publish({"type": "TRANSITION_FAILED", "msg": f"Invalid transition from {current_state}", "req_id": req_id})
                return

            # GUARDRAIL CHECKS FOR THE TARGET PHASE
            with self.get_connection() as conn:
                # 1. Document Check: Ensure all EXPECTED documents for the Target Phase are SIGNED
                docs = conn.run("SELECT Filename, Status FROM ProjectDocuments WHERE ProjectId = :pid AND TargetPhase = :tphase",
                                pid=project_id, tphase=requested_state)
                # In a real system you'd also check if the REQUIRED documents are actually present.
                # For now, we just ensure that any document uploaded for this phase is explicitly SIGNED.
                for doc_name, status in docs:
                    if status != 'SIGNED':
                        msg_str = f"Transition Blocked: Document '{doc_name}' is not signed."
                        self.broker.publish({"type": "LOG", "msg": msg_str})
                        if req_id: self.broker.publish({"type": "TRANSITION_FAILED", "msg": msg_str, "req_id": req_id})
                        return

                # 2. Payment Check: Ensure Payment for the Target Phase is CLEARED
                payments = conn.run("SELECT AmountPaid, AmountDue, Status FROM Payments WHERE ProjectId = :pid AND TargetPhase = :tphase",
                                    pid=project_id, tphase=requested_state)
                # If there are invoices, they must all be CLEARED
                for paid, due, status in payments:
                    if status != 'CLEARED':
                        msg_str = f"Transition Blocked: Missing cleared payment for {requested_state}."
                        self.broker.publish({"type": "LOG", "msg": msg_str})
                        if req_id: self.broker.publish({"type": "TRANSITION_FAILED", "msg": msg_str, "req_id": req_id})
                        return

                # 3. Client Commissioning: If transitioning from PRE_ENGAGEMENT to PHASE_1, commission the client
                if current_state == "PRE_ENGAGEMENT" and requested_state == "PHASE_1":
                    client_row = conn.run("SELECT LeadId FROM Projects WHERE Id = :pid", pid=project_id)
                    if client_row:
                        lead_id = client_row[0][0]
                        lead_row = conn.run("SELECT Email FROM Leads WHERE Id = :lid", lid=lead_id)
                        if lead_row:
                            client_email = lead_row[0][0]
                            # Auto-commissioning
                            self.broker.publish({
                                "type": "COMMISSION_USER",
                                "userid": client_email,
                                "password": "temp_password_123", # In prod, generate securely
                                "recovery": "temp_recovery",
                                "token": "SYSTEM" # Bypasses token check
                            })
                            # Send welcome email (stubbed via LOG for now, or CommunicationKeeper can catch COMMISSION_USER)

                # ALL CHECKS PASSED: Execute Transition
                conn.run("UPDATE Projects SET State = :state WHERE Id = :id", state=requested_state, id=project_id)
            
            self.broker.publish({"type": "LOG", "msg": f"Project {project_id} transitioned to {requested_state}"})
            
            # Broadcast the domain event for CommunicationKeeper
            self.broker.publish({
                "type": "PROJECT_STATE_CHANGED",
                "project_id": project_id,
                "old_state": current_state,
                "new_state": requested_state
            })
            
            if req_id:
                self.broker.publish({"type": "TRANSITION_SUCCESS", "req_id": req_id})
