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
  const items = [...scheduledItems, ...transactions];
  const visibleTransactions = items.slice(0, 5);

  return (
    <div className="transaction-list budget-details-page">
      <div className="transaction-list__header">
        <h3 className="transaction-list__title">Transacties</h3>
        {items.length > 5 && (
          <Link className="transaction-list__see-all" to={`/see-all/transacties/pot/${potId}`}>
            Alles
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <p className="empty-state">Er zijn nog geen transacties voor dit potje.</p>
      ) : (
        visibleTransactions.map((transaction) => (
          <TransactionItem
            key={`${transaction.itemType || "transaction"}-${transaction.id}`}
            className="transaction-potje"
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
                ? `Scheduled · ${transaction.recurrenceLabel}`
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
