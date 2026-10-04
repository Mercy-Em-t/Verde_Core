using System;
using System.Drawing;
using System.Windows.Forms;
using System.Collections.Generic;
using Verde.Core.Messaging;

namespace Verde
{
    public class DatabaseViewerForm : Form, IMessageSubscriber
    {
        private MessageBroker _broker;
        private Verde.Core.Components.ObjectScanner _scanner;
        private DataGridView _dataGrid;
        
        // Storing the data in an array/list behind the scenes
        private List<string[]> _dataArray;

        public DatabaseViewerForm(MessageBroker broker, Verde.Core.Components.ObjectScanner scanner)
        {
            _broker = broker;
            _scanner = scanner;
            _dataArray = new List<string[]>();
            _broker.Subscribe(this);

            this.Text = "Database Viewer - Interactive Table";
            this.Size = new Size(500, 400);
            this.StartPosition = FormStartPosition.CenterScreen;

            Button refreshBtn = new Button
            {
                Text = "Refresh Data",
                Location = new Point(20, 20),
                Size = new Size(120, 30)
            };
            refreshBtn.Click += (s, e) => _scanner.ScanInput("retrieve");
            this.Controls.Add(refreshBtn);

            // Programmable Table (DataGridView)
            _dataGrid = new DataGridView
            {
                Location = new Point(20, 60),
                Size = new Size(440, 280),
                ReadOnly = true,
                SelectionMode = DataGridViewSelectionMode.FullRowSelect,
                AllowUserToAddRows = false,
                RowHeadersVisible = false
            };
            
            // Define Table Columns
            _dataGrid.Columns.Add("ID", "ID");
            _dataGrid.Columns.Add("Key", "Key");
            _dataGrid.Columns.Add("Value", "Value");
            _dataGrid.Columns.Add("Timestamp", "Timestamp");
            
            // Respond to Mouse Clicks/Events
            _dataGrid.CellClick += (s, e) => 
            {
                if (e.RowIndex >= 0)
                {
                    string clickedKey = _dataArray[e.RowIndex][1];
                    string clickedVal = _dataArray[e.RowIndex][2];
                    MessageBox.Show($"You clicked on Key: {clickedKey}\nValue: {clickedVal}", "Table Event Triggered");
                }
            };

            this.Controls.Add(_dataGrid);

            // Fetch data immediately upon opening
            _scanner.ScanInput("retrieve");
        }

        public void ReceiveMessage(IMessage message)
        {
            if (message is DataRetrievedMessage dataMsg)
            {
                if (this.InvokeRequired)
                {
                    this.Invoke(new Action(() => UpdateTable(dataMsg.GetRows())));
                }
                else
                {
                    UpdateTable(dataMsg.GetRows());
                }
            }
        }

        private void UpdateTable(List<string[]> rows)
        {
            // Store data in our local array structure
            _dataArray = rows;
            
            // Clear and repopulate the programmable table
            _dataGrid.Rows.Clear();
            foreach (var rowArray in _dataArray)
            {
                _dataGrid.Rows.Add(rowArray);
            }
        }
    }
}
