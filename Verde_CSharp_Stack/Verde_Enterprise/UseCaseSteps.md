# Verde Enterprise: Use Case Steps with Elements, Inputs, and Outputs

This document breaks down the major use cases of the Verde System. For each step, the specific architectural element (component) executing the action is identified, along with the exact input it receives and the output it produces.

## Use Case 1: User Submits a Command
**Goal:** Submit raw input to the system for processing (e.g., "add 5 10").

*   **Step 1**
    *   **Element:** Interface (`SystemEntryPoint`)
    *   **Input:** User keystrokes or UI interactions (e.g., raw text "add 5 10").
    *   **Output:** Raw text string.
*   **Step 2**
    *   **Element:** `ObjectScanner`
    *   **Input:** Raw text string from the Interface.
    *   **Output:** Parsed and validated command tokens.
*   **Step 3**
    *   **Element:** `ObjectScanner`
    *   **Input:** Parsed command tokens.
    *   **Output:** A newly instantiated `ProcessQueryMessage` object (e.g., `ADD:5,10`).
*   **Step 4**
    *   **Element:** `MessageBroker`
    *   **Input:** The `ProcessQueryMessage` published by the ObjectScanner.
    *   **Output:** The message is routed to all components subscribed to query events.

## Use Case 2: System Processes a Query
**Goal:** Execute business logic based on a structured system query.

*   **Step 1**
    *   **Element:** `QueryProcessor`
    *   **Input:** `ProcessQueryMessage` routed by the MessageBroker.
    *   **Output:** Extraction of the query payload (e.g., extracting the integers `5` and `10`).
*   **Step 2**
    *   **Element:** `QueryProcessor`
    *   **Input:** Extracted query payload.
    *   **Output:** Computed business logic result (e.g., calculating the sum `15`).
*   **Step 3**
    *   **Element:** `QueryProcessor`
    *   **Input:** Computed business logic result.
    *   **Output:** Two newly instantiated messages published to the MessageBroker: an `AcknowledgementMessage` (confirming successful execution) and a `QueryProcessedMessage` (containing the final result).

## Use Case 3: Display Results / Update UI
**Goal:** Present processed data or errors back to the User.

*   **Step 1**
    *   **Element:** Interface (`SystemEntryPoint`)
    *   **Input:** `QueryProcessedMessage` or `UpdateUIMessage` routed by the MessageBroker.
    *   **Output:** Extraction of the display payload (the text or data meant for the user).
*   **Step 2**
    *   **Element:** Interface (`SystemEntryPoint`)
    *   **Input:** Extracted display payload.
    *   **Output:** Visual update rendered on the user's screen (e.g., modifying a Label or Console text).

## Use Case 4: Persist State (Database Interaction)
**Goal:** Securely save data to the system's database.

*   **Step 1**
    *   **Element:** Domain Keeper (e.g., `AuditKeeper` or `BillingKeeper`)
    *   **Input:** Internal application state changes that require saving.
    *   **Output:** A newly instantiated `StoreDataMessage` published to the MessageBroker.
*   **Step 2**
    *   **Element:** `GateKeeper`
    *   **Input:** The `StoreDataMessage` routed by the MessageBroker.
    *   **Output:** Validation check (Pass/Fail). If Pass, it outputs a validated routing message aimed at the StorageKeeper.
*   **Step 3**
    *   **Element:** `StorageKeeper`
    *   **Input:** Validated routing message from the GateKeeper.
    *   **Output:** Data bytes written to the physical database system.
*   **Step 4**
    *   **Element:** `StorageKeeper`
    *   **Input:** Confirmation of successful database write operation.
    *   **Output:** An `AcknowledgementMessage` published to the MessageBroker, confirming the data was saved.
