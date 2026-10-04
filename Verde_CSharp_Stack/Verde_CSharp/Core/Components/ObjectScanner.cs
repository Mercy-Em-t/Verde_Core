using System;
using Verde.Core.Messaging;

namespace Verde.Core.Components
{
    public class ObjectScanner
    {
        private MessageBroker _broker;

        public ObjectScanner(MessageBroker broker)
        {
            SetBroker(broker);
        }

        // Getter
        public MessageBroker GetBroker()
        {
            return _broker;
        }

        // Setter
        public void SetBroker(MessageBroker broker)
        {
            _broker = broker;
        }

        public void ScanInput(string rawInput)
        {
            string normalized = rawInput.Trim().ToLower();
            
            if (normalized.StartsWith("add"))
            {
                string[] parts = normalized.Split(new[] { ' ', ',' }, StringSplitOptions.RemoveEmptyEntries);
                
                if (parts.Length >= 3)
                {
                    string formattedQuery = $"ADD:{parts[1]},{parts[2]}";
                    GetBroker().Publish(new ProcessQueryMessage("ObjectScanner", formattedQuery));
                }
                else
                {
                    GetBroker().Publish(new UpdateUIMessage("ObjectScanner", "Scanner Error: Please provide two numbers"));
                }
            }
            else if (normalized.StartsWith("store"))
            {
                // Example input: "store username john_doe"
                string[] parts = rawInput.Split(new[] { ' ' }, 3, StringSplitOptions.RemoveEmptyEntries);
                
                if (parts.Length >= 3)
                {
                    string key = parts[1];
                    string value = parts[2];
                    GetBroker().Publish(new StoreDataMessage("ObjectScanner", "VerdeData", key, value));
                }
                else
                {
                    GetBroker().Publish(new UpdateUIMessage("ObjectScanner", "Scanner Error: Format must be 'store [key] [value]'"));
                }
            }
            else if (normalized.StartsWith("retrieve"))
            {
                GetBroker().Publish(new RetrieveDataMessage("ObjectScanner", "VerdeData"));
            }
            else
            {
                GetBroker().Publish(new UpdateUIMessage("ObjectScanner", $"Scanner: Unknown command '{rawInput}'"));
            }
        }
    }
}
