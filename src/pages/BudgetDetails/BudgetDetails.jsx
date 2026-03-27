import { useState } from "react";
import { useParams } from "react-router-dom";
import BackBtn from "../../components/BackBtn/BackBtn";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import "./BudgetDetails.css";
import * as Icons from "lucide-react";

const GroceryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
      stroke="#085041"
      strokeWidth="2"
    />
  </svg>
);

const COLORS = ["#00FFAE", "#ff6b6b"];

function SpendingChart({ data }) {
  return (
    <div className="SpendingChart">
      <div className="SpendingChart__graph">
        <PieChart width={180} height={180}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={70}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            formatter={(v, name) => [
              new Intl.NumberFormat("nl-NL", {
                style: "currency",
                currency: "EUR",
              }).format(v),
              name,
            ]}
          />
        </PieChart>
      </div>

      <div className="chart-legend">
        {data.map((item, i) => (
          <div key={`${item.name}-${i}`} className="chart-legend__item">
            <span
              className="chart-legend__dot"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="chart-legend__label">{item.name}</span>
            <span className="chart-legend__value">
              {new Intl.NumberFormat("nl-NL", {
                style: "currency",
                currency: "EUR",
              }).format(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetDetails({ potjes, transacties, setTransacties, setPotjes }) {
  const { id } = useParams();

  const potje = potjes.find((p) => p.id === id);
  const potjeTransacties = transacties.filter((t) => t.potjeId === id);
  const icon = potje.icon;
  const Icon =
    Icons[
      icon
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("")
    ] || Icons.Circle;

  const [budgetAfhalenAmount, setBudgetAfhalenAmount] = useState("");
  const [budgetAfhalenNaam, setBudgetAfhalenNaam] = useState("");

  const handleBudgetAfhalen = () => {
    const value = Number(budgetAfhalenAmount);

    if (!value || value <= 0) return;
    if (!budgetAfhalenNaam.trim()) return;

    const newTransaction = {
      id: crypto.randomUUID(),
      potjeId: id,
      description: budgetAfhalenNaam,
      amount: -Math.abs(value),
      type: "expense",
      date: new Date().toLocaleDateString("nl-NL"),
    };

    setTransacties((prev) => [newTransaction, ...prev]);

    setPotjes((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, budget: Math.max(0, Number(p.budget) - value) }
          : p,
      ),
    );

    setBudgetAfhalenAmount("");
    setBudgetAfhalenNaam("");
  };

  const budget = potje?.budget || 0;

  const spent = potjeTransacties
    .filter((t) => t.type === "expense" || t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const remaining = budget - spent;

  const spendingData = [
    { name: "Uitgegeven", value: spent },
    { name: "Over", value: remaining < 0 ? 0 : remaining },
  ];

  const isValidAmount =
    budgetAfhalenNaam.trim() !== "" &&
    Number(budgetAfhalenAmount) > 0 &&
    Number(budgetAfhalenAmount) <= remaining;

  if (!potje) return <p>Potje niet gevonden</p>;

  return (
    <>
      <BackBtn
        style={{ marginLeft: "20px", marginTop: "5px", marginBottom: "20px" }}
      />

      <div className="potje-container">
        <SpendingChart data={spendingData} />
      </div>

      <div className="afnemen-container">
        <input
          className="afnemen-input"
          type="text"
          placeholder="Naam van transactie"
          value={budgetAfhalenNaam}
          onChange={(e) => setBudgetAfhalenNaam(e.target.value)}
        />

        <input
          className="afnemen-input"
          type="number"
          inputMode="decimal"
          placeholder="Bedrag"
          value={budgetAfhalenAmount}
          onChange={(e) => setBudgetAfhalenAmount(e.target.value)}
        />

        <button
          className={`afnemen-button ${!isValidAmount ? "disabled" : ""}`}
          onClick={handleBudgetAfhalen}
          disabled={!isValidAmount}
        >
          Afnemen
        </button>
      </div>

      <div className="transaction-list">
        <div className="transaction-list__header">
          <h3 className="transaction-list__title">Transacties</h3>
        </div>

        {potjeTransacties.map((t) => (
          <div key={t.id} className="transaction-potje">
            <div className="transaction__icon">
              <Icon />
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
              {t.type === "expense" ? "-" : "+"}
              {new Intl.NumberFormat("nl-NL", {
                style: "currency",
                currency: "EUR",
              }).format(Math.abs(t.amount))}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default BudgetDetails;
