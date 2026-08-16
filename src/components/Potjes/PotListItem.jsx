import { LucideIcon } from "../../utils/icons";
import { formatCurrency } from "../../utils/formatters";

function PotListItem({ name, balance, targetAmount, iconName, onClick, action }) {
  return (
    <div className="transaction" onClick={onClick}>
      <div className="transaction__icon">
        <LucideIcon name={iconName} size={19} strokeWidth={2.2} />
      </div>

      <div className="transaction__info">
        <p className="transaction__name">{name}</p>
        <p className="transaction__meta">
          Gespaard · {formatCurrency(balance)} van {formatCurrency(targetAmount)}
        </p>
      </div>

      {action}
    </div>
  );
}

export default PotListItem;
