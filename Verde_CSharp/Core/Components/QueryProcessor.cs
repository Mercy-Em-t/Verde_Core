using System;
using Verde.Core.Messaging;

namespace Verde.Core.Components
{
    public class QueryProcessor : IMessageSubscriber
    {
        private MessageBroker _broker;

        public QueryProcessor(MessageBroker broker)
        {
            SetBroker(broker);
            GetBroker().Subscribe(this);
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

        public void ReceiveMessage(IMessage message)
        {
            if (message is ProcessQueryMessage queryMsg)
            {
                Process(queryMsg);
            }
        }

        private void Process(ProcessQueryMessage msg)
        {
            string query = msg.GetQuery();
            if (query.StartsWith("ADD:"))
            {
                try
                {
                    string[] parts = query.Substring(4).Split(',');
                    if (parts.Length == 2 && 
                        int.TryParse(parts[0], out int a) && 
                        int.TryParse(parts[1], out int b))
                    {
                        int sum = a + b;
                        
                        GetBroker().Publish(new AcknowledgementMessage("QueryProcessor", msg.GetMessageId(), "Success"));
                        GetBroker().Publish(new QueryProcessedMessage("QueryProcessor", $"Result of {a} + {b} = {sum}"));
                    }
                }
                catch
                {
                    GetBroker().Publish(new AcknowledgementMessage("QueryProcessor", msg.GetMessageId(), "Error parsing numbers"));
                }
            }
        }
    }
}
