import { config } from "../config/env.js";

export function mapPot(pot) {
  return {
    id: String(pot._id),
    userId: pot.userId,
    name: pot.name,
    icon: pot.icon,
    targetAmount: Number(pot.targetAmount || 0),
    currentBalance: Number(pot.currentBalance || 0),
    createdAt: pot.createdAt,
    updatedAt: pot.updatedAt,
  };
}

export function mapTransaction(transaction) {
  return {
    id: String(transaction._id),
    userId: transaction.userId,
    potId: transaction.potId,
    type: transaction.type,
    amount: Number(transaction.amount || 0),
    description: transaction.description,
    category: transaction.category || "overig",
    status: transaction.status,
    scheduledTransactionId: transaction.scheduledTransactionId || "",
    scheduledOccurrenceDate: transaction.scheduledOccurrenceDate || "",
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt || transaction.createdAt,
  };
}

export function normalizeCategory(category) {
  return category ? category.toLowerCase() : "overig";
}

export function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 422;
  return error;
}

export function validateUserId(userId) {
  if (!userId) {
    throw createValidationError("Geen gebruiker gevonden. Log opnieuw in.");
  }
}

export function validateNumericId(value, message) {
  if (!value || Number.isNaN(Number(value))) {
    throw createValidationError(message);
  }
}

export async function getPotOrFail({
  potsCollection,
  userId,
  potId,
  response,
  message = "Potje niet gevonden.",
}) {
  const pot = await potsCollection.findOne({
    _id: Number(potId),
    userId,
  });

  if (!pot) {
    response.status(404).json({
      success: false,
      message,
    });
    return null;
  }

  return pot;
}

export async function getTransactionOrFail({
  transactionsCollection,
  userId,
  transactionId,
  response,
  message = "Transactie niet gevonden.",
}) {
  const transaction = await transactionsCollection.findOne({
    _id: Number(transactionId),
    userId,
  });

  if (!transaction) {
    response.status(404).json({
      success: false,
      message,
    });
    return null;
  }

  return transaction;
}

export async function getPendingExpenseTotal(
  transactionsCollection,
  userId,
  potId,
  excludeTransactionId = null,
) {
  const transactions = await transactionsCollection
    .find({
      userId,
      potId,
      type: "expense",
      status: "pending",
    })
    .toArray();

  return transactions.reduce((sum, transaction) => {
    if (
      excludeTransactionId &&
      String(transaction._id) === String(excludeTransactionId)
    ) {
      return sum;
    }

    return sum + Number(transaction.amount || 0);
  }, 0);
}

export async function recalculatePotBalance({
  potsCollection,
  transactionsCollection,
  userId,
  potId,
  updatedAt = new Date(),
}) {
  const transactions = await transactionsCollection.find({ userId, potId }).toArray();
  const nextBalance = transactions.reduce((sum, transaction) => {
    if (transaction.status !== "approved") {
      return sum;
    }

    const amount = Number(transaction.amount || 0);
    return transaction.type === "expense" ? sum - amount : sum + amount;
  }, 0);

  await potsCollection.updateOne(
    { _id: Number(potId), userId },
    {
      $set: {
        currentBalance: nextBalance,
        updatedAt,
      },
    },
  );

  return nextBalance;
}

export async function resolveTransactionApprovalState({
  linksCollection,
  type,
  amount,
  userId,
}) {
  if (type !== "expense") {
    return {
      status: "approved",
      reviewParentId: null,
      needsApproval: false,
    };
  }

  const parentLink = await linksCollection.findOne({ childId: userId });
  const needsApproval =
    Boolean(parentLink) && amount > Number(config.approvalLimit || 40);

  return {
    status: needsApproval ? "pending" : "approved",
    reviewParentId: needsApproval ? parentLink.parentId : null,
    needsApproval,
  };
}

export function getTransactionMessage(type, needsApproval) {
  if (type === "deposit") {
    return "Bedrag toegevoegd.";
  }

  if (needsApproval) {
    return `Opnameverzoek verstuurd. Een ouder moet deze opname boven €${config.approvalLimit} eerst goedkeuren.`;
  }

  return "Bedrag afgehaald.";
}
