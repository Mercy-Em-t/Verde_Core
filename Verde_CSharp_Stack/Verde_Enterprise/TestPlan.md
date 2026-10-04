# Verde Enterprise Test Plans

Based on the message-driven (Actor Model) architecture established in the previous design sessions, the system relies on fully decoupled components communicating exclusively via asynchronous messages.

The components under test include:
- **MessageBroker (`broker.py`)**: The central nervous system routing messages.
- **GateKeeper (`gatekeeper.py`)**: Middleware for security and message validation.
- **StorageKeeper (`storagekeeper.py`)**: The persistent state manager and database interface.
- **Other Keepers (`auditkeeper.py`, `billingkeeper.py`, `vaultkeeper.py`)**: Various domain-specific processors.
- **System Entry Point (`main_api.py`)**: The interface and API gateway.

---

## 1. Feature Branch Test Plan

The Feature Branch Test Plan focuses on unit-testing individual components in isolation. Because of the decoupled architecture, we can test each component by mocking the `MessageBroker` and asserting that the component emits the correct messages in response to simulated inputs.

### 1.1 MessageBroker Tests
- **Subscription Testing:** Verify that subscribers (Keepers) can successfully register to specific message types.
- **Routing Testing:** Dispatch a mock `ProcessQueryMessage` and assert that only the subscribed `QueryProcessor` or specific Keeper receives it.
- **Unhandled Messages:** Send an unregistered message type and verify that the broker logs the event without crashing.

### 1.2 ObjectScanner & Interface Tests
- **Input Parsing (Happy Path):** Pass a valid input (e.g., "add 5 10") to the scanner and assert it correctly formats and publishes a `ProcessQueryMessage` to the broker.
- **Input Parsing (Error Handling):** Pass invalid commands (e.g., "add a b") and assert it publishes an `UpdateUIMessage` containing an error prompt.

### 1.3 GateKeeper Tests
- **Validation (Valid Payload):** Send a valid message simulating a client request. Assert the GateKeeper publishes a validated routing message and an `AcknowledgementMessage`.
- **Validation (Invalid Payload):** Send a malformed message. Assert the GateKeeper rejects it and publishes an error message back to the sender.

### 1.4 StorageKeeper Tests
- **Data Persistence:** Publish a `StoreDataMessage`. Assert the StorageKeeper successfully writes to the mocked database and publishes a success `AcknowledgementMessage`.
- **Data Retrieval:** Publish a `RetrieveDataMessage`. Assert the StorageKeeper fetches the mocked data and publishes a `QueryProcessedMessage` with the payload.

### 1.5 QueryProcessor / Domain Keepers Tests
- **Execution:** Publish a specific command message to a domain keeper. Assert that it executes the correct business logic and publishes the resulting data back to the broker.

---

## 2. Integration Test (IT) Plan

The Integration Test Plan ensures that the full pipeline operates correctly from the entry point to the database and back. The goal is to verify that messages traverse the system correctly without direct component coupling.

### IT Scenario 1: End-to-End User Action
**Objective:** Verify that a user action flows from the API/UI through the GateKeeper to the Processor and StorageKeeper, ending with an acknowledgement.
1. **Trigger:** Send a request to the `main_api.py` endpoint representing a new user action.
2. **Step 1:** Assert `main_api` correctly publishes the raw `UserActionMessage` to the `MessageBroker`.
3. **Step 2:** Assert the `GateKeeper` intercepts, validates, and forwards it to the target domain Keeper.
4. **Step 3:** Assert the domain Keeper processes the logic and publishes a `StoreDataMessage`.
5. **Step 4:** Assert the `StorageKeeper` persists the data and acknowledges success.
6. **Result:** The system should eventually publish an `UpdateUIMessage` to the API indicating the action was fully processed.

### IT Scenario 2: Error Propagation
**Objective:** Verify that when a downstream component fails, the error message correctly routes back to the interface.
1. **Trigger:** Send a valid request to `main_api.py`.
2. **Step 1:** Force the `StorageKeeper` database connection to fail (mocked exception).
3. **Step 2:** Assert the `StorageKeeper` publishes an `AcknowledgementMessage` containing a failure status.
4. **Step 3:** Assert the `MessageBroker` routes this failure back up the chain.
5. **Result:** The `main_api.py` should receive an error message and return an appropriate HTTP 500 or error prompt to the client.

### IT Scenario 3: Broker Load & Concurrency
**Objective:** Verify that the asynchronous message passing holds up under concurrent load.
1. **Trigger:** Simulate 50 concurrent requests hitting the `ObjectScanner` or `main_api.py`.
2. **Validation:** Ensure all 50 inputs are parsed and published as individual messages.
3. **Validation:** Verify that `GateKeeper` and `StorageKeeper` process the messages without deadlocks, and that exactly 50 acknowledgements are received by the interface.

---

## Execution Strategy
- **Frameworks:** Python `pytest` for unit testing the feature branch. `pytest-asyncio` for integration tests to handle asynchronous broker messages.
- **Mocking:** `unittest.mock` to mock the MessageBroker in unit tests.
- **CI/CD:** Run Feature Branch tests on every push. Run the IT plan automatically upon Pull Request creation.
