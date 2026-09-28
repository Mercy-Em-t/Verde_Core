import tkinter as tk
from tkinter import messagebox, ttk
import sqlite3
import datetime
import hashlib
import secrets
import string

# --- MESSAGING ARCHITECTURE ---
class MessageBroker:
    def __init__(self):
        self._subscribers = []

    def subscribe(self, subscriber):
        if subscriber not in self._subscribers:
            self._subscribers.append(subscriber)

    def unsubscribe(self, subscriber):
        if subscriber in self._subscribers:
            self._subscribers.remove(subscriber)

    def publish(self, message):
        for sub in self._subscribers:
            sub.receive_message(message)

# --- BACKEND COMPONENTS ---
class ObjectScanner:
    def __init__(self, broker):
        self.broker = broker

    def scan_input(self, raw_input):
        parts = raw_input.strip().split()
        if not parts: return

        cmd = parts[0].lower()
        if cmd == "store" and len(parts) >= 3:
            key, val = parts[1], " ".join(parts[2:])
            self.broker.publish({"type": "STORE", "key": key, "val": val})
        elif cmd == "retrieve":
            table = parts[1] if len(parts) > 1 else "VerdeData"
            self.broker.publish({"type": "RETRIEVE", "table": table})
        else:
            self.broker.publish({"type": "LOG", "msg": f"Unknown command: {raw_input}"})

class StorageKeeper:
    def __init__(self, broker):
        self.broker = broker
        self.db_name = "verde.db"
        self._init_db()
        self.broker.subscribe(self)

    def _init_db(self):
        with sqlite3.connect(self.db_name) as conn:
            conn.execute('''CREATE TABLE IF NOT EXISTS VerdeData 
                            (Id INTEGER PRIMARY KEY, DataKey TEXT, DataValue TEXT, Timestamp DATETIME)''')

    def receive_message(self, msg):
        if msg["type"] == "STORE":
            with sqlite3.connect(self.db_name) as conn:
                timestamp = datetime.datetime.now().isoformat()
                conn.execute("INSERT INTO VerdeData (DataKey, DataValue, Timestamp) VALUES (?, ?, ?)", 
                             (msg["key"], msg["val"], timestamp))
            self.broker.publish({"type": "LOG", "msg": f"Stored: {msg['key']}"})
            
        elif msg["type"] == "RETRIEVE" and msg.get("table", "VerdeData") == "VerdeData":
            with sqlite3.connect(self.db_name) as conn:
                cur = conn.execute("SELECT Id, DataKey, DataValue, Timestamp FROM VerdeData")
                rows = cur.fetchall()
            self.broker.publish({"type": "DATA_RETRIEVED", "columns": ("ID", "Key", "Value", "Timestamp"), "rows": rows})

