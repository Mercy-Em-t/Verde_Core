using System;
using System.Drawing;
using System.Windows.Forms;

namespace Verde
{
    public class SystemEntryPoint : Form, Verde.Core.Messaging.IMessageSubscriber
    {
        private MintFactory _factory;
        private NotifyIcon _trayIcon;
        private Verde.Core.Messaging.MessageBroker _broker;
        private Verde.Core.Components.ObjectScanner _scanner;
        private Verde.Core.Components.QueryProcessor _queryProcessor;
        private Label _outputConsole;

        public SystemEntryPoint()
        {
            // Initialize Core Architecture First
            _broker = new Verde.Core.Messaging.MessageBroker();
            _broker.Subscribe(this); // UI listens to the broker
            _queryProcessor = new Verde.Core.Components.QueryProcessor(_broker);
            _scanner = new Verde.Core.Components.ObjectScanner(_broker);
            
            // Initialize the Database Keeper
            Verde.Core.Components.StorageKeeper storageKeeper = new Verde.Core.Components.StorageKeeper(_broker);

            // Now initialize Factory with the scanner
            _factory = new MintFactory(_scanner);

            // Setup as Fullscreen Borderless Background
            this.Text = "Verde System Core";
            this.FormBorderStyle = FormBorderStyle.None;
            this.WindowState = FormWindowState.Maximized;
            this.BackColor = Color.FromArgb(20, 20, 20);
            this.ForeColor = Color.White;
            this.ShowInTaskbar = false;
            this.SendToBack();

            Label titleLabel = new Label
            {
                Text = "VERDE SYSTEM ENTRY POINT",
                Font = new Font("Segoe UI", 24, FontStyle.Bold),
                AutoSize = true,
                Location = new Point(50, 50)
            };
            this.Controls.Add(titleLabel);

            Label statusLabel = new Label
            {
                Text = "System Running Behind Yours. Standing by.",
                Font = new Font("Segoe UI", 12),
                AutoSize = true,
                Location = new Point(50, 100),
                ForeColor = Color.LightGreen
            };
            this.Controls.Add(statusLabel);
            
            // --- NEW: Object Scanner UI ---
            Label promptLabel = new Label
            {
                Text = "Scanner Input (Try 'add 5 10'):",
                Font = new Font("Segoe UI", 10),
                AutoSize = true,
                Location = new Point(50, 150)
            };
            this.Controls.Add(promptLabel);

            TextBox inputTextBox = new TextBox
            {
                Location = new Point(50, 180),
                Size = new Size(300, 30),
                Font = new Font("Segoe UI", 12),
                BackColor = Color.FromArgb(40, 40, 40),
                ForeColor = Color.White
            };
            this.Controls.Add(inputTextBox);

            Button scanBtn = new Button
            {
                Text = "Scan Input",
                Location = new Point(360, 178),
                Size = new Size(100, 32),
                BackColor = Color.FromArgb(60, 60, 60),
                FlatStyle = FlatStyle.Flat
            };
            scanBtn.Click += (s, e) => 
            {
                // UI directly feeds the scanner, then clears the box
                _scanner.ScanInput(inputTextBox.Text);
                inputTextBox.Clear();
            };
            this.Controls.Add(scanBtn);

            _outputConsole = new Label
            {
                Text = "> Waiting for messages...",
                Font = new Font("Consolas", 12),
                AutoSize = true,
                Location = new Point(50, 230),
                ForeColor = Color.Cyan
            };
            this.Controls.Add(_outputConsole);
            // --------------------------------

            // --- NEW: System Menu Bar ---
            MenuStrip menuBar = new MenuStrip();
            menuBar.BackColor = Color.FromArgb(45, 45, 48);
            menuBar.ForeColor = Color.White;

            // System Menu
            ToolStripMenuItem systemMenu = new ToolStripMenuItem("System");
            systemMenu.DropDownItems.Add("Exit", null, (s, e) => Application.Exit());
            
            // Database Menu
            ToolStripMenuItem dbMenu = new ToolStripMenuItem("Database");
            dbMenu.DropDownItems.Add("Add Entry", null, (s, e) => _broker.Publish(new Verde.Core.Messaging.LaunchFormMessage("MenuBar", "DatabaseEntry")));
            dbMenu.DropDownItems.Add("View Table", null, (s, e) => _broker.Publish(new Verde.Core.Messaging.LaunchFormMessage("MenuBar", "DatabaseViewer")));

            // Tools Menu
            ToolStripMenuItem toolsMenu = new ToolStripMenuItem("Tools");
            toolsMenu.DropDownItems.Add("Indexing Options", null, (s, e) => _broker.Publish(new Verde.Core.Messaging.LaunchFormMessage("MenuBar", "IndexingOptions")));

            menuBar.Items.Add(systemMenu);
            menuBar.Items.Add(dbMenu);
            menuBar.Items.Add(toolsMenu);
            this.MainMenuStrip = menuBar;
            this.Controls.Add(menuBar);
            // --------------------------------

            // Tray Icon Setup
            _trayIcon = new NotifyIcon
            {
                Icon = SystemIcons.Application,
                Visible = true,
                Text = "Verde System Core"
            };

            ContextMenuStrip trayMenu = new ContextMenuStrip();
            trayMenu.Items.Add("Mint: Add Database Entry", null, (s, e) => _broker.Publish(new Verde.Core.Messaging.LaunchFormMessage("Tray", "DatabaseEntry")));
            trayMenu.Items.Add("Mint: Database Viewer", null, (s, e) => _broker.Publish(new Verde.Core.Messaging.LaunchFormMessage("Tray", "DatabaseViewer")));
            trayMenu.Items.Add("Mint: Indexing Options", null, (s, e) => _broker.Publish(new Verde.Core.Messaging.LaunchFormMessage("Tray", "IndexingOptions")));
            trayMenu.Items.Add("-");
            trayMenu.Items.Add("Toggle Background", null, (s, e) => { this.Visible = !this.Visible; });
            trayMenu.Items.Add("Exit System", null, (s, e) => Application.Exit());

            _trayIcon.ContextMenuStrip = trayMenu;
            this.FormClosing += (s, e) => _trayIcon.Dispose();
        }

        public void ReceiveMessage(Verde.Core.Messaging.IMessage message)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new Action(() => ProcessReceivedMessage(message)));
            }
            else
            {
                ProcessReceivedMessage(message);
            }
        }

        private void ProcessReceivedMessage(Verde.Core.Messaging.IMessage message)
        {
            if (message is Verde.Core.Messaging.QueryProcessedMessage resultMsg)
            {
                _outputConsole.Text = $"> [MESSENGER] {resultMsg.GetResult()}";
            }
            else if (message is Verde.Core.Messaging.UpdateUIMessage uiMsg)
            {
                _outputConsole.Text = $"> [SCANNER] {uiMsg.GetTargetUI()}";
            }
            else if (message is Verde.Core.Messaging.LaunchFormMessage launchMsg)
            {
                // The UI Controller decides how to map form names to actual forms
                string formName = launchMsg.GetFormName();
                if (formName == "DatabaseEntry") _factory.CreateDatabaseEntryForm().Show();
                else if (formName == "DatabaseViewer") new DatabaseViewerForm(_broker, _scanner).Show();
                else if (formName == "IndexingOptions") _factory.CreateIndexingOptionsForm().Show();
            }
        }
    }
}
