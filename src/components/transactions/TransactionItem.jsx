import { LucideIcon } from "../../utils/icons";
import { formatCurrency } from "../../utils/formatters";

function TransactionItem({
  description,
  meta,
  amount,
  isExpense,
  iconName,
  statusLabel = "",
  statusTone = "approved",
  action = null,
  className = "transaction",
}) {
  const shortMeta = meta.replace(/\s+Volgende uitvoering\s+/, " ");
  const frequency = statusLabel.includes("Dagelijks")
    ? "Dagelijks"
    : statusLabel.includes("Maandelijks")
      ? "Maandelijks"
      : statusLabel;
  const isRecurring = statusTone === "scheduled";
  const showStatus = statusLabel && !isRecurring && statusTone !== "approved";

  return (
    <div className={className}>
      <div className="transaction__icon">
        <LucideIcon
          name={iconName}
          size={19}
          strokeWidth={2.2}
        />
      </div>

      <div className="transaction__info">
        <p className="transaction__name">{description}</p>
        <div className="transaction__meta-row">
          <p className="transaction__meta">{shortMeta}</p>
          {isRecurring && frequency && (
            <span className="transaction__category">{frequency}</span>
          )}
          {showStatus && (
            <span className={`transaction__status transaction__status--${statusTone}`}>
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      <span
        className={`transaction__amount ${isExpense ? "negative" : "positive"}`}
      >
        {isExpense ? "-" : "+"}
        {formatCurrency(Math.abs(amount))}
      </span>

      {action}
    </div>
  );
}

export default TransactionItem;