class GateKeeper:
    def __init__(self, broker):
        self.broker = broker
        self.db_name = "verde.db"
        self.active_sessions = {} # token -> {"userid": uid, "role": role}
        self._init_db()
        self.broker.subscribe(self)

    def _init_db(self):
        with sqlite3.connect(self.db_name) as conn:
            conn.execute('''CREATE TABLE IF NOT EXISTS Users 
                            (UserId TEXT PRIMARY KEY, PasswordHash TEXT, RecoveryHash TEXT, FailedAttempts INTEGER, IsLocked BOOLEAN, Role TEXT)''')
            # Attempt to upgrade legacy tables if they don't have the Role column
            try:
                conn.execute("ALTER TABLE Users ADD COLUMN Role TEXT DEFAULT 'User'")
            except sqlite3.OperationalError:
                pass

    def _hash(self, text):
        return hashlib.sha256(text.encode()).hexdigest()

    def receive_message(self, msg):
        if msg["type"] == "CHECK_SETUP":
            with sqlite3.connect(self.db_name) as conn:
                cur = conn.execute("SELECT COUNT(*) FROM Users")
                if cur.fetchone()[0] == 0:
                    self.broker.publish({"type": "SYS_NEEDS_SETUP"})
                else:
                    self.broker.publish({"type": "SYS_NEEDS_LOGIN"})
                    
        elif msg["type"] == "CREATE_ADMIN":
            uid, pwd, rec = msg["userid"], msg["password"], msg["recovery"]
            with sqlite3.connect(self.db_name) as conn:
                try:
                    conn.execute("INSERT INTO Users (UserId, PasswordHash, RecoveryHash, FailedAttempts, IsLocked, Role) VALUES (?, ?, ?, 0, 0, 'Admin')",
                                 (uid, self._hash(pwd), self._hash(rec)))
                    self.broker.publish({"type": "SETUP_COMPLETE"})
                except sqlite3.IntegrityError:
                    self.broker.publish({"type": "LOG", "msg": f"Error: User {uid} already exists."})

        elif msg["type"] == "COMMISSION_USER":
            token = msg.get("token")
            # SECURITY VALIDATION: Enforce Session Token & Role
            if token not in self.active_sessions or self.active_sessions[token]["role"] != "Admin":
                self.broker.publish({"type": "LOG", "msg": "SECURITY ALERT: Unauthorized attempt to commission an account!"})
                return

            uid, pwd, rec, role = msg["userid"], msg["password"], msg["recovery"], msg.get("role", "User")
            with sqlite3.connect(self.db_name) as conn:
                try:
                    conn.execute("INSERT INTO Users (UserId, PasswordHash, RecoveryHash, FailedAttempts, IsLocked, Role) VALUES (?, ?, ?, 0, 0, ?)",
                                 (uid, self._hash(pwd), self._hash(rec), role))
                    self.broker.publish({"type": "LOG", "msg": f"Account commissioned: {uid} as {role}"})
                except sqlite3.IntegrityError:
                    self.broker.publish({"type": "LOG", "msg": f"Error: User {uid} already exists."})

        elif msg["type"] == "AUTH_ATTEMPT":
            uid, pwd = msg["userid"], msg["password"]
            with sqlite3.connect(self.db_name) as conn:
                cur = conn.execute("SELECT PasswordHash, FailedAttempts, IsLocked, Role FROM Users WHERE UserId = ? COLLATE NOCASE", (uid,))
                user = cur.fetchone()

                if not user:
                    self.broker.publish({"type": "AUTH_FAILED", "msg": "User not found."})
                    return

                db_hash, attempts, is_locked, role = user

                if is_locked:
                    self.broker.publish({"type": "AUTH_LOCKED"})
                    return

                if self._hash(pwd) == db_hash:
                    conn.execute("UPDATE Users SET FailedAttempts = 0 WHERE UserId = ? COLLATE NOCASE", (uid,))
                    # Generate cryptographically secure session token
                    session_token = secrets.token_hex(32)
                    self.active_sessions[session_token] = {"userid": uid, "role": role}
                    self.broker.publish({"type": "AUTH_SUCCESS", "role": role, "token": session_token})
                else:
                    attempts += 1
                    if attempts >= 3:
                        conn.execute("UPDATE Users SET FailedAttempts = ?, IsLocked = 1 WHERE UserId = ? COLLATE NOCASE", (attempts, uid))
                        self.broker.publish({"type": "AUTH_LOCKED"})
                    else:
                        conn.execute("UPDATE Users SET FailedAttempts = ? WHERE UserId = ? COLLATE NOCASE", (attempts, uid))
                        self.broker.publish({"type": "AUTH_FAILED", "msg": f"Invalid password. Attempt {attempts} of 3."})

        elif msg["type"] == "RECOVERY_ATTEMPT":
            uid, rec, new_pwd = msg["userid"], msg["recovery"], msg["new_password"]
            with sqlite3.connect(self.db_name) as conn:
                cur = conn.execute("SELECT RecoveryHash FROM Users WHERE UserId = ? COLLATE NOCASE", (uid,))
                user = cur.fetchone()
                if user and self._hash(rec) == user[0]:
                    conn.execute("UPDATE Users SET PasswordHash = ?, FailedAttempts = 0, IsLocked = 0 WHERE UserId = ? COLLATE NOCASE", (self._hash(new_pwd), uid))
                    self.broker.publish({"type": "RECOVERY_SUCCESS"})
                else:
                    self.broker.publish({"type": "RECOVERY_FAILED"})

        elif msg["type"] == "RETRIEVE" and msg.get("table") == "Users":
            with sqlite3.connect(self.db_name) as conn:
                cur = conn.execute("SELECT UserId, FailedAttempts, IsLocked, Role FROM Users")
                rows = cur.fetchall()
            self.broker.publish({"type": "DATA_RETRIEVED", "columns": ("User ID", "Failed Attempts", "Account Locked", "Role"), "rows": rows})

