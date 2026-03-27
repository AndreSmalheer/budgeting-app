import { LucideIcon } from "../../utils/icons";
import { formatCurrency } from "../../utils/formatters";

function PotListItem({ name, budget, iconName, onClick, action }) {
  return (
    <div className="transaction" onClick={onClick}>
      <div className="transaction__icon">
        <LucideIcon name={iconName} size={18} strokeWidth={2} />
      </div>

      <div className="transaction__info">
        <p className="transaction__name">{name}</p>
        <p className="transaction__meta">Budget · {formatCurrency(budget)}</p>
      </div>

      {action}
    </div>
  );
}

export default PotListItem;
