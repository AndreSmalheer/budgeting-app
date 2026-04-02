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
}) {
  return (
    <div className={className}>
      <div className={graphClassName}>
        <PieChart width={width} height={height}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            dataKey="value"
            stroke={pieStroke}
            strokeWidth={pieStroke === "none" ? undefined : 0}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>

          <Tooltip
            formatter={
              tooltipFormatter ||
              ((value, name) => [formatCurrency(value), name].filter(Boolean))
            }
            contentStyle={tooltipContentStyle}
          />
        </PieChart>
      </div>

      {legend && (
        <div className="chart-legend">
          {data.map((item, index) => (
            <div key={`${item.name}-${index}`} className="chart-legend__item">
              <span
                className="chart-legend__dot"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="chart-legend__label">{item.name}</span>
              <span className="chart-legend__value">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DonutChart;
