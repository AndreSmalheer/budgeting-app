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

  return (
    <section className="BudgetTrend">
      <div className="BudgetTrend-header">
        <div>
          <p className="BudgetTrend-eyebrow">Potje</p>
          <h2>{formatCurrency(currentBalance)}</h2>
          <p className="BudgetTrend-subtitle">
            {/* Hier zie je hoe dit potje beweegt door stortingen en uitgaven. */}
          </p>
        </div>

        {estimatedTimeRemaining && (
          <div className="goal-projection-label">
            Verwacht: <strong>{estimatedTimeRemaining}</strong>
          </div>
        )}
      </div>

      <div className="BudgetTrend-stats">
        <div className="BudgetTrend-stat">
          <span>Doelbedrag</span>
          <strong>{formatCurrency(targetAmount)}</strong>
        </div>
        <div className="BudgetTrend-stat BudgetTrend-stat--positive">
          <span>Gespaard</span>
          <strong>{formatCurrency(depositTotal)}</strong>
        </div>
        <div className="BudgetTrend-stat BudgetTrend-stat--negative">
          <span>Uitgegeven</span>
          <strong>{formatCurrency(expenseTotal)}</strong>
        </div>
      </div>

      <div className="BudgetTrend-chartWrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={historyData}
            margin={{ top: 12, right: 8, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="budgetTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="rgba(148, 163, 184, 0.14)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="shortLabel"
              tickLine={false}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.18)" }}
              minTickGap={18}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />
            <YAxis
              domain={[0, chartMax]}
              tickCount={5}
              tickLine={false}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.18)" }}
              width={58}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={shortCurrency}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), "Saldo"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel || ""}
              contentStyle={{
                fontSize: 11,
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#1f2438",
                color: "#ffffff",
              }}
            />
            <ReferenceLine
              y={targetAmount}
              stroke="rgba(245, 158, 11, 0.9)"
              strokeDasharray="5 5"
              ifOverflow="extendDomain"
              label={{
                value: "Doel",
                position: "insideTopRight",
                fill: "#fcd34d",
                fontSize: 10,
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#2DD4BF"
              fill="url(#budgetTrendFill)"
              strokeWidth={3}
              activeDot={{ r: 4, strokeWidth: 0, fill: "#2DD4BF" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default BudgetDetailsChart;
