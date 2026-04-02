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
import { formatCurrency } from "../../utils/formatters";

const COLORS = ["#2DD4BF", "#F59E0B", "#FB7185", "#60A5FA", "#A78BFA"];

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

function BalanceOverview({ incomeTotal, expenseTotal, spendingData }) {
  const chartData =
    spendingData.length > 5
      ? [
          ...spendingData.slice(0, 4),
          {
            name: "Overig",
            value: spendingData.slice(4).reduce((sum, item) => sum + item.value, 0),
          },
        ]
      : spendingData;

  const chartRows = chartData.map((item) => ({
    ...item,
    shortName: shortenLabel(item.name),
  }));

  return (
    <div className="Balance-container Mobile">
      <section className="Balance-hero">
        <p className="Balance-eyebrow">Jouw budget in beeld</p>
        <h1>Saldo in je potjes</h1>
        <p className="Balance-total">{formatCurrency(incomeTotal)}</p>
      </section>

      <section className="Balance-summary">
        <div className="Balance-summary-card positive">
          <span className="Balance-summary-label">Beschikbaar nu</span>
          <strong className="Balance-summary-value">{formatCurrency(incomeTotal)}</strong>
        </div>

        <div className="Balance-summary-card negative">
          <span className="Balance-summary-label">Totaal uitgegeven</span>
          <strong className="Balance-summary-value">{formatCurrency(expenseTotal)}</strong>
        </div>
      </section>

      <section className="Balance-chart-card">
        <div className="Balance-chart-header">
          <div>
            <h2>Uitgaven per potje</h2>
            <p>Een rustig overzicht van waar je geld naartoe gaat</p>
          </div>

          <span className="Balance-chart-badge">
            {chartRows.length > 0 ? `${chartRows.length} zichtbaar` : "Nog leeg"}
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
                  stroke="rgba(148, 163, 184, 0.14)"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="shortName"
                  axisLine={{ stroke: "rgba(148, 163, 184, 0.18)" }}
                  tickLine={false}
                  interval={0}
                  tick={{ fill: "#cbd5e1", fontSize: 11 }}
                />
                <YAxis
                  width={48}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(148, 163, 184, 0.18)" }}
                  tickFormatter={shortCurrency}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.05)" }}
                  formatter={(value) => [formatCurrency(value), "Uitgegeven"]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""}
                  contentStyle={{
                    fontSize: 11,
                    padding: "8px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "#1f2438",
                    color: "#ffffff",
                  }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={22}>
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
            Voeg transacties toe om te zien waar je geld naartoe gaat.
          </div>
        )}
      </section>
    </div>
  );
}

export default BalanceOverview;
