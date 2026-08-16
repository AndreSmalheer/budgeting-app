import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../../utils/formatters";

function shortCurrency(value) {
  if (value >= 1000) {
    return `€${Math.round(value / 100) / 10}k`;
  }

  return `€${Math.round(value)}`;
}

function getChartMax(targetAmount, currentBalance, depositTotal, expenseTotal, historyData) {
  const values = [
    Number(targetAmount || 0),
    Number(currentBalance || 0),
    Number(depositTotal || 0),
    Number(expenseTotal || 0),
    ...historyData.map((item) => Number(item.balance || 0)),
  ].filter((value) => Number.isFinite(value));

  const highestValue = Math.max(...values, 0);

  if (highestValue <= 250) {
    return Math.max(250, Math.ceil(highestValue / 50) * 50);
  }

  if (highestValue <= 1000) {
    return Math.ceil(highestValue / 100) * 100;
  }

  return Math.ceil(highestValue / 250) * 250;
}

function BudgetDetailsChart({
  historyData,
  currentBalance,
  targetAmount,
  depositTotal,
  expenseTotal,
  estimatedTimeRemaining,
}) {
  const chartMax = getChartMax(
    targetAmount,
    currentBalance,
    depositTotal,
    expenseTotal,
    historyData,
  );

  const pct = targetAmount > 0
    ? Math.min(Math.round((currentBalance / targetAmount) * 100), 100)
    : 0;

  return (
    <section className="BudgetTrend">
      {/* Hero header — big balance + pot name */}
      <div className="BudgetTrend-header">
        <div className="BudgetTrend-hero">
          <p className="BudgetTrend-eyebrow">Huidig saldo</p>
          <h2>{formatCurrency(currentBalance)}</h2>
          {estimatedTimeRemaining && (
            <p className="BudgetTrend-estimated">
              Verwacht klaar: <strong>{estimatedTimeRemaining}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="BudgetTrend-progress-wrap">
        <div className="BudgetTrend-progress-bar">
          <div
            className="BudgetTrend-progress-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="BudgetTrend-progress-labels">
          <span>{pct}% bereikt</span>
          <span>Doel: {formatCurrency(targetAmount)}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="BudgetTrend-stats">
        <div className="BudgetTrend-stat BudgetTrend-stat--positive">
          <span>Gespaard</span>
          <strong>{formatCurrency(depositTotal)}</strong>
        </div>
        <div className="BudgetTrend-stat BudgetTrend-stat--negative">
          <span>Uitgegeven</span>
          <strong>{formatCurrency(expenseTotal)}</strong>
        </div>
        <div className="BudgetTrend-stat">
          <span>Doelbedrag</span>
          <strong>{formatCurrency(targetAmount)}</strong>
        </div>
      </div>

      {/* Chart */}
      <div className="BudgetTrend-chartWrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={historyData}
            margin={{ top: 12, right: 8, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="budgetTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="rgba(15, 23, 42, 0.05)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="shortLabel"
              tickLine={false}
              axisLine={{ stroke: "rgba(15, 23, 42, 0.08)" }}
              minTickGap={18}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              domain={[0, chartMax]}
              tickCount={5}
              tickLine={false}
              axisLine={{ stroke: "rgba(15, 23, 42, 0.08)" }}
              width={58}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={shortCurrency}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), "Saldo"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel || ""}
              contentStyle={{
                fontSize: 12,
                padding: "10px 14px",
                borderRadius: 16,
                border: "none",
                background: "#ffffff",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08)",
                color: "#0f172a",
              }}
            />
            <ReferenceLine
              y={targetAmount}
              stroke="rgba(139, 92, 246, 0.5)"
              strokeDasharray="5 5"
              ifOverflow="extendDomain"
              label={{
                value: "Doel",
                position: "insideTopRight",
                fill: "#8b5cf6",
                fontSize: 10,
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#8b5cf6"
              fill="url(#budgetTrendFill)"
              strokeWidth={2.5}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#8b5cf6" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default BudgetDetailsChart;
