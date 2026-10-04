# Verde Operations: System Test Directory

This directory serves as the master record for all manual and automated testing protocols within the Verde architecture. As we build out the ecosystem, we will log the strict Standard Operating Procedures (SOPs) for verifying that each module functions exactly as designed.

## Active Test Protocols

### 1. [TEST-001] Lead-to-Project Commissioning Engine
**Objective:** Verify that a `Qualified` lead is successfully converted into a Project, provisioning a secure Client Portal and locking Phase 1 in `STAGING` mode.

**Execution Steps:**
1. Log into the Admin Dashboard (`admin.html`) using `admin` / `password`.
2. Ensure you have at least one Lead in the `Qualified` state (e.g., Charlie Brown). If not, navigate to Leads and qualify one.
3. On the main Dashboard, click **"+ Instantiate Project"**.
4. In the modal, select the Qualified Lead from the dropdown.
5. Select **"Phase 1: Discovery & Viability Audit"** as the starting template.
6. Click **Execute Project Conversion**.
7. **Expected Result:** A success alert should appear with the new Project ID. The page will reload.
8. Navigate to the **Projects** tab (or `admin-project-detail.html?id=<New_Project_ID>`).
9. **Verification:**
   * The Project state should be `ONBOARDING`.
   * Phase 1 should appear under "Commissioned Phases".
   * The Phase State should clearly display a strict **STAGING** badge.
   * The UI should list "Signed Master Services Agreement" as a required input.

---

### 2. [TEST-002] Cold Storage Account Recovery (Gatekeeper)
**Objective:** Verify that an administrator who is locked out due to maximum failed attempts can reset their account using the offline physical recovery key.

**Execution Steps:**
1. Go to `login.html` and purposefully enter the wrong password for the `admin` account 3 times to trigger the `AUTH_LOCKED` guardrail.
2. Navigate to `recover.html`.
3. Enter Email: `admin`
4. Enter Recovery Key: `recovery123` (The default DB seed).
5. Enter a new password: `password`
6. Click **Execute Decryption**.
7. **Expected Result:** The system should accept the hash, reset the `FailedAttempts` counter to 0, unlock the account, update the password hash, and redirect to the login page.

---

### 3. [TEST-003] Gentle Reject Pipeline
**Objective:** Ensure that unqualified leads are professionally archived without hard-deleting their data.

**Execution Steps:**
1. Navigate to the **Leads & Clients** dashboard.
2. Select a Lead in the `New` or `In Review` state.
3. Open the **Client Request Profile** diagnostic tool.
4. Click **"Reject & Mark Lost"**.
5. **Expected Result:** The lead disappears from the active pipeline and correctly maps into the "Rejected / Lost" tab, maintaining its data integrity for future audits.
