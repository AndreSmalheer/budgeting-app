import { getDatabase } from "../config/database.js";
import {
  createValidationError,
  getPendingExpenseTotal,
  getPotOrFail,
  getTransactionMessage,
  getTransactionOrFail,
  mapTransaction,
  normalizeCategory,
  recalculatePotBalance,
  resolveTransactionApprovalState,
  validateNumericId,
  validateUserId,
} from "./budgetHelpers.js";

export async function getTransactions(request, response, next) {
  try {
    const userId = request.query.userId?.trim() || "";
    const potId = request.query.potId?.trim() || "";
    const type = request.query.type?.trim() || "";
    const category = request.query.category?.trim().toLowerCase() || "";

    validateUserId(userId);

    const db = await getDatabase();
    const transactionsCollection = db.collection("transactions");
    const filter = { userId };

    if (potId) {
      filter.potId = potId;
    }

    if (type && ["deposit", "expense"].includes(type)) {
      filter.type = type;
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    const transactions = await transactionsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    response.json({
      success: true,
      transactions: transactions.map(mapTransaction),
    });
  } catch (error) {
    next(error);
  }
}

export async function createTransaction(request, response, next) {
  try {
    const userId = request.body.userId?.trim() || "";
    const potId = request.body.potId?.trim() || "";
    const type = request.body.type?.trim() || "";
    const description = request.body.description?.trim() || "";
    const amount = Number(request.body.amount);
    const category = normalizeCategory(
      request.body.category?.trim() || "overig",
    );

    validateUserId(userId);
    validateTransactionInput({ potId, type, description, amount });

    const db = await getDatabase();
    const potsCollection = db.collection("pots");
    const transactionsCollection = db.collection("transactions");
    const linksCollection = db.collection("parentChildLinks");
    const pot = await getPotOrFail({
      potsCollection,
      userId,
      potId,
      response,
    });

    if (!pot) {
      return;
    }

    const currentBalance = Number(pot.currentBalance || 0);
    const pendingExpenses = await getPendingExpenseTotal(
      transactionsCollection,
      userId,
      potId,
    );
    const availableBalance = currentBalance - pendingExpenses;

    if (type === "expense" && availableBalance - amount < 0) {
      throw createValidationError(
        "Je kunt niet meer afhalen dan er in het potje zit.",
      );
    }

    const { status, reviewParentId, needsApproval } =
      await resolveTransactionApprovalState({
        linksCollection,
        type,
        amount,
        userId,
      });
    const nextBalance =
      type === "expense" ? currentBalance - amount : currentBalance + amount;
    const now = new Date();
    const transaction = {
      userId,
      potId,
      type,
      amount,
      description,
      category,
      status,
      reviewParentId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await transactionsCollection.insertOne(transaction);

    if (!needsApproval) {
      await potsCollection.updateOne(
        { _id: Number(potId), userId },
        {
          $set: {
            currentBalance: nextBalance,
            updatedAt: now,
          },
        },
      );
    }

    response.status(201).json({
      success: true,
      message: getTransactionMessage(type, needsApproval),
      transaction: mapTransaction({
        ...transaction,
        _id: result.insertedId,
      }),
      pot: {
        id: String(pot._id),
        currentBalance: needsApproval ? currentBalance : nextBalance,
        updatedAt: now,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTransaction(request, response, next) {
  try {
    const transactionId = request.params.id;
    const userId = request.body.userId?.trim() || "";
    const description = request.body.description?.trim() || "";
    const amount = Number(request.body.amount);
    const type = request.body.type?.trim() || "";
    const category = normalizeCategory(
      request.body.category?.trim() || "overig",
    );

    validateUserId(userId);
    validateNumericId(transactionId, "Ongeldige transactie-id.");

    if (!["deposit", "expense"].includes(type)) {
      throw createValidationError("Gebruik een geldig transactietype.");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw createValidationError("Vul een geldig bedrag groter dan 0 in.");
    }

    if (description.length < 2) {
      throw createValidationError(
        "Geef de transactie een naam van minimaal 2 tekens.",
      );
    }

    const db = await getDatabase();
    const transactionsCollection = db.collection("transactions");
    const potsCollection = db.collection("pots");
    const linksCollection = db.collection("parentChildLinks");
    const existingTransaction = await getTransactionOrFail({
      transactionsCollection,
      userId,
      transactionId,
      response,
    });

    if (!existingTransaction) {
      return;
    }

    const pot = await getPotOrFail({
      potsCollection,
      userId,
      potId: existingTransaction.potId,
      response,
    });

    if (!pot) {
      return;
    }

    const { status, reviewParentId, needsApproval } =
      await resolveTransactionApprovalState({
        linksCollection,
        type,
        amount,
        userId,
      });
    const approvedBalanceWithoutCurrent =
      Number(pot.currentBalance || 0) -
      getApprovedTransactionImpact(existingTransaction);
    const pendingExpensesWithoutCurrent = await getPendingExpenseTotal(
      transactionsCollection,
      userId,
      existingTransaction.potId,
      transactionId,
    );
    const projectedApprovedBalance =
      approvedBalanceWithoutCurrent +
      (status === "approved"
        ? type === "expense"
          ? -amount
          : amount
        : 0);
    const projectedPendingExpenses =
      pendingExpensesWithoutCurrent +
      (status === "pending" && type === "expense" ? amount : 0);

    if (projectedApprovedBalance - projectedPendingExpenses < 0) {
      throw createValidationError(
        "Je kunt niet meer afhalen dan er in het potje zit.",
      );
    }

    const now = new Date();

    await transactionsCollection.updateOne(
      { _id: Number(transactionId), userId },
      {
        $set: {
          description,
          amount,
          type,
          category,
          status,
          reviewParentId,
          updatedAt: now,
        },
      },
    );

    const nextBalance = await recalculatePotBalance({
      potsCollection,
      transactionsCollection,
      userId,
      potId: existingTransaction.potId,
      updatedAt: now,
    });

    response.json({
      success: true,
      message: needsApproval
        ? "Transactie bijgewerkt. Deze opname wacht nu op goedkeuring."
        : "Transactie bijgewerkt.",
      transaction: mapTransaction({
        ...existingTransaction,
        description,
        amount,
        type,
        category,
        status,
        reviewParentId,
        updatedAt: now,
      }),
      pot: {
        id: existingTransaction.potId,
        currentBalance: nextBalance,
        updatedAt: now,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTransaction(request, response, next) {
  try {
    const transactionId = request.params.id;
    const userId = request.query.userId?.trim() || "";

    validateUserId(userId);
    validateNumericId(transactionId, "Ongeldige transactie-id.");

    const db = await getDatabase();
    const transactionsCollection = db.collection("transactions");
    const potsCollection = db.collection("pots");
    const existingTransaction = await getTransactionOrFail({
      transactionsCollection,
      userId,
      transactionId,
      response,
    });

    if (!existingTransaction) {
      return;
    }

    await transactionsCollection.deleteOne({
      _id: Number(transactionId),
      userId,
    });

    const now = new Date();
    const nextBalance = await recalculatePotBalance({
      potsCollection,
      transactionsCollection,
      userId,
      potId: existingTransaction.potId,
      updatedAt: now,
    });

    response.json({
      success: true,
      message: "Transactie verwijderd.",
      pot: {
        id: existingTransaction.potId,
        currentBalance: nextBalance,
        updatedAt: now,
      },
    });
  } catch (error) {
    next(error);
  }
}

function validateTransactionInput({ potId, type, description, amount }) {
  if (!potId) {
    throw createValidationError("Kies eerst een potje.");
  }

  if (!["deposit", "expense"].includes(type)) {
    throw createValidationError("Gebruik een geldig transactietype.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createValidationError("Vul een geldig bedrag groter dan 0 in.");
  }

  if (description.length < 2) {
    throw createValidationError(
      "Geef de transactie een naam van minimaal 2 tekens.",
    );
  }

  if (Number.isNaN(Number(potId))) {
    throw createValidationError("Ongeldig potje-id.");
  }
}

function getApprovedTransactionImpact(transaction) {
  if (transaction.status !== "approved") {
    return 0;
  }

  const amount = Number(transaction.amount || 0);
  return transaction.type === "expense" ? -amount : amount;
}