class Postmaster:
    def __init__(self, broker):
        self.broker = broker
        self.broker.subscribe(self)
        
    def receive_message(self, msg):
        if msg["type"] == "DELIVER_CREDENTIALS":
            # In a real system, this connects to SMTP. Here we write to a secure local file as a mockup.
            try:
                with open("secure_outbox.txt", "a") as f:
                    f.write(f"--- EMAIL TO: {msg['userid']} ---\n")
                    f.write(f"Your temporary password is: {msg['password']}\n")
                    f.write(f"Your Master Recovery Key is: {msg['recovery']}\n")
                    f.write(f"KEEP THIS SAFE.\n\n")
                self.broker.publish({"type": "LOG", "msg": f"Postmaster successfully 'emailed' credentials for {msg['userid']}"})
            except Exception as e:
                self.broker.publish({"type": "LOG", "msg": f"Postmaster Error: {e}"})

# --- USER INTERFACE (Mint Factory) ---
class SystemEntryPoint(tk.Tk):
    def __init__(self, broker, scanner):
        super().__init__()
        self.broker = broker
        self.scanner = scanner
        self.broker.subscribe(self)
        
        self.session_token = None
        self.current_role = None

        self.title("Verde System Core")
        self.geometry("800x600")
        self.configure(bg="#2d2d30")
        self.withdraw() # HIDE MAIN WINDOW ON BOOT

        # Menu Bar
        self.menubar = tk.Menu(self)
        db_menu = tk.Menu(self.menubar, tearoff=0)
        db_menu.add_command(label="Mint: Add Database Entry", command=self.show_entry_form)
        db_menu.add_command(label="Mint: View Database", command=self.show_viewer_form)
        self.menubar.add_cascade(label="Database", menu=db_menu)
        
        self.config(menu=self.menubar)

        tk.Label(self, text="VERDE SYSTEM ENTRY POINT", bg="#2d2d30", fg="white", font=("Arial", 24, "bold")).pack(pady=20)
        
        self.log_text = tk.Text(self, height=10, bg="#1e1e1e", fg="cyan")
        self.log_text.pack(pady=20, padx=20, fill="both", expand=True)

        self.current_auth_window = None

    def receive_message(self, msg):
        if msg["type"] == "LOG":
            self.log_text.insert(tk.END, f"> {msg['msg']}\n")
            self.log_text.see(tk.END)
        
        elif msg["type"] == "SYS_NEEDS_SETUP":
            self.show_setup_form()
        elif msg["type"] == "SYS_NEEDS_LOGIN":
            self.show_login_form()
            
        elif msg["type"] == "SETUP_COMPLETE":
            if self.current_auth_window: self.current_auth_window.destroy()
            self.show_login_form()
            
        elif msg["type"] == "AUTH_SUCCESS":
            if self.current_auth_window: self.current_auth_window.destroy()
            self.session_token = msg["token"]
            self.current_role = msg["role"]
            
            # RBAC: Only show Admin menu if the user is an Admin
            try:
                self.menubar.delete("Admin")
            except:
                pass
                
            if self.current_role == "Admin":
                admin_menu = tk.Menu(self.menubar, tearoff=0)
                admin_menu.add_command(label="Commission New Account", command=self.show_commission_form)
                self.menubar.add_cascade(label="Admin", menu=admin_menu)
                
            self.deiconify() # REVEAL MAIN WINDOW
            
        elif msg["type"] == "AUTH_FAILED":
            messagebox.showerror("Access Denied", msg["msg"])
            
        elif msg["type"] == "AUTH_LOCKED":
            messagebox.showwarning("Account Locked", "Maximum attempts exceeded. Account is locked.")
            if self.current_auth_window: self.current_auth_window.destroy()
            self.show_recovery_form()
            
        elif msg["type"] == "RECOVERY_SUCCESS":
            messagebox.showinfo("Success", "Account unlocked and password reset! Please log in.")
            if self.current_auth_window: self.current_auth_window.destroy()
            self.show_login_form()
            
        elif msg["type"] == "RECOVERY_FAILED":
            messagebox.showerror("Error", "Invalid Recovery Key.")

    # --- SECURITY FORMS ---
    def show_setup_form(self):
        self.current_auth_window = tk.Toplevel(self)
        self.current_auth_window.title("System Setup")
        self.current_auth_window.geometry("400x350")
        self.current_auth_window.protocol("WM_DELETE_WINDOW", lambda: self.destroy())
        
        recovery_key = "VRD-" + "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(12))

        tk.Label(self.current_auth_window, text="Welcome to Verde System", font=("Arial", 14, "bold")).pack(pady=10)
        tk.Label(self.current_auth_window, text="Create Admin Account:").pack()
        
        tk.Label(self.current_auth_window, text="User ID:").pack(pady=2)
        uid_entry = tk.Entry(self.current_auth_window)
        uid_entry.pack()
        
        tk.Label(self.current_auth_window, text="Password:").pack(pady=2)
        pwd_entry = tk.Entry(self.current_auth_window, show="*")
        pwd_entry.pack()
        
        tk.Label(self.current_auth_window, text="YOUR MASTER RECOVERY KEY (SAVE THIS!):", fg="red", font=("Arial", 9, "bold")).pack(pady=(15,0))
        rec_entry = tk.Entry(self.current_auth_window, width=30, justify="center", font=("Courier", 10, "bold"))
        rec_entry.insert(0, recovery_key)
        rec_entry.config(state="readonly")
        rec_entry.pack(pady=5)

        tk.Button(self.current_auth_window, text="Complete Setup", 
                  command=lambda: self.broker.publish({"type": "CREATE_ADMIN", "userid": uid_entry.get(), "password": pwd_entry.get(), "recovery": recovery_key})).pack(pady=15)

    def show_login_form(self):
        self.current_auth_window = tk.Toplevel(self)
        self.current_auth_window.title("Authentication Required")
        self.current_auth_window.geometry("300x200")
        self.current_auth_window.protocol("WM_DELETE_WINDOW", lambda: self.destroy())
        
        tk.Label(self.current_auth_window, text="User ID:").pack(pady=5)
        uid_entry = tk.Entry(self.current_auth_window)
        uid_entry.pack()
        
        tk.Label(self.current_auth_window, text="Password:").pack(pady=5)
        pwd_entry = tk.Entry(self.current_auth_window, show="*")
        pwd_entry.pack()

        tk.Button(self.current_auth_window, text="Login", 
                  command=lambda: self.broker.publish({"type": "AUTH_ATTEMPT", "userid": uid_entry.get(), "password": pwd_entry.get()})).pack(pady=20)

    def show_recovery_form(self):
        self.current_auth_window = tk.Toplevel(self)
        self.current_auth_window.title("Account Recovery")
        self.current_auth_window.geometry("350x250")
        self.current_auth_window.protocol("WM_DELETE_WINDOW", lambda: self.destroy())
        
        tk.Label(self.current_auth_window, text="User ID:").pack(pady=2)
        uid_entry = tk.Entry(self.current_auth_window)
        uid_entry.pack()
        
        tk.Label(self.current_auth_window, text="Master Recovery Key:").pack(pady=2)
        rec_entry = tk.Entry(self.current_auth_window)
        rec_entry.pack()
        
        tk.Label(self.current_auth_window, text="New Password:").pack(pady=2)
        pwd_entry = tk.Entry(self.current_auth_window, show="*")
        pwd_entry.pack()

        tk.Button(self.current_auth_window, text="Reset & Unlock", 
                  command=lambda: self.broker.publish({"type": "RECOVERY_ATTEMPT", "userid": uid_entry.get(), "recovery": rec_entry.get(), "new_password": pwd_entry.get()})).pack(pady=15)

    def show_commission_form(self):
        form = tk.Toplevel(self)
        form.title("Commission New Account")
        form.geometry("400x350")
        
        recovery_key = "VRD-" + "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(12))

        tk.Label(form, text="Create New User Account:").pack(pady=10)
        
        tk.Label(form, text="User ID:").pack(pady=2)
        uid_entry = tk.Entry(form)
        uid_entry.pack()
        
        tk.Label(form, text="Initial Password:").pack(pady=2)
        pwd_entry = tk.Entry(form, show="*")
        pwd_entry.pack()
        
        tk.Label(form, text="USER'S RECOVERY KEY (GIVE THIS TO THEM!):", fg="red", font=("Arial", 9, "bold")).pack(pady=(15,0))
        rec_entry = tk.Entry(form, width=30, justify="center", font=("Courier", 10, "bold"))
        rec_entry.insert(0, recovery_key)
        rec_entry.config(state="readonly")
        rec_entry.pack(pady=5)

        def submit():
            u, p = uid_entry.get().strip(), pwd_entry.get().strip()
            if not u or not p:
                messagebox.showerror("Validation Error", "User ID and Password cannot be empty!")
                return
            
            # Attaching our secure Session Token to prove we are an Admin!
            self.broker.publish({"type": "COMMISSION_USER", "userid": u, "password": p, "recovery": recovery_key, "token": self.session_token})
            # Also tell the Postmaster to "email" the credentials to the new user
            self.broker.publish({"type": "DELIVER_CREDENTIALS", "userid": u, "password": p, "recovery": recovery_key})
            
            messagebox.showinfo("Success", f"User {u} commissioned successfully. Credentials sent to Postmaster.")
            form.destroy()

        tk.Button(form, text="Commission Account", command=submit).pack(pady=15)

    def show_entry_form(self):
        form = tk.Toplevel(self)
        form.title("Add Entry")
        form.geometry("300x200")
        tk.Label(form, text="Data Key:").pack(pady=5)
        key_entry = tk.Entry(form)
        key_entry.pack()
        tk.Label(form, text="Data Value:").pack(pady=5)
        val_entry = tk.Entry(form)
        val_entry.pack()
        
        def submit():
            # VALIDATION: Ensure fields are not empty before sending to DB
            k, v = key_entry.get().strip(), val_entry.get().strip()
            if not k or not v:
                messagebox.showerror("Validation Error", "Data Key and Data Value cannot be empty!")
                return
                
            self.scanner.scan_input(f"store {k} {v}")
            key_entry.delete(0, tk.END)
            val_entry.delete(0, tk.END)
            messagebox.showinfo("Success", "Data sent to storage successfully!")
            
        tk.Button(form, text="Add Data", command=submit).pack(pady=20)

    def show_viewer_form(self):
        form = tk.Toplevel(self)
        form.title("Database Viewer")
        form.geometry("600x400")
        
        control_frame = tk.Frame(form)
        control_frame.pack(fill="x", pady=5)
        
        tk.Label(control_frame, text="Select Table:").pack(side="left", padx=5)
        table_combo = ttk.Combobox(control_frame, values=["VerdeData", "Users"], state="readonly")
        table_combo.set("VerdeData")
        table_combo.pack(side="left", padx=5)
        
        tree_frame = tk.Frame(form)
        tree_frame.pack(fill="both", expand=True)
        
        tree = ttk.Treeview(tree_frame, show="headings")
        tree.pack(fill="both", expand=True)

        class ViewerSubscriber:
            def receive_message(self, msg):
                if msg["type"] == "DATA_RETRIEVED":
                    if tree.winfo_exists():
                        # Update columns dynamically
                        tree["columns"] = msg.get("columns", [])
                        for col in tree["columns"]:
                            tree.heading(col, text=col)
                            tree.column(col, width=100)
                        
                        # Clear old data and insert new rows
                        for item in tree.get_children(): tree.delete(item)
                        for row in msg.get("rows", []): tree.insert("", "end", values=row)

        sub = ViewerSubscriber()
        self.broker.subscribe(sub)
        form.protocol("WM_DELETE_WINDOW", lambda: (self.broker.unsubscribe(sub), form.destroy()))
        
        def refresh():
            self.scanner.scan_input(f"retrieve {table_combo.get()}")
            
        tk.Button(control_frame, text="Refresh", command=refresh).pack(side="left", padx=5)
        table_combo.bind("<<ComboboxSelected>>", lambda e: refresh())
        
        refresh() # Initial fetch

# --- BOOT UP ---
if __name__ == "__main__":
    broker = MessageBroker()
    scanner = ObjectScanner(broker)
    storage = StorageKeeper(broker)
    gatekeeper = GateKeeper(broker)
    postmaster = Postmaster(broker) # NEW: Start Postmaster Mail Service
    
    app = SystemEntryPoint(broker, scanner)
    
    # Trigger boot sequence
    broker.publish({"type": "CHECK_SETUP"})
    
    app.mainloop()
