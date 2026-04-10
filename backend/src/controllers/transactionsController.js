import { getDatabase } from "../config/database.js";
import { config } from "../config/env.js";

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

    if (isNaN(potId)) {
      throw createValidationError("Ongeldig potje-id.");
    }

    const db = await getDatabase();
    const potsCollection = db.collection("pots");
    const transactionsCollection = db.collection("transactions");
    const linksCollection = db.collection("parentChildLinks");

    const pot = await potsCollection.findOne({
      _id: parseInt(potId),
      userId,
    });

    if (!pot) {
      response.status(404).json({
        success: false,
        message: "Potje niet gevonden.",
      });
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

    const parentLink =
      type === "expense"
        ? await linksCollection.findOne({ childId: userId })
        : null;
    const needsApproval =
      type === "expense" &&
      Boolean(parentLink) &&
      amount > Number(config.approvalLimit || 40);

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
      status: needsApproval ? "pending" : "approved",
      reviewParentId: needsApproval ? parentLink.parentId : null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await transactionsCollection.insertOne(transaction);

    if (!needsApproval) {
      await potsCollection.updateOne(
        { _id: parseInt(potId), userId },
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

function mapTransaction(transaction) {
  return {
    id: String(transaction._id),
    userId: transaction.userId,
    potId: transaction.potId,
    type: transaction.type,
    amount: Number(transaction.amount || 0),
    description: transaction.description,
    category: transaction.category || "overig",
    status: transaction.status,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt || transaction.createdAt,
  };
}

function normalizeCategory(category) {
  return category ? category.toLowerCase() : "overig";
}

async function getPendingExpenseTotal(transactionsCollection, userId, potId) {
  const result = await transactionsCollection
    .aggregate([
      {
        $match: {
          userId,
          potId,
          type: "expense",
          status: "pending",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ])
    .toArray();

  return Number(result[0]?.total || 0);
}

function getTransactionMessage(type, needsApproval) {
  if (type === "deposit") {
    return "Bedrag toegevoegd.";
  }

  if (needsApproval) {
    return `Opnameverzoek verstuurd. Een ouder moet deze opname boven €${config.approvalLimit} eerst goedkeuren.`;
  }

  return "Bedrag afgehaald.";
}

function validateUserId(userId) {
  if (!userId) {
    throw createValidationError("Geen gebruiker gevonden. Log opnieuw in.");
  }
}

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 422;
  return error;
}
