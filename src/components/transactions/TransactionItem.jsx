import { LucideIcon } from "../../utils/icons";
import { formatCurrency } from "../../utils/formatters";

function TransactionItem({
  description,
  meta,
  amount,
  isExpense,
  iconName,
  className = "transaction",
}) {
  return (
    <div className={className}>
      <div className="transaction__icon">
        <LucideIcon name={iconName} size={18} strokeWidth={2} />
      </div>

      <div className="transaction__info">
        <p className="transaction__name">{description}</p>
        <p className="transaction__meta">{meta}</p>
      </div>

      <span
        className={`transaction__amount ${isExpense ? "negative" : "positive"}`}
      >
        {isExpense ? "-" : "+"}
        {formatCurrency(Math.abs(amount))}
      </span>
    </div>
  );
}

export default TransactionItem;
