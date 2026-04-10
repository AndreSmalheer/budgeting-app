import { Link } from "react-router-dom";
import TransactionItem from "../transactions/TransactionItem";
import { formatDate } from "../../utils/formatters";
import {
  getTransactionStatusLabel,
  getTransactionStatusTone,
} from "../../utils/transactionStatus";

function BudgetTransactionsSection({ transactions, iconName, potId }) {
  const visibleTransactions = transactions.slice(0, 5);

  return (
    <div className="transaction-list budget-details-page">
      <div className="transaction-list__header">
        <h3 className="transaction-list__title">Transacties</h3>
        {transactions.length > 5 && (
          <Link className="transaction-list__see-all" to={`/see-all/transacties/pot/${potId}`}>
            Alles
          </Link>
        )}
      </div>

      {transactions.length === 0 ? (
        <p className="empty-state">Er zijn nog geen transacties voor dit potje.</p>
      ) : (
        visibleTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            className="transaction-potje"
            description={transaction.description}
            meta={formatDate(transaction.createdAt)}
            amount={transaction.amount}
            isExpense={transaction.type === "expense"}
            iconName={iconName}
            statusLabel={getTransactionStatusLabel(transaction.status)}
            statusTone={getTransactionStatusTone(transaction.status)}
          />
        ))
      )}
    </div>
  );
}

export default BudgetTransactionsSection;
