import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCurrency } from "../../utils/formatters";

function DonutChart({
  data,
  colors,
  width,
  height,
  innerRadius,
  outerRadius,
  paddingAngle = 0,
  className,
  graphClassName,
  legend = false,
  tooltipFormatter,
  tooltipContentStyle,
  pieStroke = "none",
  centerLabel = "",
  centerValue = null,
  maxSlices = 5,
  emptyLabel = "Nog geen data",
}) {
  const normalizedData = data
    .filter((item) => Number(item?.value || 0) > 0)
    .map((item) => ({
      name: item.name,
      value: Number(item.value),
    }))
    .sort((a, b) => b.value - a.value);

  const visibleData =
    normalizedData.length > maxSlices
      ? [
          ...normalizedData.slice(0, maxSlices - 1),
          {
            name: "Overig",
            value: normalizedData
              .slice(maxSlices - 1)
              .reduce((sum, item) => sum + item.value, 0),
          },
        ]
      : normalizedData;

  const totalValue = visibleData.reduce((sum, item) => sum + item.value, 0);
  const hasData = visibleData.length > 0;
  const chartData = hasData ? visibleData : [{ name: emptyLabel, value: 1 }];
  const chartColors = hasData ? colors : ["rgba(255, 255, 255, 0.14)"];

  return (
    <div className={className}>
      <div className={graphClassName}>
        <div className="donut-chart-shell" style={{ width, height }}>
          <PieChart width={width} height={height}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            dataKey="value"
            stroke={pieStroke}
            strokeWidth={pieStroke === "none" ? undefined : 0}
            isAnimationActive={hasData}
          >
            {chartData.map((item, index) => (
              <Cell
                key={`${item.name}-${index}`}
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </Pie>

            {hasData && (
              <Tooltip
                formatter={
                  tooltipFormatter ||
                  ((value, name) => [formatCurrency(value), name].filter(Boolean))
                }
                contentStyle={tooltipContentStyle}
              />
            )}
          </PieChart>

          <div className="donut-chart-center">
            {centerLabel && (
              <span className="donut-chart-center__label">{centerLabel}</span>
            )}
            <strong className="donut-chart-center__value">
              {centerValue === null
                ? hasData
                  ? formatCurrency(totalValue)
                  : emptyLabel
                : formatCurrency(centerValue)}
            </strong>
          </div>
        </div>
      </div>

      {legend && (
        <div className="chart-legend">
          {hasData ? (
            visibleData.map((item, index) => (
            <div key={`${item.name}-${index}`} className="chart-legend__item">
              <span
                className="chart-legend__dot"
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              />
              <div className="chart-legend__copy">
                <span className="chart-legend__label">{item.name}</span>
                <span className="chart-legend__share">
                  {Math.round((item.value / totalValue) * 100)}%
                </span>
              </div>
              <span className="chart-legend__value">{formatCurrency(item.value)}</span>
            </div>
            ))
          ) : (
            <div className="chart-legend__item chart-legend__item--empty">
              <span className="chart-legend__label">{emptyLabel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DonutChart;
