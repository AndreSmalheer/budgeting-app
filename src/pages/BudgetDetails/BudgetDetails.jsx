import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import BackBtn from "../../components/BackBtn/BackBtn";
import "./BudgetDetails.css";

const GroceryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
      stroke="#085041"
      strokeWidth="2"
    />
  </svg>
);

function BudgetDetails({ potjes = [], transacties = [], setTransacties }) {
  const { id } = useParams();

  const potje = potjes.find((item) => item.id === id);
  const potjeTransacties = transacties.filter((item) => item.potjeId === id);
  const budget = potje?.budget || 0;

  const [afnemenAmount, setAfnemenAmount] = useState("");

  const spent = potjeTransacties
    .filter((item) => item.type === "expense" || item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const remaining = budget - spent;
  const progress = budget ? Math.min((spent / budget) * 100, 100) : 0;

  function handleAfnemen() {
    const value = Number(afnemenAmount);

    if (!value || value <= 0 || !setTransacties) {
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      description: "Afnemen",
      date: new Date().toISOString().split("T")[0],
      amount: value,
      type: "expense",
      potjeId: id,
    };

    setTransacties((previousTransactions) => [newTransaction, ...previousTransactions]);
    setAfnemenAmount("");
  }

  const weeklyData = [
    { week: "W1", spent: spent / 4, budget: budget / 4 },
    { week: "W2", spent: spent / 4, budget: budget / 4 },
    { week: "W3", spent: spent / 4, budget: budget / 4 },
    { week: "W4", spent: spent / 4, budget: budget / 4 },
  ];

  if (!potje) {
    return <p>Potje niet gevonden</p>;
  }

  return (
    <>
      <BackBtn style={{ marginLeft: "20px", marginTop: "5px", marginBottom: "20px" }} />

      <div className="potje-container">
        <div className="potje-header">
          <div>
            <p className="potje-label">Budget pot</p>
            <h2 className="potje-title">{potje.name}</h2>
            <p className="potje-label">This month</p>
          </div>

          <div className="potje-amounts">
            <p className="potje-label">Spent</p>
            <p className="potje-spent">€ {spent.toLocaleString("nl-NL")}</p>
            <p className="potje-remaining">€ {remaining.toLocaleString("nl-NL")} left</p>
          </div>
        </div>

        <div className="potje-progress-track">
          <div className="potje-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="potje-stats">
          <div className="potje-stat">
            <p className="potje-stat-label">Budget</p>
            <p className="potje-stat-value">€ {budget}</p>
          </div>

          <div className="potje-stat">
            <p className="potje-stat-label">Transactions</p>
            <p className="potje-stat-value">{potjeTransacties.length}</p>
          </div>

          <div className="potje-stat">
            <p className="potje-stat-label">Avg/week</p>
            <p className="potje-stat-value">€ {Math.round(spent / 4)}</p>
          </div>
        </div>

        <div className="afnemen-container">
          <input
            type="number"
            value={afnemenAmount}
            onChange={(event) => setAfnemenAmount(event.target.value)}
            placeholder="Afnemen bedrag"
            className="afnemen-input"
          />

          <button onClick={handleAfnemen} className="afnemen-button">
            Afnemen
          </button>
        </div>

        <div className="potje-chart">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="budget" fill="#3a3f5c" />
              <Bar dataKey="spent" fill="#00FFAE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="transaction-list">
        <div className="transaction-list__header">
          <h3 className="transaction-list__title">Transactions</h3>
        </div>

        {potjeTransacties.map((transaction) => (
          <div key={transaction.id} className="transaction-potje">
            <div className="transaction__icon">
              <GroceryIcon />
            </div>

            <div className="transaction__info">
              <p className="transaction__name">{transaction.description}</p>
              <p className="transaction__meta">{transaction.date}</p>
            </div>

            <span
              className={`transaction__amount ${
                transaction.type === "expense" ? "negative" : "positive"
              }`}
            >
              {transaction.type === "expense" ? "-" : "+"}€{transaction.amount}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default BudgetDetails;
