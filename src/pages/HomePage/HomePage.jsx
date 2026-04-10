import { useMemo } from "react";
import BalanceOverview from "../../components/home/BalanceOverview";
import BudgetSection from "../../components/home/BudgetSection";
import RecentTransactionsSection from "../../components/home/RecentTransactionsSection";
import "./HomePage.css";

function HomePage({ potjes = [], transacties = [], isLoading = false, errorMessage = "" }) {
  const { incomeTotal, expenseTotal, spendingData, recentPotjes } = useMemo(() => {
    const incomeTotal = potjes.reduce(
      (sum, potje) => sum + Number(potje.currentBalance || 0),
      0,
    );

    const expenseTotal = transacties
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    const spendingMap = new Map();

    transacties.forEach((transaction) => {
      if (transaction.type !== "expense" || !transaction.potId) {
        return;
      }

      spendingMap.set(
        transaction.potId,
        (spendingMap.get(transaction.potId) || 0) + Number(transaction.amount || 0),
      );
    });

    const spendingData = potjes
      .map((potje) => ({
        name: potje.name,
        value: spendingMap.get(potje.id) || 0,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const recentPotjes = [...potjes]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    return { incomeTotal, expenseTotal, spendingData, recentPotjes };
  }, [potjes, transacties]);

  return (
    <main className="HomePage-shell">
      {isLoading && <p className="page-feedback">Budgetgegevens laden...</p>}
      {!isLoading && errorMessage && <p className="page-feedback">{errorMessage}</p>}
      <BalanceOverview
        incomeTotal={incomeTotal}
        expenseTotal={expenseTotal}
        spendingData={spendingData}
      />
      <BudgetSection potjes={recentPotjes} />
      <RecentTransactionsSection transacties={transacties} potjes={potjes} />
    </main>
  );
}

export default HomePage;
