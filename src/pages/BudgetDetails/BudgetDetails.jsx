import { useState } from "react";
import { useParams } from "react-router-dom";
import BackBtn from "../../components/BackBtn/BackBtn";
import BudgetDetailsChart from "../../components/budget/BudgetDetailsChart";
import BudgetTransactionsSection from "../../components/budget/BudgetTransactionsSection";
import BudgetWithdrawForm from "../../components/budget/BudgetWithdrawForm";
import "./BudgetDetails.css";

function BudgetDetails({ potjes, transacties, setTransacties }) {
  const { id } = useParams();

  const potje = potjes.find((item) => item.id === id);

  const potjeTransacties = transacties.filter(
    (transaction) => transaction.potjeId === id
  );

  const [budgetAfhalenAmount, setBudgetAfhalenAmount] = useState("");
  const [budgetAfhalenNaam, setBudgetAfhalenNaam] = useState(
    `${potje?.name || ""} afschrijving`
  );

  if (!potje) return <p>Potje niet gevonden.</p>;

  const budget = Number(potje.budget) || 0;

  const spent = potjeTransacties
    .filter(
      (transaction) =>
        transaction.type === "expense" || transaction.amount < 0
    )
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  const remaining = budget - spent;

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
      date: new Date().toISOString(),
    };

    setTransacties((prev) => [newTransaction, ...prev]);

    setBudgetAfhalenAmount("");
    setBudgetAfhalenNaam(`${potje.name} afschrijving`);
  };

  const spendingData = [
    { name: "Uitgegeven", value: spent },
    { name: "Resterend", value: remaining < 0 ? 0 : remaining },
  ];

  const isValidAmount =
    budgetAfhalenNaam.trim() !== "" &&
    Number(budgetAfhalenAmount) > 0 &&
    Number(budgetAfhalenAmount) <= remaining;

  return (
    <>
      <BackBtn
        style={{ marginLeft: "20px", marginTop: "5px", marginBottom: "20px" }}
      />

      <div className="potje-container">
        <BudgetDetailsChart data={spendingData} />
      </div>

      <BudgetWithdrawForm
        amount={budgetAfhalenAmount}
        name={budgetAfhalenNaam}
        isValid={isValidAmount}
        onAmountChange={(event) => setBudgetAfhalenAmount(event.target.value)}
        onNameChange={(event) => setBudgetAfhalenNaam(event.target.value)}
        onSubmit={handleBudgetAfhalen}
      />

      <BudgetTransactionsSection
        transactions={potjeTransacties}
        iconName={potje.icon}
      />
    </>
  );
}

export default BudgetDetails;
