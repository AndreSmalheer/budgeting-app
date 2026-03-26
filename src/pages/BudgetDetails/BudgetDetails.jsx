import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Header from "../../components/Header/Header";
import "./BudgetDetails.css";
import BackBtn from "../../components/BackBtn/BackBtn";

const BUDGET = 500;

const INITIAL_TRANSACTIONS = [
  { name: "Albert Heijn", date: "Mar 24", amount: -67 },
  { name: "Jumbo", date: "Mar 20", amount: -54 },
  { name: "Lidl", date: "Mar 17", amount: -43 },
  { name: "Albert Heijn", date: "Mar 13", amount: -38 },
  { name: "Marqt", date: "Mar 10", amount: -29 },
  { name: "Jumbo", date: "Mar 6", amount: -51 },
  { name: "Albert Heijn", date: "Mar 3", amount: -22 },
  { name: "Lidl", date: "Mar 1", amount: -8 },
];

const WEEKLY_DATA = [
  { week: "W1", spent: 81, budget: 125 },
  { week: "W2", spent: 110, budget: 125 },
  { week: "W3", spent: 77, budget: 125 },
  { week: "W4", spent: 44, budget: 125 },
];

const GroceryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
      stroke="#085041"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="3"
      y1="6"
      x2="21"
      y2="6"
      stroke="#085041"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16 10a4 4 0 01-8 0"
      stroke="#085041"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function BudgetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [afnemenAmount, setAfnemenAmount] = useState("");

  const spent = transactions.reduce(
    (s, t) => s + Math.abs(t.amount),
    0
  );

  const remaining = BUDGET - spent;
  const progress = Math.min((spent / BUDGET) * 100, 100);

  const handleAfnemen = () => {
    const value = Number(afnemenAmount);

    if (!value || value <= 0) return;

    const newTransaction = {
      name: "Afnemen",
      date: "Now",
      amount: -value,
    };

    setTransactions([newTransaction, ...transactions]);
    setAfnemenAmount("");
  };

  return (
    <>
      <BackBtn style={{ marginLeft: "20px", marginTop: "5px", marginBottom: "20px" }} />

      <div className="potje-container">

        <div className="potje-header">
          <div>
            <p className="potje-label">Budget pot</p>
            <h2 className="potje-title">Groceries</h2>
            <p className="potje-label">March 2025</p>
          </div>

          <div className="potje-amounts">
            <p className="potje-label">Spent</p>
            <p className="potje-spent">
              € {spent.toLocaleString("nl-NL")}
            </p>
            <p className="potje-remaining">
              € {remaining.toLocaleString("nl-NL")} left
            </p>
          </div>
        </div>

        <div className="potje-progress-track">
          <div
            className="potje-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="potje-stats">
          <div className="potje-stat">
            <p className="potje-stat-label">Budget</p>
            <p className="potje-stat-value">€ {BUDGET}</p>
          </div>

          <div className="potje-stat">
            <p className="potje-stat-label">Transactions</p>
            <p className="potje-stat-value">{transactions.length}</p>
          </div>

          <div className="potje-stat">
            <p className="potje-stat-label">Avg/week</p>
            <p className="potje-stat-value">
              € {Math.round(spent / 4)}
            </p>
          </div>
        </div>

        <div className="afnemen-container">
          <input
            type="number"
            value={afnemenAmount}
            onChange={(e) => setAfnemenAmount(e.target.value)}
            placeholder="Afnemen bedrag"
            className="afnemen-input"
          />

          <button
            onClick={handleAfnemen}
            className="afnemen-button"
          >
            Afnemen
          </button>
        </div>

        <div className="potje-chart">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={WEEKLY_DATA} barCategoryGap="30%">
              <XAxis
                dataKey="week"
                tick={{ fill: "#888", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#888", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `€${v}`}
              />
              <Tooltip
                formatter={(v) => `€${v}`}
                contentStyle={{
                  background: "#2F3349",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "white",
                }}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar
                dataKey="budget"
                fill="#3a3f5c"
                radius={[6, 6, 6, 6]}
              />
              <Bar
                dataKey="spent"
                fill="#00FFAE"
                radius={[6, 6, 6, 6]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="transaction-list">
        <div className="transaction-list__header">
          <h3 className="transaction-list__title">
            Transactions
          </h3>
          <span className="transaction-list__month">
            March 2025
          </span>
        </div>

        {transactions.map((t, i) => (
          <div key={i} className="transaction-potje">
            <div className="transaction__icon">
              <GroceryIcon />
            </div>

            <div className="transaction__info">
              <p className="transaction__name">{t.name}</p>
              <p className="transaction__meta">{t.date}</p>
            </div>

            <span
              className={`transaction__amount ${
                t.amount < 0 ? "negative" : "positive"
              }`}
            >
              {t.amount < 0 ? "-" : "+"}€
              {Math.abs(t.amount)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default BudgetDetails;
