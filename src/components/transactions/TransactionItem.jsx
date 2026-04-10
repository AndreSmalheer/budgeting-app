import { LucideIcon } from "../../utils/icons";
import { formatCurrency } from "../../utils/formatters";

function TransactionItem({
  description,
  meta,
  amount,
  isExpense,
  iconName,
  categoryLabel = "",
  statusLabel = "",
  statusTone = "approved",
  action = null,
  className = "transaction",
}) {
  return (
    <div className={className}>
      <div
        className="transaction__icon"
        style={{
          background: "#E1F5EE",
          borderColor: "transparent",
          boxShadow: "0 12px 24px rgba(10, 16, 28, 0.14)",
        }}
      >
        <LucideIcon
          name={iconName}
          size={19}
          strokeWidth={2.2}
          color="#111111"
        />
      </div>

      <div className="transaction__info">
        <p className="transaction__name">{description}</p>
        <div className="transaction__meta-row">
          <p className="transaction__meta">{meta}</p>
          {categoryLabel && (
            <span className="transaction__category">{categoryLabel}</span>
          )}
          {statusLabel && (
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
