# Verde Enterprise: Event-Response Report

Based on the transcript's message-driven (Actor Model) architecture, this report outlines the system's core Event-Response cycles. In this system, "Events" are defined as published messages, and "Responses" are the subsequent messages emitted by the listening components.

## Core Message Definitions (The Events)
- **`UserActionMessage`**: Triggered by user interaction in the UI.
- **`ProcessQueryMessage`**: A structured command routed to a processor (e.g., adding numbers, fetching data).
- **`QueryProcessedMessage`**: The result data returned after a query finishes.
- **`UpdateUIMessage`**: A command to change the UI state or display an error.
- **`AcknowledgementMessage`**: A receipt indicating a component successfully received or failed to parse a message.
- **`StoreDataMessage` / `RetrieveDataMessage`**: Directed specifically at the StorageKeeper.

---

## 1. User Input Cycle
**Event:** User types a command (e.g., "add 5 10") into the Interface and submits.
**Responses:**
*   **Interface (SystemEntryPoint)** emits a raw input event to the `ObjectScanner`.
*   **ObjectScanner (Success)** parses it and emits a `ProcessQueryMessage` (e.g., `ADD:5,10`) to the MessageBroker.
*   **ObjectScanner (Failure)** fails to parse it and emits an `UpdateUIMessage` containing an error to the MessageBroker.

## 2. Processing Cycle (QueryProcessor)
**Event:** The MessageBroker routes a `ProcessQueryMessage` to the `QueryProcessor`.
**Responses:**
*   **QueryProcessor (Immediate)** emits an `AcknowledgementMessage` (Status: Success or Error) back to the broker to confirm receipt/parsing.
*   **QueryProcessor (Execution)** processes the business logic (e.g., adding the numbers) and emits a `QueryProcessedMessage` containing the result.

## 3. Database Interaction Cycle (StorageKeeper)
**Event:** A domain keeper or processor emits a `StoreDataMessage` or `RetrieveDataMessage`.
**Responses:**
*   **GateKeeper (Intercept)** intercepts the message, validates permissions, and either passes it along or emits an `AcknowledgementMessage` (Error).
*   **StorageKeeper (Success - Write)** persists the data and emits an `AcknowledgementMessage` (Success).
*   **StorageKeeper (Success - Read)** retrieves the data and emits a `QueryProcessedMessage` with the payload.

## 4. UI Update Cycle
**Event:** The MessageBroker routes an `UpdateUIMessage` or `QueryProcessedMessage` to the `SystemEntryPoint` (Interface).
**Responses:**
*   **Interface** listens to the broker, receives the message, and updates the visible desktop overlay or Tray Icon (e.g., displaying the sum of the numbers or an error message).

---

## Summary of the First Response Rule
The system strictly dictates that **objects never directly respond to each other's method calls**. The *first response* to any action is always a message published back to the `MessageBroker`. This ensures maximum decoupling and allows the `GateKeeper` or `AuditKeeper` to passively listen to all events and responses without modifying the core logic.
