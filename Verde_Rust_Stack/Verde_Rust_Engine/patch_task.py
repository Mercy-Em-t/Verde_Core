import os

path = r'C:\Users\user\Documents\TEmurugatCom\chatgpt_export\All_Sprints\tryphene-commercial-platform-v5-smart-project-sprint17\admin.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the button
content = content.replace(
    '<button class="text-xs font-bold text-indigo-600 hover:underline">+ Add Task</button>',
    '<button class="text-xs font-bold text-indigo-600 hover:underline" onclick="addNewTask()">+ Add Task</button>'
)

# 2. Add an ID to the task list container
content = content.replace(
    '</button>\n                        </div>\n                        <div class="space-y-2">',
    '</button>\n                        </div>\n                        <div id="generalTaskBacklogList" class="space-y-2">'
)

# 3. Add the JS function
js_code = """
    <script>
        function addNewTask() {
            const taskText = prompt("Enter new task description:");
            if (taskText && taskText.trim() !== "") {
                const list = document.getElementById('generalTaskBacklogList');
                const newLabel = document.createElement('label');
                newLabel.className = "rhythm-task cursor-pointer hover:bg-slate-50 transition-colors py-2 px-3 border border-transparent rounded";
                
                // Add the inner HTML matching the existing ones
                newLabel.innerHTML = `
                    <input type="checkbox" class="mt-1 border-slate-300 text-indigo-600 rounded focus:ring-indigo-600">
                    <span class="text-sm font-medium text-slate-600">${taskText}</span>
                `;
                
                list.appendChild(newLabel);
            }
        }
    </script>
"""

content = content.replace('</body>', js_code + '\n</body>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated admin.html")
