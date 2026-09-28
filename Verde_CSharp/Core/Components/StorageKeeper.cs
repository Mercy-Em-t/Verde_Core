using System;
using Microsoft.Data.Sqlite;
using Verde.Core.Messaging;

namespace Verde.Core.Components
{
    public class StorageKeeper : IMessageSubscriber
    {
        private MessageBroker _broker;
        private string _connectionString;

        public StorageKeeper(MessageBroker broker)
        {
            SetBroker(broker);
            SetConnectionString("Data Source=verde_system.db");
            
            InitializeDatabase();
            
            GetBroker().Subscribe(this);
        }

        // Getters
        public MessageBroker GetBroker() { return _broker; }
        public string GetConnectionString() { return _connectionString; }

        // Setters
        public void SetBroker(MessageBroker broker) { _broker = broker; }
        public void SetConnectionString(string connectionString) { _connectionString = connectionString; }

        private void InitializeDatabase()
        {
            // Guide the computer on how data is organized (Schema definition)
            using (var connection = new SqliteConnection(GetConnectionString()))
            {
                connection.Open();

                var command = connection.CreateCommand();
                command.CommandText = @"
                    CREATE TABLE IF NOT EXISTS VerdeData (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        DataKey TEXT NOT NULL,
                        DataValue TEXT NOT NULL,
                        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                ";
                command.ExecuteNonQuery();
            }
        }

        public void ReceiveMessage(IMessage message)
        {
            if (message is StoreDataMessage storeMsg)
            {
                StoreData(storeMsg);
            }
            else if (message is RetrieveDataMessage retrieveMsg)
            {
                RetrieveData(retrieveMsg);
            }
        }

        private void RetrieveData(RetrieveDataMessage msg)
        {
            try
            {
                var rows = new System.Collections.Generic.List<string[]>();
                // Explicitly opening a new connection to ensure we get the most recent data
                using (var connection = new SqliteConnection(GetConnectionString()))
                {
                    connection.Open();
                    var command = connection.CreateCommand();
                    command.CommandText = $"SELECT Id, DataKey, DataValue, Timestamp FROM {msg.GetTableName()}";
                    
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            rows.Add(new string[] 
                            { 
                                reader.GetInt32(0).ToString(), 
                                reader.GetString(1), 
                                reader.GetString(2), 
                                reader.GetString(3) 
                            });
                        }
                    }
                }
                GetBroker().Publish(new DataRetrievedMessage("StorageKeeper", rows));
            }
            catch (Exception ex)
            {
                GetBroker().Publish(new AcknowledgementMessage("StorageKeeper", msg.GetMessageId(), $"Retrieve Error: {ex.Message}"));
            }
        }

        private void StoreData(StoreDataMessage msg)
        {
            try
            {
                using (var connection = new SqliteConnection(GetConnectionString()))
                {
                    connection.Open();

                    var command = connection.CreateCommand();
                    command.CommandText = @"
                        INSERT INTO VerdeData (DataKey, DataValue) 
                        VALUES ($key, $value);
                    ";
                    command.Parameters.AddWithValue("$key", msg.GetDataKey());
                    command.Parameters.AddWithValue("$value", msg.GetDataValue());
                    
                    command.ExecuteNonQuery();
                }

                // Acknowledge success back to the broker
                GetBroker().Publish(new AcknowledgementMessage("StorageKeeper", msg.GetMessageId(), "Data Stored Successfully"));
                GetBroker().Publish(new QueryProcessedMessage("StorageKeeper", $"Stored Key: {msg.GetDataKey()}"));
            }
            catch (Exception ex)
            {
                GetBroker().Publish(new AcknowledgementMessage("StorageKeeper", msg.GetMessageId(), $"Database Error: {ex.Message}"));
            }
        }
    }
}
