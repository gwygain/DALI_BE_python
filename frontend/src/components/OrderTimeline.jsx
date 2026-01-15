const OrderTimeline = ({ history }) => {
  if (!history || history.length === 0) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      PROCESSING: 'processing',
      PREPARING_FOR_SHIPMENT: 'processing',
      IN_TRANSIT: 'shipped',
      DELIVERED: 'delivered',
      COLLECTED: 'collected',
      CANCELLED: 'cancelled',
      DELIVERY_FAILED: 'cancelled',
    };
    return statusMap[status] || 'processing';
  };

  return (
    <div className="timeline-container">
      <h3 className="timeline-header">Order History</h3>
      <ul className="timeline">
        {history.map((item, index) => (
          <li key={index} className="timeline-item">
            <div className={`timeline-dot ${getStatusClass(item.status)}`}></div>
            <div className="timeline-content">
              <p className="timeline-description">{item.status}</p>
              <p className="timeline-timestamp">{formatDate(item.event_timestamp)}</p>
              {item.notes && <p className="timeline-notes">{item.notes}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderTimeline;
