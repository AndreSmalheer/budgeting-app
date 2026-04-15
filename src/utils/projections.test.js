import { calculateGoalReachDate, formatRemainingTime } from "./projections";
import { describe, it, expect } from "vitest";

describe("projections utility", () => {
  describe("calculateGoalReachDate", () => {
    it("returns a date in the future for a valid scheduled deposit", () => {
      const currentBalance = 100;
      const targetAmount = 200;
      const scheduledTransactions = [
        {
          amount: 10,
          type: "deposit",
          isScheduled: true,
          recurrence: "daily",
        },
      ];

      const result = calculateGoalReachDate(currentBalance, targetAmount, scheduledTransactions);
      expect(result).toBeInstanceOf(Date);
      
      const now = new Date();
      const diffDays = Math.ceil((result.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(10);
    });

    it("returns null if no scheduled deposits exist", () => {
      const currentBalance = 100;
      const targetAmount = 200;
      const scheduledTransactions = [];

      const result = calculateGoalReachDate(currentBalance, targetAmount, scheduledTransactions);
      expect(result).toBeNull();
    });

    it("handles weekly recurrence correctly", () => {
      const currentBalance = 0;
      const targetAmount = 100;
      const scheduledTransactions = [
        {
          amount: 70,
          type: "deposit",
          isScheduled: true,
          recurrence: "weekly",
        },
      ];

      const result = calculateGoalReachDate(currentBalance, targetAmount, scheduledTransactions);
      const now = new Date();
      const diffDays = Math.ceil((result.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(10);
    });

    it("returns current date if goal is already reached", () => {
      const result = calculateGoalReachDate(200, 100, []);
      const now = new Date();
      expect(result.getDate()).toBe(now.getDate());
    });
  });

  describe("formatRemainingTime", () => {
    it("formats days correctly", () => {
      const target = new Date();
      target.setDate(target.getDate() + 3);
      expect(formatRemainingTime(target)).toBe("over 3 dagen");
    });

    it("formats weeks correctly", () => {
      const target = new Date();
      target.setDate(target.getDate() + 14);
      expect(formatRemainingTime(target)).toBe("over 2 weken");
    });

    it("formats months correctly", () => {
      const target = new Date();
      target.setDate(target.getDate() + 65); // ~2 months
      expect(formatRemainingTime(target)).toBe("over 2 maanden");
    });
  });
});
