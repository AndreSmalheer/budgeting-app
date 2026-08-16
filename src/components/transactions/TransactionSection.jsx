function TransactionSection({
  title,
  action,
  belowHeaderContent = null,
  emptyText,
  items,
  className = "SpendingOverview",
}) {
  return (
    <div className={className}>
      <div className="recent-transactions__header">
        <h2 className="recent-transactions__title">{title}</h2>
        {action}
      </div>

      {belowHeaderContent}

      <div className="recent-transactions">
        {items.length === 0 ? <p className="empty-state">{emptyText}</p> : items}
      </div>
    </div>
  );
}

export default TransactionSection;
