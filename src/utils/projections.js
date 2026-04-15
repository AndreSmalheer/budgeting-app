/**
 * Calculates the estimated date to reach a target amount based on scheduled deposits.
 * 
 * @param {number} currentBalance - The current amount in the pot.
 * @param {number} targetAmount - The target goal for the pot.
 * @param {Array} scheduledTransactions - Array of scheduled transactions for this pot.
 * @returns {Date|null} The estimated date or null if no projection can be made.
 */
export function calculateGoalReachDate(currentBalance, targetAmount, scheduledTransactions) {
  if (currentBalance >= targetAmount) {
    return new Date();
  }

  const deposits = scheduledTransactions.filter(
    (t) => t.type === "deposit" && t.isScheduled && t.amount > 0
  );

  if (deposits.length === 0) {
    return null;
  }

  // Calculate total daily deposit equivalent
  let dailyDeposit = 0;
  deposits.forEach((t) => {
    const amount = Number(t.amount);
    switch (t.recurrence) {
      case "daily":
        dailyDeposit += amount;
        break;
      case "weekly":
        dailyDeposit += amount / 7;
        break;
      case "monthly":
        dailyDeposit += amount / 30; // Approximation
        break;
      default:
        break;
    }
  });

  if (dailyDeposit <= 0) {
    return null;
  }

  const amountToGo = targetAmount - currentBalance;
  const daysNeeded = Math.ceil(amountToGo / dailyDeposit);

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + daysNeeded);

  return estimatedDate;
}

/**
 * Returns a human-readable string for the time remaining to reach a goal.
 * 
 * @param {Date} targetDate - The estimated date to reach the goal.
 * @returns {string} Human-readable remaining time.
 */
export function formatRemainingTime(targetDate) {
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Doel bereikt!";
  if (diffDays === 1) return "morgen";
  if (diffDays < 7) return `over ${diffDays} dagen`;
  
  const weeks = Math.floor(diffDays / 7);
  const remainingDays = diffDays % 7;
  
  if (weeks < 4) {
    return `over ${weeks} ${weeks === 1 ? "week" : "weken"}${remainingDays > 0 ? ` en ${remainingDays} ${remainingDays === 1 ? "dag" : "dagen"}` : ""}`;
  }

  const months = Math.floor(diffDays / 30);
  if (months < 12) {
    return `over ${months} ${months === 1 ? "maand" : "maanden"}`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return `over ${years} ${years === 1 ? "jaar" : "jaar"}${remainingMonths > 0 ? ` en ${remainingMonths} ${remainingMonths === 1 ? "maand" : "maanden"}` : ""}`;
}
