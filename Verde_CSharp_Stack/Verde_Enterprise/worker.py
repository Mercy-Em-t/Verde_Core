import time
from broker import RedisBroker
from gatekeeper import GateKeeper
from storagekeeper import StorageKeeper

print("=========================================")
print("   Starting Verde Enterprise WORKER      ")
print("=========================================")

broker = RedisBroker()

db_params = {
    "user": "verde_admin",
    "password": "verde_password",
    "database": "verde_db",
    "host": "127.0.0.1",
    "port": 5455
}

# The Keepers now live entirely in this standalone worker process
print("Initializing GateKeeper...")
gatekeeper = GateKeeper(broker, db_params)

print("Initializing StorageKeeper...")
storagekeeper = StorageKeeper(broker, db_params)

from statemachine import StateMachineManager
print("Initializing StateMachineManager...")
statemachine = StateMachineManager(broker, db_params)

from vaultkeeper import VaultKeeper
print("Initializing VaultKeeper...")
vaultkeeper = VaultKeeper(broker)

from communicationkeeper import CommunicationKeeper
print("Initializing CommunicationKeeper...")
communicationkeeper = CommunicationKeeper(broker)

from billingkeeper import BillingKeeper
print("Initializing BillingKeeper...")
billingkeeper = BillingKeeper(broker, db_params)

from auditkeeper import AuditKeeper
print('Initializing AuditKeeper...')
auditkeeper = AuditKeeper(broker, db_params)

print("Worker is now listening to Redis for tasks. Press CTRL+C to exit.")
while True:
    time.sleep(1)
