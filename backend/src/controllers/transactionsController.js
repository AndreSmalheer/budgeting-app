import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";

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
    const category = normalizeCategory(request.body.category?.trim() || "overig");

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
      throw createValidationError("Geef de transactie een naam van minimaal 2 tekens.");
    }

    if (!ObjectId.isValid(potId)) {
      throw createValidationError("Ongeldig potje-id.");
    }

    const db = await getDatabase();
    const potsCollection = db.collection("pots");
    const transactionsCollection = db.collection("transactions");

    const pot = await potsCollection.findOne({
      _id: new ObjectId(potId),
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
    const nextBalance =
      type === "expense" ? currentBalance - amount : currentBalance + amount;

    if (type === "expense" && nextBalance < 0) {
      throw createValidationError("Je kunt niet meer afhalen dan er in het potje zit.");
    }

    const now = new Date();
    const transaction = {
      userId,
      potId,
      type,
      amount,
      description,
      category,
      status: "approved",
      createdAt: now,
      updatedAt: now,
    };

    const result = await transactionsCollection.insertOne(transaction);

    await potsCollection.updateOne(
      { _id: pot._id, userId },
      {
        $set: {
          currentBalance: nextBalance,
          updatedAt: now,
        },
      },
    );

    response.status(201).json({
      success: true,
      message: type === "expense" ? "Bedrag afgehaald." : "Bedrag toegevoegd.",
      transaction: mapTransaction({
        ...transaction,
        _id: result.insertedId,
      }),
      pot: {
        id: pot._id.toString(),
        currentBalance: nextBalance,
        updatedAt: now,
      },
    });
  } catch (error) {
    next(error);
  }
}

function mapTransaction(transaction) {
  return {
    id: transaction._id.toString(),
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
