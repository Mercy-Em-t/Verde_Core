using System;
using System.Drawing;
using System.Windows.Forms;

namespace Verde
{
    public class MintFactory
    {
        private Verde.Core.Components.ObjectScanner _scanner;

        public MintFactory(Verde.Core.Components.ObjectScanner scanner = null)
        {
            _scanner = scanner;
        }

        public void SetScanner(Verde.Core.Components.ObjectScanner scanner)
        {
            _scanner = scanner;
        }

        public Form CreateDatabaseEntryForm()
        {
            Form form = new Form
            {
                Text = "Verde Database Entry",
                Size = new Size(400, 300),
                FormBorderStyle = FormBorderStyle.FixedDialog,
                StartPosition = FormStartPosition.CenterScreen,
                MaximizeBox = false
            };

            Label keyLabel = new Label { Text = "Data Key:", Location = new Point(20, 20), AutoSize = true };
            form.Controls.Add(keyLabel);

            TextBox keyTextBox = new TextBox { Location = new Point(20, 40), Size = new Size(340, 30) };
            form.Controls.Add(keyTextBox);

            Label valLabel = new Label { Text = "Data Value:", Location = new Point(20, 80), AutoSize = true };
            form.Controls.Add(valLabel);

            TextBox valTextBox = new TextBox { Location = new Point(20, 100), Size = new Size(340, 30) };
            form.Controls.Add(valTextBox);

            // Module for clearing inputs
            Action clearInputsModule = () =>
            {
                keyTextBox.Clear();
                valTextBox.Clear();
                keyTextBox.Focus();
            };

            Button submitBtn = new Button
            {
                Text = "Add Data to Table",
                Location = new Point(20, 150),
                Size = new Size(150, 35)
            };
            submitBtn.Click += (s, e) => 
            {
                if (_scanner != null)
                {
                    // Construct the command for the scanner
                    string command = $"store {keyTextBox.Text} {valTextBox.Text}";
                    _scanner.ScanInput(command);
                    
                    // Call the clear module
                    clearInputsModule();
                }
                else
                {
                    MessageBox.Show("Scanner not connected.", "Error");
                }
            };
            form.Controls.Add(submitBtn);

            return form;
        }

        public Form CreateIndexingOptionsForm()
        {
            Form form = new Form
            {
                Text = "Indexing Options",
                Size = new Size(450, 480),
                FormBorderStyle = FormBorderStyle.FixedDialog,
                MaximizeBox = false,
                MinimizeBox = false,
                StartPosition = FormStartPosition.CenterScreen
            };

            Label headerLabel = new Label
            {
                Text = "510,092 items indexed\n\nIndexing complete.",
                Location = new Point(70, 30),
                AutoSize = true
            };
            form.Controls.Add(headerLabel);

            PictureBox iconBox = new PictureBox
            {
                Location = new Point(20, 30),
                Size = new Size(32, 32),
                BorderStyle = BorderStyle.FixedSingle
            };
            form.Controls.Add(iconBox);

            Label listLabel = new Label
            {
                Text = "Index these locations:",
                Location = new Point(20, 100),
                AutoSize = true
            };
            form.Controls.Add(listLabel);

            ListView listView = new ListView
            {
                Location = new Point(20, 120),
                Size = new Size(390, 240),
                View = View.Details,
                FullRowSelect = true,
                GridLines = true
            };
            listView.Columns.Add("Included Locations", 200);
            listView.Columns.Add("Exclude", 180);
            
            listView.Items.Add(new ListViewItem(new[] { "Glow", "" }));
            listView.Items.Add(new ListViewItem(new[] { "Start Menu", "" }));
            listView.Items.Add(new ListViewItem(new[] { "Users", "AppData; .android; .arduinoIDE; .cache; ..." }));
            form.Controls.Add(listView);

            Button modifyButton = new Button
            {
                Text = "Modify",
                Location = new Point(20, 370),
                Size = new Size(80, 25)
            };
            form.Controls.Add(modifyButton);

            Button advancedButton = new Button
            {
                Text = "Advanced",
                Location = new Point(110, 370),
                Size = new Size(90, 25)
            };
            form.Controls.Add(advancedButton);

            Button pauseButton = new Button
            {
                Text = "Pause",
                Location = new Point(210, 370),
                Size = new Size(80, 25),
                Enabled = false
            };
            form.Controls.Add(pauseButton);

            Button closeButton = new Button
            {
                Text = "Close",
                Location = new Point(330, 400),
                Size = new Size(80, 25)
            };
            closeButton.Click += (s, e) => form.Close();
            form.Controls.Add(closeButton);

            LinkLabel howDoesItAffect = new LinkLabel
            {
                Text = "How does indexing affect searches?",
                Location = new Point(20, 400),
                AutoSize = true
            };
            form.Controls.Add(howDoesItAffect);

            LinkLabel troubleshoot = new LinkLabel
            {
                Text = "Troubleshoot search and indexing",
                Location = new Point(20, 420),
                AutoSize = true
            };
            form.Controls.Add(troubleshoot);

            return form;
        }

        public Form CreateIndexedLocationsForm()
        {
            Form form = new Form
            {
                Text = "Indexed Locations",
                Size = new Size(400, 500),
                FormBorderStyle = FormBorderStyle.FixedDialog,
                MaximizeBox = false,
                MinimizeBox = false,
                StartPosition = FormStartPosition.CenterParent
            };

            Label changeLabel = new Label
            {
                Text = "Change selected locations",
                Location = new Point(20, 20),
                AutoSize = true
            };
            form.Controls.Add(changeLabel);

            TreeView treeView = new TreeView
            {
                Location = new Point(20, 40),
                Size = new Size(340, 200),
                CheckBoxes = true
            };
            TreeNode cscNode = new TreeNode("csc://{S-1-5-21-4251...}") { Checked = true };
            TreeNode cDrive = new TreeNode("Local Disk (C:)");
            treeView.Nodes.Add(cscNode);
            treeView.Nodes.Add(cDrive);
            form.Controls.Add(treeView);

            Label summaryLabel = new Label
            {
                Text = "Summary of selected locations",
                Location = new Point(20, 260),
                AutoSize = true
            };
            form.Controls.Add(summaryLabel);

            ListView summaryListView = new ListView
            {
                Location = new Point(20, 280),
                Size = new Size(340, 140),
                View = View.Details,
                FullRowSelect = true
            };
            summaryListView.Columns.Add("Included Locations", 160);
            summaryListView.Columns.Add("Exclude", 170);
            
            summaryListView.Items.Add(new ListViewItem(new[] { "Glow", "" }));
            summaryListView.Items.Add(new ListViewItem(new[] { "Start Menu", "" }));
            summaryListView.Items.Add(new ListViewItem(new[] { "Users", "AppData; .android; .arduinoID..." }));
            form.Controls.Add(summaryListView);

            Button showAllButton = new Button
            {
                Text = "Show all locations",
                Location = new Point(20, 430),
                Size = new Size(120, 25)
            };
            form.Controls.Add(showAllButton);

            Button okButton = new Button
            {
                Text = "OK",
                Location = new Point(200, 430),
                Size = new Size(75, 25)
            };
            okButton.Click += (s, e) => form.Close();
            form.Controls.Add(okButton);

            Button cancelButton = new Button
            {
                Text = "Cancel",
                Location = new Point(285, 430),
                Size = new Size(75, 25)
            };
            cancelButton.Click += (s, e) => form.Close();
            form.Controls.Add(cancelButton);

            return form;
        }
    }
}
