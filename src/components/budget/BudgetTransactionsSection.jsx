import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import TransactionItem from "../transactions/TransactionItem";
import { formatDate } from "../../utils/formatters";
import {
  getTransactionStatusLabel,
  getTransactionStatusTone,
} from "../../utils/transactionStatus";

function BudgetTransactionsSection({
  transactions,
  scheduledItems = [],
  iconName,
  potId,
  onEditTransaction,
  onDeleteTransaction,
  isMutating = false,
}) {
  const [filter, setFilter] = useState("all"); // "all" | "deposit" | "expense"

  const allItems = [...scheduledItems, ...transactions];

  const filtered = allItems.filter((item) => {
    if (filter === "all") return true;
    if (filter === "deposit") return item.type === "deposit";
    if (filter === "expense") return item.type === "expense";
    return true;
  });

  const visibleTransactions = filtered.slice(0, 5);

  return (
    <div className="transaction-list budget-details-page">
      {/* Section header */}
      <div className="transaction-list__header">
        <h3 className="transaction-list__title">Transacties</h3>
        {allItems.length > 5 && (
          <Link
            className="transaction-list__see-all"
            to={`/see-all/transacties/pot/${potId}`}
          >
            Alles
          </Link>
        )}
      </div>

      {/* Segmented filter — Inkomen / Uitgaven */}
      <div className="bd-tx-filter">
        <button
          className={`bd-tx-chip${filter === "all" ? " active" : ""}`}
          type="button"
          onClick={() => setFilter("all")}
        >
          Alles
        </button>
        <button
          className={`bd-tx-chip${filter === "deposit" ? " active" : ""}`}
          type="button"
          onClick={() => setFilter("deposit")}
        >
          Inkomen
        </button>
        <button
          className={`bd-tx-chip${filter === "expense" ? " active" : ""}`}
          type="button"
          onClick={() => setFilter("expense")}
        >
          Uitgaven
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="empty-state">Geen transacties gevonden.</p>
      ) : (
        visibleTransactions.map((transaction) => (
          <TransactionItem
            key={`${transaction.itemType || "transaction"}-${transaction.id}`}
            className={`transaction-potje${transaction.itemType === "scheduled" ? " transaction-potje--scheduled" : ""}`}
            description={transaction.description}
            meta={
              transaction.itemType === "scheduled"
                ? `Volgende uitvoering · ${formatDate(transaction.nextExecutionDate)}`
                : formatDate(transaction.createdAt)
            }
            amount={transaction.amount}
            isExpense={transaction.type === "expense"}
            iconName={iconName}
            categoryLabel={
              transaction.itemType === "scheduled"
                ? transaction.type === "deposit"
                  ? "Bijschrijving"
                  : "Afschrijving"
                : transaction.categoryLabel
            }
            statusLabel={
              transaction.itemType === "scheduled"
                ? `Gepland · ${transaction.recurrenceLabel}`
                : getTransactionStatusLabel(transaction.status)
            }
            statusTone={
              transaction.itemType === "scheduled"
                ? "scheduled"
                : getTransactionStatusTone(transaction.status)
            }
            action={
              <div className="item-actions">
                <button
                  className="icon-action-btn"
                  type="button"
                  disabled={isMutating}
                  aria-label={`Bewerk ${transaction.description}`}
                  onClick={() => onEditTransaction?.(transaction)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="icon-action-btn delete-btn"
                  type="button"
                  disabled={isMutating}
                  aria-label={`Verwijder ${transaction.description}`}
                  onClick={() => onDeleteTransaction?.(transaction)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            }
          />
        ))
      )}
    </div>
  );
}

export default BudgetTransactionsSection;
