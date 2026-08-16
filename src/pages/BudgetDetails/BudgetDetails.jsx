import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, CalendarClock, Calculator, MoreHorizontal, Pencil } from "lucide-react";
import { createPortal } from "react-dom";
import BackBtn from "../../components/BackBtn/BackBtn";
import BudgetDetailsChart from "../../components/budget/BudgetDetailsChart";
import BudgetTransactionsSection from "../../components/budget/BudgetTransactionsSection";
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
import {
  calculateGoalReachDate,
  formatRemainingTime,
} from "../../utils/projections";
import "./BudgetDetails.css";
import ScrollToTop from "../../components/ScrollToTop/ScrollToTop";

/* ── Inline modal portal for deposit/withdraw ── */
function TransactionModal({ title, onClose, children }) {
  return createPortal(
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-sheet-handle" />
        <h2>{title}</h2>
        {children}
      </div>
    </div>,
    document.body
  );
}

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
  const potjeTransacties = transacties.filter(
    (transaction) => transaction.potId === id,
  );
  const potjeScheduledTransactions = scheduledTransactions.filter(
    (scheduledTransaction) => scheduledTransaction.potId === id,
  );

  // Modal open states
  const [activeModal, setActiveModal] = useState(null); // "deposit" | "withdraw" | "schedule" | "calculator" | "meer"

  // Shared form state
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("overig");

  // Scheduled form state
  const [schedDesc, setSchedDesc] = useState("");
  const [schedAmount, setSchedAmount] = useState("");
  const [schedType, setSchedType] = useState("expense");
  const [schedCategory, setSchedCategory] = useState("overig");
  const [schedStart, setSchedStart] = useState("");
  const [schedEnd, setSchedEnd] = useState("");
  const [schedRepeat, setSchedRepeat] = useState("monthly");

  // Calculator state
  const [valueInput, setValueInput] = useState("");

  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isTransactionMutating, setIsTransactionMutating] = useState(false);

  useEffect(() => {
    if (potje?.name) {
      setName(`${potje.name} afschrijving`);
      setSchedDesc(`${potje.name} afschrijving`);
    }
  }, [potje?.name]);

  const monthlyIncome = useMemo(() => {
    return potjeScheduledTransactions
      .filter((t) => t.isActive && t.type === "deposit")
      .reduce((sum, t) => {
        const amt = Number(t.amount || 0);
        if (t.recurrence === "monthly") return sum + amt;
        if (t.recurrence === "daily") return sum + amt * 30;
        return sum;
      }, 0);
  }, [potjeScheduledTransactions]);

  const daysWorth = useMemo(() => {
    const value = Number(valueInput);
    if (!value || monthlyIncome <= 0) return null;
    return value / (monthlyIncome / 30);
  }, [valueInput, monthlyIncome]);

  const budget = Number(potje?.targetAmount) || 0;
  const remaining = Number(potje?.currentBalance) || 0;
  const depositTotal = potjeTransacties
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const expenseTotal = potjeTransacties
    .filter((t) => t.type === "expense" && t.status === "approved")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const estimatedDate = useMemo(() => {
    const normalizedScheduled = potjeScheduledTransactions.map((t) => ({
      ...t,
      isScheduled: true,
    }));
    return calculateGoalReachDate(remaining, budget, normalizedScheduled);
  }, [remaining, budget, potjeScheduledTransactions]);

  const estimatedTimeRemaining = estimatedDate
    ? formatRemainingTime(estimatedDate)
    : null;

  const historyData = useMemo(() => {
    const sorted = [...potjeTransacties].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
    const approved = sorted.filter((t) => {
      if (t.type === "deposit") return t.status === "approved";
      return t.type === "expense" && t.status === "approved";
    });

    let running = 0;
    const points = [
      {
        shortLabel: "Start",
        fullLabel: potje?.createdAt ? `Start · ${formatDate(potje.createdAt)}` : "Start",
        balance: running,
      },
    ];

    approved.forEach((t, index) => {
      running += t.type === "deposit" ? Number(t.amount || 0) : -Number(t.amount || 0);
      points.push({
        shortLabel:
          approved.length > 5
            ? String(index + 1)
            : new Intl.DateTimeFormat("nl-NL", { day: "2-digit", month: "2-digit" }).format(
                new Date(t.createdAt),
              ),
        fullLabel: `${t.type === "deposit" ? "Toegevoegd" : "Uitgave"} · ${formatDate(t.createdAt)}`,
        balance: running,
      });
    });

    points.push({ shortLabel: "Nu", fullLabel: "Huidige stand", balance: remaining });
    return points;
  }, [potje?.createdAt, potjeTransacties, remaining]);

  const scheduledTransactionItems = useMemo(
    () =>
      potjeScheduledTransactions
        .filter((t) => t.isActive)
        .sort((a, b) => {
          if (!a.nextExecutionDate) return 1;
          if (!b.nextExecutionDate) return -1;
          return new Date(a.nextExecutionDate) - new Date(b.nextExecutionDate);
        })
        .map((t) => ({
          ...t,
          itemType: "scheduled",
          recurrenceLabel: t.recurrence === "daily" ? "Dagelijks" : "Maandelijks",
        })),
    [potjeScheduledTransactions],
  );

  if (isLoading) return <p style={{ padding: "20px" }}>Potje laden...</p>;
  if (errorMessage) return <p style={{ padding: "20px" }}>{errorMessage}</p>;
  if (!potje) return <p style={{ padding: "20px" }}>Potje niet gevonden.</p>;

  async function refreshBudgetData() {
    await onBudgetDataChanged?.();
  }

  function openModal(modal) {
    setFeedback("");
    setActiveModal(modal);
  }

  function closeModal() {
    setActiveModal(null);
    setAmount("");
    setCategory("overig");
    if (potje?.name) setName(`${potje.name} afschrijving`);
  }

  async function handleTransactionSubmit(type) {
    const value = Number(amount);
    if (!value || value <= 0 || !name.trim() || !session?.id) return;

    setIsSubmitting(true);
    setFeedback("");

    try {
      await createTransaction({
        userId: session.id,
        potId: id,
        description: name.trim(),
        amount: value,
        type,
        category,
      });
      await refreshBudgetData();
      closeModal();
    } catch (error) {
      setFeedback(error.message || "De transactie kon niet worden opgeslagen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleScheduledSubmit() {
    if (!schedDesc.trim() || !schedAmount || !schedStart || !session?.id) return;
    setIsSubmitting(true);
    setFeedback("");

    try {
      await createScheduledTransaction({
        userId: session.id,
        potId: id,
        description: schedDesc.trim(),
        amount: Number(schedAmount),
        type: schedType,
        category: schedCategory,
        startDate: schedStart,
        endDate: schedEnd,
        recurrence: schedRepeat,
      });
      await refreshBudgetData();
      closeModal();
    } catch (error) {
      setFeedback(error.message || "De geplande transactie kon niet worden opgeslagen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTransactionUpdate(formData) {
    if (!editingTransaction || !session?.id) return;
    setIsTransactionMutating(true);
    try {
      if (editingTransaction.itemType === "scheduled") {
        await updateScheduledTransaction(editingTransaction.id, {
          userId: session.id,
          description: formData.description,
          amount: formData.amount,
          type: formData.type,
          category: formData.category,
          recurrence: formData.recurrence,
          startDate: formData.startDate,
          endDate: formData.endDate,
        });
      } else {
        await updateTransaction(editingTransaction.id, { userId: session.id, ...formData });
      }
      setEditingTransaction(null);
      await refreshBudgetData();
    } finally {
      setIsTransactionMutating(false);
    }
  }

  async function confirmDeleteTransaction() {
    if (!transactionToDelete || !session?.id) return;
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

  const isDepositValid = name.trim() !== "" && Number(amount) > 0 && !isSubmitting;
  const isWithdrawValid = isDepositValid && Number(amount) <= remaining;
  const isSchedValid = schedDesc.trim() !== "" && Number(schedAmount) > 0 && !!schedStart;

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
            Bewerken
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
          estimatedTimeRemaining={estimatedTimeRemaining}
        />
      </div>

      {/* ── 3-button action row ── */}
      <div className="bd-actions-row">
        <button
          className="bd-action-btn"
          type="button"
          onClick={() => openModal("deposit")}
        >
          <span className="bd-action-icon">
            <ArrowUpRight size={20} strokeWidth={2.5} />
          </span>
          <span>Toevoegen</span>
        </button>

        <button
          className="bd-action-btn"
          type="button"
          onClick={() => openModal("withdraw")}
        >
          <span className="bd-action-icon">
            <ArrowDownLeft size={20} strokeWidth={2.5} />
          </span>
          <span>Afhalen</span>
        </button>

        <button
          className="bd-action-btn"
          type="button"
          onClick={() => openModal("meer")}
        >
          <span className="bd-action-icon">
            <MoreHorizontal size={20} strokeWidth={2.5} />
          </span>
          <span>Meer</span>
        </button>
      </div>

      {feedback && <p className="page-feedback">{feedback}</p>}

      <BudgetTransactionsSection
        transactions={potjeTransacties}
        scheduledItems={scheduledTransactionItems}
        iconName={potje.icon}
        potId={potje.id}
        onEditTransaction={setEditingTransaction}
        onDeleteTransaction={setTransactionToDelete}
        isMutating={isTransactionMutating}
      />

      {/* ── Deposit modal ── */}
      {activeModal === "deposit" && (
        <TransactionModal title="Geld toevoegen" onClose={closeModal}>
          <div className="modal-form">
            <div className="modal-field">
              <label>Omschrijving</label>
              <input
                type="text"
                placeholder="Bijv. salaris of gift"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>Bedrag (€)</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>Categorie</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {TRANSACTION_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" type="button" onClick={closeModal}>Annuleren</button>
            <button
              className="btn-save"
              type="button"
              disabled={!isDepositValid}
              onClick={() => handleTransactionSubmit("deposit")}
            >
              {isSubmitting ? "Bezig..." : "Toevoegen"}
            </button>
          </div>
        </TransactionModal>
      )}

      {/* ── Withdraw modal ── */}
      {activeModal === "withdraw" && (
        <TransactionModal title="Bedrag afhalen" onClose={closeModal}>
          <div className="modal-form">
            <div className="modal-field">
              <label>Omschrijving</label>
              <input
                type="text"
                placeholder="Bijv. boodschappen"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>Bedrag (€)</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>Categorie</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {TRANSACTION_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" type="button" onClick={closeModal}>Annuleren</button>
            <button
              className="btn-save"
              type="button"
              disabled={!isWithdrawValid}
              onClick={() => handleTransactionSubmit("expense")}
            >
              {isSubmitting ? "Bezig..." : "Afhalen"}
            </button>
          </div>
        </TransactionModal>
      )}

      {/* ── Meer modal (schedule + calculator) ── */}
      {activeModal === "meer" && (
        <TransactionModal title="Meer opties" onClose={closeModal}>
          <div className="bd-meer-options">
            <button
              className="bd-meer-option-btn"
              type="button"
              onClick={() => setActiveModal("schedule")}
            >
              <span className="bd-meer-option-icon"><CalendarClock size={22} strokeWidth={1.75} /></span>
              <span className="bd-meer-option-text">
                <strong>Bedrag inplannen</strong>
                <small>Stel een dagelijkse of maandelijkse transactie in</small>
              </span>
            </button>
            <button
              className="bd-meer-option-btn"
              type="button"
              onClick={() => setActiveModal("calculator")}
            >
              <span className="bd-meer-option-icon"><Calculator size={22} strokeWidth={1.75} /></span>
              <span className="bd-meer-option-text">
                <strong>Inkomenscalculator</strong>
                <small>Hoeveel werkdagen kost dit bedrag je?</small>
              </span>
            </button>
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" type="button" onClick={closeModal}>Sluiten</button>
          </div>
        </TransactionModal>
      )}

      {/* ── Schedule modal ── */}
      {activeModal === "schedule" && (
        <TransactionModal title="Bedrag inplannen" onClose={closeModal}>
          <div className="modal-form">
            <div className="modal-field">
              <label>Omschrijving</label>
              <input
                type="text"
                placeholder="Bijv. huur of salaris"
                value={schedDesc}
                onChange={(e) => setSchedDesc(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>Bedrag (€)</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0,00"
                value={schedAmount}
                onChange={(e) => setSchedAmount(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>Type</label>
              <select value={schedType} onChange={(e) => setSchedType(e.target.value)}>
                <option value="expense">Afschrijving</option>
                <option value="deposit">Bijschrijving</option>
              </select>
            </div>
            <div className="modal-field">
              <label>Categorie</label>
              <select value={schedCategory} onChange={(e) => setSchedCategory(e.target.value)}>
                {TRANSACTION_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="modal-field">
              <label>Herhaling</label>
              <select value={schedRepeat} onChange={(e) => setSchedRepeat(e.target.value)}>
                <option value="daily">Dagelijks</option>
                <option value="monthly">Maandelijks</option>
              </select>
            </div>
            <div className="modal-field">
              <label>Startdatum</label>
              <input type="date" value={schedStart} onChange={(e) => setSchedStart(e.target.value)} />
            </div>
            <div className="modal-field">
              <label>Einddatum (optioneel)</label>
              <input type="date" value={schedEnd} onChange={(e) => setSchedEnd(e.target.value)} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" type="button" onClick={() => setActiveModal("meer")}>Terug</button>
            <button
              className="btn-save"
              type="button"
              disabled={!isSchedValid || isSubmitting}
              onClick={handleScheduledSubmit}
            >
              {isSubmitting ? "Bezig..." : "Inplannen"}
            </button>
          </div>
        </TransactionModal>
      )}

      {/* ── Calculator modal ── */}
      {activeModal === "calculator" && (
        <TransactionModal title="Inkomenscalculator" onClose={closeModal}>
          <p style={{ margin: "8px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
            Maandelijks gepland inkomen: <strong style={{ color: "var(--success-strong)" }}>€{monthlyIncome.toFixed(2)}</strong>
          </p>
          <div className="modal-form">
            <div className="modal-field">
              <label>Bedrag (€)</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Voer een bedrag in..."
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
              />
            </div>
          </div>
          {daysWorth !== null && (
            <div className="bd-calc-result">
              <span>Dit bedrag kost je</span>
              <strong>{daysWorth.toFixed(1)} dag{daysWorth !== 1 ? "en" : ""}</strong>
              <small>aan gepland maandinkomen.</small>
            </div>
          )}
          <div className="modal-actions">
            <button className="btn-cancel" type="button" onClick={() => setActiveModal("meer")}>Terug</button>
            <button className="btn-cancel" type="button" onClick={closeModal}>Sluiten</button>
          </div>
        </TransactionModal>
      )}

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
