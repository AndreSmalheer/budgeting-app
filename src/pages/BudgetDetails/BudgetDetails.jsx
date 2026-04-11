import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import BackBtn from "../../components/BackBtn/BackBtn";
import BudgetDetailsChart from "../../components/budget/BudgetDetailsChart";
import BudgetTransactionsSection from "../../components/budget/BudgetTransactionsSection";
import BudgetWithdrawForm from "../../components/budget/BudgetWithdrawForm";
import ConfirmModal from "../../components/modals/ConfirmModal";
import TransactionEditModal from "../../components/transactions/TransactionEditModal";
import { TRANSACTION_CATEGORIES } from "../../config/transactionCategories";
import { useSession } from "../../hooks/useSession";
import {
  createScheduledTransaction,
  createTransaction,
  deleteScheduledTransaction,
  deleteTransaction,
  updateScheduledTransaction,
  updateTransaction,
} from "../../services/api/client";
import { formatDate } from "../../utils/formatters";
import "./BudgetDetails.css";
import ScheduledPaymentForm from "../../components/scheduledPaymentsForm/Scheduledpaymentform";
import ScrollToTop from "../../components/ScrollToTop/ScrollToTop";

function BudgetDetails({
  potjes,
  transacties,
  scheduledTransactions = [],
  isLoading = false,
  errorMessage = "",
  onBudgetDataChanged,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = useSession();

  const potje = potjes.find((item) => item.id === id);
  const potjeTransacties = transacties.filter((transaction) => transaction.potId === id);
  const potjeScheduledTransactions = scheduledTransactions.filter(
    (scheduledTransaction) => scheduledTransaction.potId === id,
  );

  const [budgetAfhalenAmount, setBudgetAfhalenAmount] = useState("");
  const [budgetAfhalenNaam, setBudgetAfhalenNaam] = useState(
    `${potje?.name || ""} afschrijving`,
  );
  const [budgetAfhalenCategory, setBudgetAfhalenCategory] = useState("overig");
  const [, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isTransactionMutating, setIsTransactionMutating] = useState(false);

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
    .filter(
      (transaction) =>
        transaction.type === "expense" && transaction.status === "approved",
    )
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const historyData = useMemo(() => {
    const sortedTransactions = [...potjeTransacties].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
    const approvedTransactions = sortedTransactions.filter((transaction) => {
      if (transaction.type === "deposit") {
        return transaction.status === "approved";
      }

      return transaction.type === "expense" && transaction.status === "approved";
    });

    let runningBalance = 0;
    const points = [
      {
        shortLabel: "Start",
        fullLabel: potje?.createdAt ? `Start · ${formatDate(potje.createdAt)}` : "Start",
        balance: runningBalance,
      },
    ];

    approvedTransactions.forEach((transaction, index) => {
      runningBalance +=
        transaction.type === "deposit"
          ? Number(transaction.amount || 0)
          : -Number(transaction.amount || 0);

      points.push({
        shortLabel:
          approvedTransactions.length > 5
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

    points.push({
      shortLabel: "Nu",
      fullLabel: "Huidige stand",
      balance: remaining,
    });

    return points;
  }, [potje?.createdAt, potjeTransacties, remaining]);

  const scheduledTransactionItems = useMemo(
    () =>
      potjeScheduledTransactions
        .filter((scheduledTransaction) => scheduledTransaction.isActive)
        .sort((a, b) => {
          if (!a.nextExecutionDate) {
            return 1;
          }

          if (!b.nextExecutionDate) {
            return -1;
          }

          return new Date(a.nextExecutionDate) - new Date(b.nextExecutionDate);
        })
        .map((scheduledTransaction) => ({
          ...scheduledTransaction,
          itemType: "scheduled",
          recurrenceLabel:
            scheduledTransaction.recurrence === "daily"
              ? "Dagelijks"
              : "Maandelijks",
        })),
    [potjeScheduledTransactions],
  );

  if (isLoading) return <p style={{ padding: "20px" }}>Potje laden...</p>;
  if (errorMessage) return <p style={{ padding: "20px" }}>{errorMessage}</p>;
  if (!potje) return <p style={{ padding: "20px" }}>Potje niet gevonden.</p>;

  async function refreshBudgetData() {
    await onBudgetDataChanged?.();
  }

  async function handleTransactionSubmit(type) {
    const value = Number(budgetAfhalenAmount);

    if (!value || value <= 0 || !budgetAfhalenNaam.trim() || !session?.id) {
      return;
    }

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

      await refreshBudgetData();

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

  async function handleScheduledPaymentSubmit(formData) {
    if (!session?.id) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      await createScheduledTransaction({
        userId: session.id,
        potId: id,
        ...formData,
      });

      await refreshBudgetData();
    } catch (error) {
      setFeedback(
        error.message || "De geplande transactie kon niet worden opgeslagen.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleScheduledPaymentCancel() {
    setFeedback("");
  }

  async function handleTransactionUpdate(formData) {
    if (!editingTransaction || !session?.id) {
      return;
    }

    setIsTransactionMutating(true);

    try {
      if (editingTransaction.itemType === "scheduled") {
        await updateScheduledTransaction(editingTransaction.id, {
          userId: session.id,
          description: formData.description,
          amount: formData.amount,
          category: formData.category,
          recurrence: formData.recurrence,
          startDate: formData.startDate,
          endDate: formData.endDate,
        });
      } else {
        await updateTransaction(editingTransaction.id, {
          userId: session.id,
          ...formData,
        });
      }

      setEditingTransaction(null);
      await refreshBudgetData();
    } finally {
      setIsTransactionMutating(false);
    }
  }

  async function confirmDeleteTransaction() {
    if (!transactionToDelete || !session?.id) {
      return;
    }

    setIsTransactionMutating(true);

    try {
      if (transactionToDelete.itemType === "scheduled") {
        await deleteScheduledTransaction(session.id, transactionToDelete.id);
      } else {
        await deleteTransaction(session.id, transactionToDelete.id);
      }

      setTransactionToDelete(null);
      await refreshBudgetData();
    } catch (error) {
      setFeedback(
        error.message ||
          (transactionToDelete.itemType === "scheduled"
            ? "Het geplande bedrag kon niet worden verwijderd."
            : "De transactie kon niet worden verwijderd."),
      );
    } finally {
      setIsTransactionMutating(false);
    }
  }

  const hasValidInput =
    budgetAfhalenNaam.trim() !== "" &&
    Number(budgetAfhalenAmount) > 0 &&
    !isSubmitting;
  const isWithdrawValid = hasValidInput && Number(budgetAfhalenAmount) <= remaining;
  const isDepositValid = hasValidInput;

  return (
    <main className="BudgetDetails-page">
      <ScrollToTop />

      <div className="BudgetDetails-page__header">
        <div className="BudgetDetails-page__back">
          <BackBtn />
        </div>

        <div className="BudgetDetails-page__actions">
          <button
            className="BudgetDetails-page__edit"
            type="button"
            onClick={() => navigate(`/potje-bewerken/${potje.id}`)}
          >
            <Pencil size={16} />
            Potje bewerken
          </button>
        </div>
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
        onDepositSubmit={() => handleTransactionSubmit("deposit")}
        onWithdrawSubmit={() => handleTransactionSubmit("expense")}
        isSubmitting={isSubmitting}
      />

      <ScheduledPaymentForm
        potName={potje.name}
        onSubmit={handleScheduledPaymentSubmit}
        onCancel={handleScheduledPaymentCancel}
      />

      <BudgetTransactionsSection
        transactions={potjeTransacties}
        scheduledItems={scheduledTransactionItems}
        iconName={potje.icon}
        potId={potje.id}
        onEditTransaction={setEditingTransaction}
        onDeleteTransaction={setTransactionToDelete}
        isMutating={isTransactionMutating}
      />

      {editingTransaction ? (
        <TransactionEditModal
          key={`${editingTransaction.itemType || "transaction"}-${editingTransaction.id}`}
          transaction={editingTransaction}
          isSubmitting={isTransactionMutating}
          onCancel={() => setEditingTransaction(null)}
          onSubmit={handleTransactionUpdate}
        />
      ) : null}

      {transactionToDelete ? (
        <ConfirmModal
          title={
            transactionToDelete.itemType === "scheduled"
              ? "Gepland bedrag verwijderen?"
              : "Transactie verwijderen?"
          }
          description={
            transactionToDelete.itemType === "scheduled"
              ? "Dit geplande bedrag stopt en wordt verwijderd."
              : "Deze transactie wordt definitief verwijderd."
          }
          cancelLabel="Annuleren"
          confirmLabel={isTransactionMutating ? "Bezig..." : "Verwijderen"}
          onCancel={() => setTransactionToDelete(null)}
          onConfirm={confirmDeleteTransaction}
        />
      ) : null}
    </main>
  );
}

export default BudgetDetails;
