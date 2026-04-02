import { Link } from "react-router-dom";
import TransactionItem from "../transactions/TransactionItem";
import TransactionSection from "../transactions/TransactionSection";
import { formatDate } from "../../utils/formatters";

function RecentTransactionsSection({ transacties, potjes }) {
  const recentItems = [...transacties]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)
    .map((transaction) => {
      const potje = potjes.find((item) => item.id === transaction.potId);

      return (
        <TransactionItem
          key={transaction.id}
          description={transaction.description}
          meta={`${potje?.name || "Zonder potje"} · ${formatDate(transaction.createdAt)}`}
          amount={transaction.amount}
          isExpense={transaction.type === "expense"}
          iconName={potje?.icon}
        />
      );
    });

  return (
    <TransactionSection
      title="Recente transacties"
      action={
        <Link to="/see-all/transacties" className="recent-transactions__see-all">
          Alles
        </Link>
      }
      emptyText="Geen transacties"
      items={recentItems}
    />
  );
}

export default RecentTransactionsSection;
