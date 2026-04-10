import { useMemo } from "react";
import BalanceOverview from "../../components/home/BalanceOverview";
import BudgetSection from "../../components/home/BudgetSection";
import RecentTransactionsSection from "../../components/home/RecentTransactionsSection";
import "./HomePage.css";

function HomePage({ potjes = [], transacties = [], isLoading = false, errorMessage = "" }) {
  const { incomeTotal, expenseTotal, potValueData, recentPotjes } = useMemo(() => {
    const incomeTotal = potjes.reduce(
      (sum, potje) => sum + Number(potje.currentBalance || 0),
      0,
    );

    const expenseTotal = transacties
      .filter(
        (transaction) =>
          transaction.type === "expense" && transaction.status === "approved",
      )
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    const potValueData = potjes
      .map((potje) => ({
        name: potje.name,
        value: Number(potje.currentBalance || 0),
      }))
      .sort((a, b) => b.value - a.value);

    const recentPotjes = [...potjes]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    return { incomeTotal, expenseTotal, potValueData, recentPotjes };
  }, [potjes, transacties]);

  return (
    <main className="HomePage-shell">
      {isLoading && <p className="page-feedback">Budgetgegevens laden...</p>}
      {!isLoading && errorMessage && <p className="page-feedback">{errorMessage}</p>}
      <BalanceOverview
        incomeTotal={incomeTotal}
        expenseTotal={expenseTotal}
        potValueData={potValueData}
      />
      <BudgetSection potjes={recentPotjes} />
      <RecentTransactionsSection transacties={transacties} potjes={potjes} />
    </main>
  );
}

export default HomePage;
