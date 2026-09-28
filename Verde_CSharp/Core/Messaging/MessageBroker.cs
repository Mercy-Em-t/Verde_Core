using System.Collections.Generic;

namespace Verde.Core.Messaging
{
    public interface IMessageSubscriber
    {
        void ReceiveMessage(IMessage message);
    }

    public class MessageBroker
    {
        private List<IMessageSubscriber> _subscribers;

        public MessageBroker()
        {
            _subscribers = new List<IMessageSubscriber>();
        }

        // Getter
        public List<IMessageSubscriber> GetSubscribers()
        {
            return _subscribers;
        }

        // Setter
        public void SetSubscribers(List<IMessageSubscriber> subscribers)
        {
            _subscribers = subscribers;
        }

        public void Subscribe(IMessageSubscriber subscriber)
        {
            if (!_subscribers.Contains(subscriber))
            {
                _subscribers.Add(subscriber);
            }
        }

        public void Publish(IMessage message)
        {
            foreach (var subscriber in _subscribers)
            {
                subscriber.ReceiveMessage(message);
            }
        }
    }
}
