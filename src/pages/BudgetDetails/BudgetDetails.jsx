import { useState } from "react";
import { useParams } from "react-router-dom";
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

function BudgetDetails({ potjes, transacties, setTransacties }) {
  const { id } = useParams();
  const [afnemenName, setAfnemenName] = useState("");
  const [afnemenAmount, setAfnemenAmount] = useState("");

  const potje = potjes.find((p) => p.id === id);
  const potjeTransacties = transacties.filter((t) => t.potjeId === id);
  const budget = potje?.budget || 0;

  const allTransactions = [...potjeTransacties];

  const spent = allTransactions
    .filter((t) => t.type === "expense" || t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const remaining = budget - spent;
  const progress = budget ? Math.min((spent / budget) * 100, 100) : 0;

  const handleAfnemen = () => {
    const value = Number(afnemenAmount);
    if (!value || value <= 0) return;

    const newTransaction = {
      id: Date.now().toString(),
      description: afnemenName || "Afnemen",
      date: new Date().toISOString().split("T")[0],
      amount: value,
      type: "expense",
      potjeId: id,
    };

    setTransacties((prev) => [newTransaction, ...prev]);
    setAfnemenAmount("");
    setAfnemenName("");
  };

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
            <p className="potje-label">Deze maand</p>
          </div>

          <div className="potje-amounts">
            <p className="potje-label">Uitgegeven</p>
            <p className="potje-spent">€ {spent.toLocaleString("nl-NL")}</p>
            <p className="potje-remaining">
              € {remaining.toLocaleString("nl-NL")} over
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
            <p className="potje-stat-value">€ {budget.toLocaleString("nl-NL")}</p>
          </div>

          <div className="potje-stat">
            <p className="potje-stat-label">Transacties</p>
            <p className="potje-stat-value">{allTransactions.length}</p>
          </div>

          <div className="potje-stat">
            <p className="potje-stat-label">Gem./week</p>
            <p className="potje-stat-value">€ {Math.round(spent / 4)}</p>
          </div>
        </div>

        <div className="afnemen-container">
          <input
            type="text"
            value={afnemenName}
            onChange={(e) => setAfnemenName(e.target.value)}
            placeholder="Naam (bv. boodschappen)"
            className="afnemen-input"
          />

          <input
            type="number"
            value={afnemenAmount}
            onChange={(e) => setAfnemenAmount(e.target.value)}
            placeholder="Afnemen bedrag"
            className="afnemen-input"
          />

          <button onClick={handleAfnemen} className="afnemen-button">
            Afnemen
          </button>
        </div>
      </div>

      <div className="transaction-list">
        <div className="transaction-list__header">
          <h3 className="transaction-list__title">Transacties</h3>
        </div>

        {allTransactions.map((t) => (
          <div key={t.id} className="transaction-potje">
            <div className="transaction__icon">
              <GroceryIcon />
            </div>

            <div className="transaction__info">
              <p className="transaction__name">{t.description}</p>
              <p className="transaction__meta">{t.date}</p>
            </div>

            <span
              className={`transaction__amount ${
                t.type === "expense" ? "negative" : "positive"
              }`}
            >
              {t.type === "expense" ? "-" : "+"}€{t.amount}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default BudgetDetails;
