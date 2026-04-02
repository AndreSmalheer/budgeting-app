import { useMemo } from "react";
import Header from "../../components/Header/Header";
import BalanceOverview from "../../components/home/BalanceOverview";
import BudgetSection from "../../components/home/BudgetSection";
import RecentTransactionsSection from "../../components/home/RecentTransactionsSection";
import "./HomePage.css";

function HomePage({ potjes = [], transacties = [] }) {
  const { incomeTotal, expenseTotal, spendingData, recentPotjes } = useMemo(() => {
    const incomeTotal = potjes.reduce((sum, potje) => sum + (potje.budget || 0), 0);

    const expenseTotal = transacties
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

    const spendingData = potjes
      .map((potje) => {
        const spent = transacties
          .filter(
            (transaction) =>
              transaction.potjeId === potje.id && transaction.type === "expense",
          )
          .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

        return {
          name: potje.name,
          value: spent,
        };
      })
      .filter((item) => item.value > 0);

    const recentPotjes = [...potjes]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    return { incomeTotal, expenseTotal, spendingData, recentPotjes };
  }, [potjes, transacties]);

  return (
    <>
      <Header />
      <BalanceOverview
        incomeTotal={incomeTotal}
        expenseTotal={expenseTotal}
        spendingData={spendingData}
      />
      <BudgetSection potjes={recentPotjes} transacties={transacties} />
      <RecentTransactionsSection transacties={transacties} potjes={potjes} />
    </>
  );
}

export default HomePage;
