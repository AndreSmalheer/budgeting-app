import { Link } from "react-router-dom";
import TransactionItem from "../transactions/TransactionItem";
import TransactionSection from "../transactions/TransactionSection";
import { formatDate } from "../../utils/formatters";
import {
  getTransactionStatusLabel,
  getTransactionStatusTone,
} from "../../utils/transactionStatus";

function RecentTransactionsSection({
  transacties,
  scheduledTransactions = [],
  potjes,
}) {
  const recentItems = [
    ...scheduledTransactions
      .filter((item) => item.isActive)
      .map((item) => ({
        ...item,
        itemType: "scheduled",
        sortDate: item.nextExecutionDate || item.startDate,
      })),
    ...transacties.map((transaction) => ({
      ...transaction,
      itemType: "transaction",
      sortDate: transaction.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate))
    .slice(0, 4)
    .map((item) => {
      const potje = potjes.find((entry) => entry.id === item.potId);

      return (
        <TransactionItem
          key={`${item.itemType}-${item.id}`}
          description={item.description}
          meta={
            item.itemType === "scheduled"
              ? `${potje?.name || "Zonder potje"} · Volgende uitvoering ${formatDate(
                  item.nextExecutionDate,
                )}`
              : `${potje?.name || "Zonder potje"} · ${formatDate(item.createdAt)}`
          }
          amount={item.amount}
          isExpense={item.type === "expense"}
          iconName={potje?.icon}
          categoryLabel={
            item.itemType === "scheduled"
              ? item.type === "deposit"
                ? "Bijschrijving"
                : "Afschrijving"
              : ""
          }
          statusLabel={
            item.itemType === "scheduled"
              ? item.recurrence === "daily"
                ? "Scheduled · Dagelijks"
                : "Scheduled · Maandelijks"
              : getTransactionStatusLabel(item.status)
          }
          statusTone={
            item.itemType === "scheduled"
              ? "scheduled"
              : getTransactionStatusTone(item.status)
          }
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
