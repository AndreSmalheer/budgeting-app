import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import { Plus, RotateCcw } from "lucide-react";
import { useSession } from "../../hooks/useSession";
import { formatCurrency } from "../../utils/formatters";

const COLORS = ["#9b7ae0", "#6f96d8", "#55aa7a", "#d19a3f", "#c56888"];

function shortenLabel(label) {
  if (label.length <= 10) {
    return label;
  }

  return `${label.slice(0, 8)}...`;
}

function shortCurrency(value) {
  if (value >= 1000) {
    return `€${Math.round(value / 100) / 10}k`;
  }

  return `€${Math.round(value)}`;
}

function BalanceOverview({ incomeTotal, monthlyPlannedTotal, potValueData }) {
  const session = useSession();
  //   const cardHolderName = session?.name || session?.username || "";
  const cardHolderName = session?.fullName || "";

  const chartData =
    potValueData.length > 5
      ? [
          ...potValueData.slice(0, 4),
          {
            name: "Overig",
            value: potValueData
              .slice(4)
              .reduce((sum, item) => sum + item.value, 0),
          },
        ]
      : potValueData;

  const chartRows = chartData.map((item) => ({
    ...item,
    shortName: shortenLabel(item.name),
  }));

  // Create formatted dummy card ending using incomeTotal digits
  const lastDigits = Math.round(incomeTotal)
    .toString()
    .slice(-4)
    .padStart(4, "3279");

  return (
    <div className="Balance-container Mobile">
      <div className="credit-card-wrapper">
        <div className="credit-card">
          <div className="credit-card-top">
            <div className="mc-logo">
              <span className="mc-circle mc-red" />
              <span className="mc-circle mc-orange" />
            </div>

            <span className="credit-card-exp">Exp. Date: 05/28</span>
          </div>

          <div className="credit-card-number">4015 5587 9985 {lastDigits}</div>

          <div className="credit-card-holder">{cardHolderName}</div>

          <div className="credit-card-bottom">
            <Link
              to="/potje-toevoegen"
              className="overlap-add-btn"
              aria-label="Nieuw potje"
            >
              <Plus size={18} strokeWidth={2.5} />
            </Link>

            <div className="overlap-balance-summary">
              <span className="overlap-balance-text">
                Balance: <strong>{formatCurrency(incomeTotal)}</strong>
              </span>
              <span className="overlap-planned-expenses">
                Maandelijks gepland{" "}
                <strong className={monthlyPlannedTotal > 0 ? "is-expense" : "is-deposit"}>
                  {formatCurrency(Math.abs(monthlyPlannedTotal))}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <section className="Balance-chart-card">
        <div className="Balance-chart-header">
          <div>
            <h2>Totaal per potje</h2>
            <p>Een rustig overzicht van hoeveel er nu in elk potje zit</p>
          </div>

          <span className="Balance-chart-badge">
            {chartRows.length > 0
              ? `${chartRows.length} zichtbaar`
              : "Nog leeg"}
          </span>
        </div>

        {chartRows.length > 0 ? (
          <div className="Balance-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartRows}
                margin={{ top: 8, right: 8, left: -14, bottom: 6 }}
                barCategoryGap={14}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(15, 23, 42, 0.05)"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="shortName"
                  axisLine={{ stroke: "rgba(15, 23, 42, 0.08)" }}
                  tickLine={false}
                  interval={0}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  width={48}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(15, 23, 42, 0.08)" }}
                  tickFormatter={shortCurrency}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(139, 92, 246, 0.03)" }}
                  formatter={(value) => [formatCurrency(value), "Huidig saldo"]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.name || ""
                  }
                  contentStyle={{
                    fontSize: 12,
                    padding: "10px 14px",
                    borderRadius: 16,
                    border: "none",
                    background: "#ffffff",
                    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08)",
                  }}
                  labelStyle={{ color: "#0f172a", fontWeight: 700 }}
                  itemStyle={{ color: "#475569" }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={24}>
                  {chartRows.map((item, index) => (
                    <Cell
                      key={`${item.name}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="Balance-chart-empty">
            Maak een potje aan om hier direct je huidige saldo-overzicht te
            zien.
          </div>
        )}
      </section>
    </div>
  );
}

export default BalanceOverview;
