import DonutChart from "../charts/DonutChart";
import { formatCurrency } from "../../utils/formatters";

const COLORS = ["#534AB7", "#1D9E75", "#EF9F27", "#D4537E", "#888780"];

function BalanceOverview({ incomeTotal, expenseTotal, spendingData }) {
  return (
    <div className="Balance-container Mobile">
      <div>
        <h1>Saldo</h1>
        <div className="Balance-items">
          <div className="Balance-item positive">
            <span className="Balance-icon"></span>
            <h2 className="Balance-value">{formatCurrency(incomeTotal)}</h2>
          </div>
          <div className="Balance-item negative">
            <span className="Balance-icon"></span>
            <h2 className="Balance-value">{formatCurrency(expenseTotal)}</h2>
          </div>
        </div>
      </div>

      <DonutChart
        data={spendingData}
        colors={COLORS}
        width={145}
        height={128}
        innerRadius={35}
        outerRadius={55}
        paddingAngle={2}
        className="SpendingChart"
        graphClassName="Graph"
        tooltipFormatter={(value) => formatCurrency(value)}
        tooltipContentStyle={{
          fontSize: 10,
          padding: "2px 6px",
          borderRadius: 4,
          border: "1px solid #ccc",
        }}
        pieStroke="transparent"
      />
    </div>
  );
}

export default BalanceOverview;
