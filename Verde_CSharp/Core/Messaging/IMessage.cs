using System;

namespace Verde.Core.Messaging
{
    public interface IMessage
    {
        Guid GetMessageId();
        DateTime GetTimestamp();
        string GetSenderName();
    }

    public abstract class BaseMessage : IMessage
    {
        private Guid _messageId;
        private DateTime _timestamp;
        private string _senderName;

        protected BaseMessage(string senderName)
        {
            _messageId = Guid.NewGuid();
            _timestamp = DateTime.UtcNow;
            SetSenderName(senderName);
        }

        // Getters
        public Guid GetMessageId() { return _messageId; }
        public DateTime GetTimestamp() { return _timestamp; }
        public string GetSenderName() { return _senderName; }

        // Setters
        public void SetMessageId(Guid id) { _messageId = id; }
        public void SetTimestamp(DateTime time) { _timestamp = time; }
        public void SetSenderName(string name) { _senderName = name; }
    }

    // Specific Message Types
    public class ProcessQueryMessage : BaseMessage
    {
        private string _query;

        public ProcessQueryMessage(string senderName, string query) : base(senderName)
        {
            SetQuery(query);
        }

        public string GetQuery() { return _query; }
        public void SetQuery(string query) { _query = query; }
    }

    public class QueryProcessedMessage : BaseMessage
    {
        private string _result;

        public QueryProcessedMessage(string senderName, string result) : base(senderName)
        {
            SetResult(result);
        }

        public string GetResult() { return _result; }
        public void SetResult(string result) { _result = result; }
    }

    public class UpdateUIMessage : BaseMessage
    {
        private string _targetUI;

        public UpdateUIMessage(string senderName, string targetUI) : base(senderName)
        {
            SetTargetUI(targetUI);
        }

        public string GetTargetUI() { return _targetUI; }
        public void SetTargetUI(string targetUI) { _targetUI = targetUI; }
    }

    public class AcknowledgementMessage : BaseMessage
    {
        private Guid _originalMessageId;
        private string _status;

        public AcknowledgementMessage(string senderName, Guid originalMessageId, string status) : base(senderName)
        {
            SetOriginalMessageId(originalMessageId);
            SetStatus(status);
        }

        public Guid GetOriginalMessageId() { return _originalMessageId; }
        public void SetOriginalMessageId(Guid id) { _originalMessageId = id; }

        public string GetStatus() { return _status; }
        public void SetStatus(string status) { _status = status; }
    }

    // --- Database Messages ---
    public class StoreDataMessage : BaseMessage
    {
        private string _tableName;
        private string _dataKey;
        private string _dataValue;

        public StoreDataMessage(string senderName, string tableName, string dataKey, string dataValue) : base(senderName)
        {
            SetTableName(tableName);
            SetDataKey(dataKey);
            SetDataValue(dataValue);
        }

        public string GetTableName() { return _tableName; }
        public void SetTableName(string table) { _tableName = table; }
        
        public string GetDataKey() { return _dataKey; }
        public void SetDataKey(string key) { _dataKey = key; }

        public string GetDataValue() { return _dataValue; }
        public void SetDataValue(string val) { _dataValue = val; }
    }

    public class RetrieveDataMessage : BaseMessage
    {
        private string _tableName;

        public RetrieveDataMessage(string senderName, string tableName) : base(senderName)
        {
            SetTableName(tableName);
        }

        public string GetTableName() { return _tableName; }
        public void SetTableName(string table) { _tableName = table; }
    }

    public class DataRetrievedMessage : BaseMessage
    {
        private System.Collections.Generic.List<string[]> _rows;

        public DataRetrievedMessage(string senderName, System.Collections.Generic.List<string[]> rows) : base(senderName)
        {
            SetRows(rows);
        }

        public System.Collections.Generic.List<string[]> GetRows() { return _rows; }
        public void SetRows(System.Collections.Generic.List<string[]> rows) { _rows = rows; }
    }

    // --- UI Control Messages ---
    public class LaunchFormMessage : BaseMessage
    {
        private string _formName;

        public LaunchFormMessage(string senderName, string formName) : base(senderName)
        {
            SetFormName(formName);
        }

        public string GetFormName() { return _formName; }
        public void SetFormName(string name) { _formName = name; }
    }
}
