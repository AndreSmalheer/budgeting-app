import DonutChart from "../charts/DonutChart";

const COLORS = ["#00FFAE", "#ff6b6b"];

function BudgetDetailsChart({ data }) {
  return (
    <DonutChart
      data={data}
      colors={COLORS}
      width={180}
      height={180}
      innerRadius={48}
      outerRadius={70}
      paddingAngle={4}
      className="SpendingChart"
      graphClassName="SpendingChart__graph"
      legend
    />
  );
}

export default BudgetDetailsChart;
