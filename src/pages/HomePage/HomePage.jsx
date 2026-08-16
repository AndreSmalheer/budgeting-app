import { useMemo } from "react";
import BalanceOverview from "../../components/home/BalanceOverview";
import BudgetSection from "../../components/home/BudgetSection";
import RecentTransactionsSection from "../../components/home/RecentTransactionsSection";
import "./HomePage.css";

function HomePage({
  potjes = [],
  transacties = [],
  scheduledTransactions = [],
  isLoading = false,
  errorMessage = "",
}) {
  const { incomeTotal, monthlyPlannedTotal, potValueData, orderedPotjes } = useMemo(() => {
    const incomeTotal = potjes.reduce(
      (sum, potje) => sum + Number(potje.currentBalance || 0),
      0,
    );

    const monthlyPlannedTotal = scheduledTransactions.reduce((sum, transaction) => {
        if (!transaction.isActive) return sum;

        const amount = Number(transaction.amount || 0);
        const monthlyAmount = transaction.recurrence === "daily" ? amount * 30 : amount;
        return transaction.type === "expense"
          ? sum + monthlyAmount
          : sum - monthlyAmount;
      }, 0);

    const potValueData = [...potjes]
      .sort((a, b) => (Number(b.currentBalance) || 0) - (Number(a.currentBalance) || 0))
      .map((potje) => ({
        name: potje.name,
        value: Number(potje.currentBalance || 0),
      }));

    const orderedPotjes = [...potjes]
      .sort((a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0))

    return { incomeTotal, monthlyPlannedTotal, potValueData, orderedPotjes };
  }, [potjes, scheduledTransactions]);

  return (
    <main className="HomePage-shell">
      {isLoading && <p className="page-feedback">Budgetgegevens laden...</p>}
      {!isLoading && errorMessage && <p className="page-feedback">{errorMessage}</p>}
      <BalanceOverview
        incomeTotal={incomeTotal}
        monthlyPlannedTotal={monthlyPlannedTotal}
        potValueData={potValueData}
      />
      <BudgetSection potjes={orderedPotjes} />
      <RecentTransactionsSection
        transacties={transacties}
        scheduledTransactions={scheduledTransactions}
        potjes={potjes}
      />
    </main>
  );
}

export default HomePage;
