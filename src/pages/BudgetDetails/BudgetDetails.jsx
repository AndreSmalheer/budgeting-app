import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import BackBtn from "../../components/BackBtn/BackBtn";
import BudgetDetailsChart from "../../components/budget/BudgetDetailsChart";
import BudgetTransactionsSection from "../../components/budget/BudgetTransactionsSection";
import BudgetWithdrawForm from "../../components/budget/BudgetWithdrawForm";
import { TRANSACTION_CATEGORIES } from "../../config/transactionCategories";
import { useSession } from "../../hooks/useSession";
import { createTransaction } from "../../services/api/client";
import { formatDate } from "../../utils/formatters";
import "./BudgetDetails.css";

function BudgetDetails({
  potjes,
  transacties,
  isLoading = false,
  errorMessage = "",
  onTransactionCreated,
}) {
  const { id } = useParams();
  const session = useSession();

  const potje = potjes.find((item) => item.id === id);

  const potjeTransacties = transacties.filter(
    (transaction) => transaction.potId === id
  );

  const [budgetAfhalenAmount, setBudgetAfhalenAmount] = useState("");
  const [budgetAfhalenNaam, setBudgetAfhalenNaam] = useState(
    `${potje?.name || ""} afschrijving`
  );
  const [budgetAfhalenCategory, setBudgetAfhalenCategory] = useState("overig");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (potje?.name && !budgetAfhalenNaam) {
      setBudgetAfhalenNaam(`${potje.name} afschrijving`);
    }
  }, [potje?.name, budgetAfhalenNaam]);

  const budget = Number(potje?.targetAmount) || 0;
  const remaining = Number(potje?.currentBalance) || 0;
  const depositTotal = potjeTransacties
    .filter((transaction) => transaction.type === "deposit")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const expenseTotal = potjeTransacties
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const historyData = useMemo(() => {
    const sortedTransactions = [...potjeTransacties].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );

    let runningBalance = budget;

    const points = [
      {
        shortLabel: "Start",
        fullLabel: potje?.createdAt
          ? `Start · ${formatDate(potje.createdAt)}`
          : "Start",
        balance: runningBalance,
      },
    ];

    sortedTransactions.forEach((transaction, index) => {
      runningBalance +=
        transaction.type === "deposit"
          ? Number(transaction.amount || 0)
          : -Number(transaction.amount || 0);

      points.push({
        shortLabel:
          sortedTransactions.length > 5
            ? String(index + 1)
            : new Intl.DateTimeFormat("nl-NL", {
                day: "2-digit",
                month: "2-digit",
              }).format(new Date(transaction.createdAt)),
        fullLabel: `${transaction.type === "deposit" ? "Toegevoegd" : "Uitgave"} · ${formatDate(
          transaction.createdAt,
        )}`,
        balance: runningBalance,
      });
    });

    if (points.length === 1) {
      points.push({
        shortLabel: "Nu",
        fullLabel: "Huidige stand",
        balance: remaining,
      });
    } else {
      points.push({
        shortLabel: "Nu",
        fullLabel: "Huidige stand",
        balance: remaining,
      });
    }

    return points;
  }, [budget, potje?.createdAt, potjeTransacties, remaining]);

  if (isLoading) return <p style={{ padding: "20px" }}>Potje laden...</p>;
  if (errorMessage) return <p style={{ padding: "20px" }}>{errorMessage}</p>;
  if (!potje) return <p style={{ padding: "20px" }}>Potje niet gevonden.</p>;

  async function handleTransactionSubmit(type) {
    const value = Number(budgetAfhalenAmount);

    if (!value || value <= 0) return;
    if (!budgetAfhalenNaam.trim()) return;
    if (!session?.id) return;

    setIsSubmitting(true);
    setFeedback("");

    try {
      await createTransaction({
        userId: session.id,
        potId: id,
        description: budgetAfhalenNaam.trim(),
        amount: value,
        type,
        category: budgetAfhalenCategory,
      });

      await onTransactionCreated?.();

      setBudgetAfhalenAmount("");
      setBudgetAfhalenCategory("overig");
      setBudgetAfhalenNaam(
        type === "deposit"
          ? `${potje.name} bijschrijving`
          : `${potje.name} afschrijving`,
      );
    } catch (error) {
      setFeedback(error.message || "De transactie kon niet worden opgeslagen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBudgetAfhalen() {
    return handleTransactionSubmit("expense");
  }

  function handleBudgetToevoegen() {
    return handleTransactionSubmit("deposit");
  }

  const hasValidInput =
    budgetAfhalenNaam.trim() !== "" &&
    Number(budgetAfhalenAmount) > 0 &&
    !isSubmitting;

  const isWithdrawValid = hasValidInput && Number(budgetAfhalenAmount) <= remaining;
  const isDepositValid = hasValidInput;

  return (
    <main className="BudgetDetails-page">
      <div className="BudgetDetails-page__back">
        <BackBtn />
      </div>

      <div className="potje-container">
        <BudgetDetailsChart
          historyData={historyData}
          currentBalance={remaining}
          targetAmount={budget}
          depositTotal={depositTotal}
          expenseTotal={expenseTotal}
        />
      </div>

      {feedback && <p className="page-feedback">{feedback}</p>}

      <BudgetWithdrawForm
        amount={budgetAfhalenAmount}
        category={budgetAfhalenCategory}
        categories={TRANSACTION_CATEGORIES}
        name={budgetAfhalenNaam}
        isDepositValid={isDepositValid}
        isWithdrawValid={isWithdrawValid}
        onAmountChange={(event) => setBudgetAfhalenAmount(event.target.value)}
        onCategoryChange={(event) => setBudgetAfhalenCategory(event.target.value)}
        onNameChange={(event) => setBudgetAfhalenNaam(event.target.value)}
        onDepositSubmit={handleBudgetToevoegen}
        onWithdrawSubmit={handleBudgetAfhalen}
        isSubmitting={isSubmitting}
      />

      <BudgetTransactionsSection
        transactions={potjeTransacties}
        iconName={potje.icon}
        potId={potje.id}
      />
    </main>
  );
}

export default BudgetDetails;
