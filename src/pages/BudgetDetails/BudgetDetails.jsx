import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  Calculator,
  MoreHorizontal,
  Pencil,
  ArrowLeft,
  ChevronDown,
  X,
  Delete,
  Calendar,
} from "lucide-react";
import { createPortal } from "react-dom";
import { LucideIcon } from "../../utils/icons";
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
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-sheet-handle" />
        <h2>{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function TransactionFlowModal({
  title,
  subtitle,
  potjeIcon,
  onClose,
  amount,
  setAmount,
  category,
  setCategory,
  categories,
  isValid,
  isSubmitting,
  onSubmit,
  subtext,
  submitLabel,
  showCalendarOption = false,
  isScheduled = false,
  setIsScheduled,
  schedStart,
  setSchedStart,
  schedEnd,
  setSchedEnd,
  schedRepeat,
  setSchedRepeat,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (
        e.target.tagName === "SELECT" ||
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      const key = e.key;
      if (key >= "0" && key <= "9") {
        setAmount((prev) => {
          if (!prev || prev === "0") return key;
          const dotIndex = prev.indexOf(".");
          if (dotIndex !== -1 && prev.length - dotIndex > 2) {
            return prev;
          }
          return prev + key;
        });
      } else if (key === "Backspace") {
        setAmount((prev) => {
          if (!prev || prev.length <= 1) return "";
          return prev.slice(0, -1);
        });
      } else if (key === "." || key === ",") {
        setAmount((prev) => {
          if (!prev) return "0.";
          if (prev.includes(".")) return prev;
          return prev + ".";
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setAmount]);

  const handleKeypadPress = (val) => {
    setAmount((prev) => {
      if (val === "backspace") {
        if (!prev || prev.length <= 1) return "";
        return prev.slice(0, -1);
      }
      if (val === ".") {
        if (!prev) return "0.";
        if (prev.includes(".")) return prev;
        return prev + ".";
      }
      if (!prev || prev === "0") return val;
      const dotIndex = prev.indexOf(".");
      if (dotIndex !== -1 && prev.length - dotIndex > 2) {
        return prev;
      }
      return prev + val;
    });
  };

  const displayAmount = amount ? amount.replace(".", ",") : "0";

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal modal--flow">
        <div className="modal-flow__header">
          <button
            className="modal-flow__back-btn"
            onClick={onClose}
            aria-label="Terug"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="modal-flow__title-group">
            <h3>{title}</h3>
            {subtitle && (
              <span className="modal-flow__subtitle">{subtitle}</span>
            )}
          </div>
          <div className="modal-flow__avatar">
            {potjeIcon && <LucideIcon name={potjeIcon} size={20} />}
          </div>
        </div>

        <div className="modal-flow__amount-display">
          <span className="modal-flow__currency">€</span>
          <span className="modal-flow__amount">
            {displayAmount.split("").map((char, index) => (
              <span key={`${index}-${char}`} className="modal-flow__digit">
                {char}
              </span>
            ))}
          </span>
        </div>
        {subtext && <div className="modal-flow__subtext">{subtext}</div>}

        <div className="modal-flow__category-wrapper">
          <div className="modal-flow__category-pill">
            <span className="modal-flow__category-label">
              {categories.find((c) => c.value === category)?.label || "Overig"}
            </span>
            <ChevronDown size={14} className="modal-flow__category-chevron" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="modal-flow__category-select"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showCalendarOption && (
          <div className={`modal-flow__scheduling-wrapper ${isScheduled ? "is-open" : ""}`}>
            <div className="modal-flow__scheduling-section">
              <div className="modal-flow__scheduling-row">
                <div className="modal-flow__field">
                  <label>Startdatum</label>
                  <input
                    type="date"
                    value={schedStart}
                    onChange={(e) => setSchedStart(e.target.value)}
                    className="modal-flow__date-input"
                  />
                </div>
                <div className="modal-flow__field">
                  <label>Einddatum (optioneel)</label>
                  <input
                    type="date"
                    value={schedEnd}
                    onChange={(e) => setSchedEnd(e.target.value)}
                    className="modal-flow__date-input"
                  />
                </div>
              </div>
              <div className="modal-flow__field">
                <label>Herhaling</label>
                <div className="modal-flow__repeat-toggle">
                  <button
                    type="button"
                    className={`repeat-toggle-btn ${schedRepeat === "daily" ? "active" : ""}`}
                    onClick={() => setSchedRepeat("daily")}
                  >
                    Dagelijks
                  </button>
                  <button
                    type="button"
                    className={`repeat-toggle-btn ${schedRepeat === "monthly" ? "active" : ""}`}
                    onClick={() => setSchedRepeat("monthly")}
                  >
                    Maandelijks
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="modal-flow__actions">
          {showCalendarOption ? (
            <button
              type="button"
              className={`btn-circle-calendar ${isScheduled ? "btn-circle-calendar--active" : ""}`}
              onClick={() => setIsScheduled(!isScheduled)}
              aria-label="Inplannen toggle"
            >
              <Calendar size={20} />
            </button>
          ) : (
            <button
              className="btn-circle-cancel"
              onClick={onClose}
              aria-label="Annuleren"
            >
              <X size={20} />
            </button>
          )}
          <button
            className={`btn-pill-save ${!isValid ? "disabled" : ""}`}
            onClick={onSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting
              ? "Bezig..."
              : isScheduled
                ? "Inplannen"
                : submitLabel}
          </button>
        </div>

        <div className="modal-flow__keypad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleKeypadPress(num)}
              className="keypad-btn"
            >
              {num}
            </button>
          ))}
          <button onClick={() => handleKeypadPress(".")} className="keypad-btn">
            ,
          </button>
          <button onClick={() => handleKeypadPress("0")} className="keypad-btn">
            0
          </button>
          <button
            onClick={() => handleKeypadPress("backspace")}
            className="keypad-btn keypad-btn--backspace"
            aria-label="Wissen"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function CalculatorFlowModal({
  potje,
  monthlyIncome,
  valueInput,
  setValueInput,
  daysWorth,
  onBack,
  onClose,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (
        e.target.tagName === "SELECT" ||
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      const key = e.key;
      if (key >= "0" && key <= "9") {
        setValueInput((prev) => {
          if (!prev || prev === "0") return key;
          const dotIndex = prev.indexOf(".");
          if (dotIndex !== -1 && prev.length - dotIndex > 2) {
            return prev;
          }
          return prev + key;
        });
      } else if (key === "Backspace") {
        setValueInput((prev) => {
          if (!prev || prev.length <= 1) return "";
          return prev.slice(0, -1);
        });
      } else if (key === "." || key === ",") {
        setValueInput((prev) => {
          if (!prev) return "0.";
          if (prev.includes(".")) return prev;
          return prev + ".";
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setValueInput]);

  const handleKeypadPress = (val) => {
    setValueInput((prev) => {
      if (val === "backspace") {
        if (!prev || prev.length <= 1) return "";
        return prev.slice(0, -1);
      }
      if (val === ".") {
        if (!prev) return "0.";
        if (prev.includes(".")) return prev;
        return prev + ".";
      }
      if (!prev || prev === "0") return val;
      const dotIndex = prev.indexOf(".");
      if (dotIndex !== -1 && prev.length - dotIndex > 2) {
        return prev;
      }
      return prev + val;
    });
  };

  const displayAmount = valueInput ? valueInput.replace(".", ",") : "0";

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal modal--flow">
        <div className="modal-flow__header">
          <button
            className="modal-flow__back-btn"
            onClick={onBack}
            aria-label="Terug"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="modal-flow__title-group">
            <h3>Inkomenscalculator</h3>
            <span className="modal-flow__subtitle">{`voor ${potje.name}`}</span>
          </div>
          <div className="modal-flow__avatar">
            <LucideIcon name={potje.icon} size={20} />
          </div>
        </div>

        <div className="modal-flow__amount-display">
          <span className="modal-flow__currency">€</span>
          <span className="modal-flow__amount">
            {displayAmount.split("").map((char, index) => (
              <span key={`${index}-${char}`} className="modal-flow__digit">
                {char}
              </span>
            ))}
          </span>
        </div>
        <div className="modal-flow__subtext">
          Maandelijks gepland inkomen: €{" "}
          {monthlyIncome.toFixed(2).replace(".", ",")}
        </div>

        <div
          className="modal-flow__calc-result-wrapper"
          style={{
            minHeight: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          {daysWorth !== null && daysWorth > 0 ? (
            <div
              className="bd-calc-result"
              style={{ width: "100%", marginTop: 0 }}
            >
              <span>Dit bedrag kost je</span>
              <strong>
                {daysWorth.toFixed(1)} dag{daysWorth !== 1 ? "en" : ""}
              </strong>
              <small>aan gepland maandinkomen.</small>
            </div>
          ) : (
            <div></div>
          )}
        </div>

        <div className="modal-flow__keypad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleKeypadPress(num)}
              className="keypad-btn"
            >
              {num}
            </button>
          ))}
          <button onClick={() => handleKeypadPress(".")} className="keypad-btn">
            ,
          </button>
          <button onClick={() => handleKeypadPress("0")} className="keypad-btn">
            0
          </button>
          <button
            onClick={() => handleKeypadPress("backspace")}
            className="keypad-btn keypad-btn--backspace"
            aria-label="Wissen"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
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
  const [isScheduled, setIsScheduled] = useState(false);

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
        fullLabel: potje?.createdAt
          ? `Start · ${formatDate(potje.createdAt)}`
          : "Start",
        balance: running,
      },
    ];

    approved.forEach((t, index) => {
      running +=
        t.type === "deposit" ? Number(t.amount || 0) : -Number(t.amount || 0);
      points.push({
        shortLabel:
          approved.length > 5
            ? String(index + 1)
            : new Intl.DateTimeFormat("nl-NL", {
                day: "2-digit",
                month: "2-digit",
              }).format(new Date(t.createdAt)),
        fullLabel: `${t.type === "deposit" ? "Toegevoegd" : "Uitgave"} · ${formatDate(t.createdAt)}`,
        balance: running,
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
        .filter((t) => t.isActive)
        .sort((a, b) => {
          if (!a.nextExecutionDate) return 1;
          if (!b.nextExecutionDate) return -1;
          return new Date(a.nextExecutionDate) - new Date(b.nextExecutionDate);
        })
        .map((t) => ({
          ...t,
          itemType: "scheduled",
          recurrenceLabel:
            t.recurrence === "daily" ? "Dagelijks" : "Maandelijks",
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
    if (modal === "deposit" || modal === "withdraw") {
      setName("Overig");
    }
    if (modal === "deposit") {
      setSchedStart(new Date().toISOString().split("T")[0]);
    }
  }

  function closeModal() {
    setActiveModal(null);
    setAmount("");
    setCategory("overig");
    setIsScheduled(false);
    setSchedStart("");
    setSchedEnd("");
    setSchedRepeat("monthly");
    if (potje?.name) setName(`${potje.name} afschrijving`);
  }

  const handleCategoryChange = (val) => {
    setCategory(val);
    const categoryLabel =
      TRANSACTION_CATEGORIES.find((c) => c.value === val)?.label || "Overig";
    setName(categoryLabel);
  };

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
    if (!schedDesc.trim() || !schedAmount || !schedStart || !session?.id)
      return;
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
      setFeedback(
        error.message || "De geplande transactie kon niet worden opgeslagen.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleScheduledSubmitCombined() {
    const value = Number(amount);
    if (!name.trim() || !value || value <= 0 || !schedStart || !session?.id)
      return;
    setIsSubmitting(true);
    setFeedback("");

    try {
      await createScheduledTransaction({
        userId: session.id,
        potId: id,
        description: name.trim(),
        amount: value,
        type: "deposit",
        category,
        startDate: schedStart,
        endDate: schedEnd,
        recurrence: schedRepeat,
      });
      await refreshBudgetData();
      closeModal();
    } catch (error) {
      setFeedback(
        error.message || "De geplande transactie kon niet worden opgeslagen.",
      );
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

  const isDepositValid =
    name.trim() !== "" &&
    Number(amount) > 0 &&
    (!isScheduled || !!schedStart) &&
    !isSubmitting;
  const isWithdrawValid = isDepositValid && Number(amount) <= remaining;
  const isSchedValid =
    schedDesc.trim() !== "" && Number(schedAmount) > 0 && !!schedStart;

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
        <TransactionFlowModal
          title="Geld toevoegen"
          subtitle={`voor ${potje.name}`}
          potjeIcon={potje.icon}
          onClose={closeModal}
          amount={amount}
          setAmount={setAmount}
          category={category}
          setCategory={handleCategoryChange}
          categories={TRANSACTION_CATEGORIES}
          isValid={isDepositValid}
          isSubmitting={isSubmitting}
          onSubmit={() => {
            if (isScheduled) {
              handleScheduledSubmitCombined();
            } else {
              handleTransactionSubmit("deposit");
            }
          }}
          subtext="Geen transactiekosten"
          submitLabel="Toevoegen"
          showCalendarOption={true}
          isScheduled={isScheduled}
          setIsScheduled={setIsScheduled}
          schedStart={schedStart}
          setSchedStart={setSchedStart}
          schedEnd={schedEnd}
          setSchedEnd={setSchedEnd}
          schedRepeat={schedRepeat}
          setSchedRepeat={setSchedRepeat}
        />
      )}

      {/* ── Withdraw modal ── */}
      {activeModal === "withdraw" && (
        <TransactionFlowModal
          title="Bedrag afhalen"
          subtitle={`van ${potje.name}`}
          potjeIcon={potje.icon}
          onClose={closeModal}
          amount={amount}
          setAmount={setAmount}
          category={category}
          setCategory={handleCategoryChange}
          categories={TRANSACTION_CATEGORIES}
          isValid={isWithdrawValid}
          isSubmitting={isSubmitting}
          onSubmit={() => handleTransactionSubmit("expense")}
          subtext={`Huidig stand: € ${Number(remaining).toFixed(2).replace(".", ",")}`}
          submitLabel="Afhalen"
        />
      )}

      {/* ── Meer modal (schedule + calculator) ── */}
      {activeModal === "meer" && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="modal modal--flow">
            <div className="modal-flow__header">
              <button
                className="modal-flow__back-btn"
                onClick={closeModal}
                aria-label="Sluiten"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="modal-flow__title-group">
                <h3>Meer opties</h3>
                <span className="modal-flow__subtitle">{`voor ${potje.name}`}</span>
              </div>
              <div className="modal-flow__avatar">
                <LucideIcon name={potje.icon} size={20} />
              </div>
            </div>

            <div className="bd-meer-options" style={{ marginBottom: "24px" }}>
              <button
                className="bd-meer-option-btn"
                type="button"
                onClick={() => setActiveModal("calculator")}
              >
                <span className="bd-meer-option-icon">
                  <Calculator size={22} strokeWidth={1.75} />
                </span>
                <span className="bd-meer-option-text">
                  <strong>Inkomenscalculator</strong>
                  <small>Hoeveel werkdagen kost dit bedrag je?</small>
                </span>
              </button>
            </div>

            <div className="modal-flow__actions" style={{ marginBottom: 0 }}>
              <button
                className="btn-circle-cancel"
                onClick={closeModal}
                aria-label="Sluiten"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Calculator modal ── */}
      {activeModal === "calculator" && (
        <CalculatorFlowModal
          potje={potje}
          monthlyIncome={monthlyIncome}
          valueInput={valueInput}
          setValueInput={setValueInput}
          daysWorth={daysWorth}
          onBack={() => setActiveModal("meer")}
          onClose={closeModal}
        />
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
