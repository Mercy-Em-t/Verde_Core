import os

file_path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\operations-backlog.md'

with open(file_path, 'a', encoding='utf-8') as f:
    f.write("\n## 4. Client Onboarding\n*   **Client Kickoff Session:** Design the post-signing orientation meeting agenda to ensure the client feels in control without being overwhelmed.\n")

print("Added Client Kickoff to backlog")
