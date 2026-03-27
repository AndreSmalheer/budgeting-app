import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import Potjes from "../../components/Potjes/Potjes";
import Header from "../../components/Header/Header";
import "./HomePage.css";
import { Link } from "react-router-dom";

const COLORS = ["#534AB7", "#1D9E75", "#EF9F27", "#D4537E", "#888780"];

function SpendingChart({ data }) {
  return (
    <div className="SpendingChart">
      <div className="Graph">
        <PieChart width={145} height={128}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={55}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => `€${v.toLocaleString("nl-NL")}`}
            contentStyle={{
              fontSize: 10,
              padding: "2px 6px",
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </PieChart>
      </div>
    </div>
  );
}

function RecentTransactions({ transacties, potjes }) {
  return (
    <div className="SpendingOverview">
      <div className="recent-transactions__header">
        <h2 className="recent-transactions__title">Recent</h2>
      </div>

      <div className="recent-transactions">
        {[...transacties]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map((t) => (
            <div key={t.id} className="transaction">
              <div className="transaction__info">
                <p className="transaction__name">{t.description}</p>
                <p className="transaction__meta">
                  {potjes.find((p) => p.id === t.potjeId)?.name || "Geen potje"}{" "}
                  · {t.date}
                </p>
              </div>

              <span
                className={`transaction__amount ${
                  t.type === "expense" ? "negative" : "positive"
                }`}
              >
                {t.type === "expense" ? "-" : "+"}€
                {Math.abs(t.amount).toLocaleString("nl-NL")}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function HomePage({ potjes = [], transacties = [] }) {
  const { incomeTotal, expenseTotal, spendingData } =
    useMemo(() => {
      const incomeTotal = potjes.reduce((sum, p) => sum + (p.budget || 0), 0);

      const expenseTotal = transacties
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const spendingData = potjes
        .map((p) => {
          const spent = transacties
            .filter((t) => t.potjeId === p.id && t.type === "expense")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

          return {
            name: p.name,
            value: spent,
          };
        })
        .filter((item) => item.value > 0);

      return { incomeTotal, expenseTotal, spendingData };
    }, [potjes, transacties]);

  return (
    <>
      <Header />

      <div className="Balance-container Mobile">
        <div>
          <h1>Balance</h1>
          <div className="Balance-items">
            <div className="Balance-item positive">
              <span className="Balance-icon"></span>
              <h2 className="Balance-value">
                    € {incomeTotal.toLocaleString("nl-NL")}
              </h2>
            </div>
            <div className="Balance-item negative">
              <span className="Balance-icon"></span>
              <h2 className="Balance-value">
                € {expenseTotal.toLocaleString("nl-NL")}
              </h2>
            </div>
          </div>
        </div>

        <SpendingChart data={spendingData} />
      </div>

      <div className="budget-container Mobile">
        <div className="budget-header">
          <h1 className="budget-title">Budget</h1>
        </div>

        <div className="budget-items">
          {potjes.map((p) => {
            const spent = transacties
              .filter((t) => t.potjeId === p.id && t.type === "expense")
              .reduce((sum, t) => sum + Math.abs(t.amount), 0);

            const progress = p.budget
              ? Math.min((spent / p.budget) * 100, 100)
              : 0;

            return (
              <Potjes
                key={p.id}
                id={p.id}
                name={p.name}
                budget={p.budget}
                spent={spent}
                progress={progress}
                icon={p.icon}
              />
            );
          })}

          <Link to="/potje-toevoegen" className="plus-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5V19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        </div>
      </div>

      <RecentTransactions transacties={transacties} potjes={potjes} />
    </>
  );
}

export default HomePage;
