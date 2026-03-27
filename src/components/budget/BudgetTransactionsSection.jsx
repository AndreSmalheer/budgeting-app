import TransactionItem from "../transactions/TransactionItem";

function BudgetTransactionsSection({ transactions, iconName }) {
  return (
    <div className="transaction-list budget-details-page">
      <div className="transaction-list__header">
        <h3 className="transaction-list__title">Transacties</h3>
      </div>

      {transactions.length === 0 ? (
        <p className="empty-state">Er zijn nog geen transacties voor dit potje.</p>
      ) : (
        transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            className="transaction-potje"
            description={transaction.description}
            meta={transaction.date}
            amount={transaction.amount}
            isExpense={transaction.type === "expense"}
            iconName={iconName}
          />
        ))
      )}
    </div>
  );
}

export default BudgetTransactionsSection;
