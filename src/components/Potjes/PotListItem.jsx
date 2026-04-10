import { LucideIcon } from "../../utils/icons";
import { formatCurrency } from "../../utils/formatters";

function PotListItem({ name, balance, targetAmount, iconName, onClick, action }) {
  return (
    <div className="transaction" onClick={onClick}>
      <div
        className="transaction__icon"
        style={{
          background: "#E1F5EE",
          borderColor: "transparent",
          boxShadow: "0 12px 24px rgba(10, 16, 28, 0.14)",
        }}
      >
        <LucideIcon name={iconName} size={19} strokeWidth={2.2} color="#111111" />
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
