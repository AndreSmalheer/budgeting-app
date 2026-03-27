import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import Potjes from "../../components/Potjes/Potjes";
import Header from "../../components/Header/Header";
import "./HomePage.css";

const COLORS = ["#534AB7", "#1D9E75", "#EF9F27", "#D4537E", "#888780"];

function formatCurrency(value) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

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
            formatter={(value) => formatCurrency(value)}
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
        <h2 className="recent-transactions__title">Recente transacties</h2>
        <Link
          to="/see-all/transacties"
          className="recent-transactions__see-all"
        >
          Alles
        </Link>
      </div>

      <div className="recent-transactions">
        {transacties.length === 0 ? (
          <h1 className="no-transactions">Geen transacties</h1>
        ) : (
          [...transacties]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 4)
            .map((transaction) => (
              <div key={transaction.id} className="transaction">
                <div className="transaction__info">
                  <p className="transaction__name">{transaction.description}</p>
                  <p className="transaction__meta">
                    {potjes.find((potje) => potje.id === transaction.potjeId)
                      ?.name || "Zonder potje"}{" "}
                    · {transaction.date}
                  </p>
                </div>

                <span
                  className={`transaction__amount ${
                    transaction.type === "expense" ? "negative" : "positive"
                  }`}
                >
                  {transaction.type === "expense" ? "-" : "+"}
                  {formatCurrency(Math.abs(transaction.amount))}
                </span>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

function HomePage({ potjes = [], transacties = [] }) {
  const { incomeTotal, expenseTotal, spendingData } = useMemo(() => {
    const incomeTotal = potjes.reduce((sum, potje) => sum + (potje.budget || 0), 0);

    const expenseTotal = transacties
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

    const spendingData = potjes
      .map((potje) => {
        const spent = transacties
          .filter(
            (transaction) =>
              transaction.potjeId === potje.id && transaction.type === "expense",
          )
          .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

        return {
          name: potje.name,
          value: spent,
        };
      })
      .filter((item) => item.value > 0);

    return { incomeTotal, expenseTotal, spendingData };
  }, [potjes, transacties]);

  const recentPotjes = [...potjes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <>
      <Header />

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

        <SpendingChart data={spendingData} />
      </div>

      <div className="budget-container Mobile">
        <div className="budget-header">
          <h1 className="budget-title">Budget</h1>
          <Link to="/see-all/potjes" className="budget-see-all">
            Alles
          </Link>
        </div>

        <div className="budget-items">
          {recentPotjes.map((potje) => {
            const spent = transacties
              .filter(
                (transaction) =>
                  transaction.potjeId === potje.id && transaction.type === "expense",
              )
              .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

            const progress = potje.budget
              ? Math.min((spent / potje.budget) * 100, 100)
              : 0;

            return (
              <Potjes
                key={potje.id}
                id={potje.id}
                name={potje.name}
                budget={potje.budget}
                spent={spent}
                progress={progress}
                icon={potje.icon}
              />
            );
          })}

          <Link
            to="/potje-toevoegen"
            className="plus-icon"
            aria-label="Nieuw potje toevoegen"
          >
            <Plus size={24} strokeWidth={2} />
          </Link>
        </div>
      </div>

      <RecentTransactions transacties={transacties} potjes={potjes} />
    </>
  );
}

export default HomePage;
