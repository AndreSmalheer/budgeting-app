import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";

export async function getPots(request, response, next) {
  try {
    const userId = request.query.userId?.trim() || "";

    validateUserId(userId);

    const db = await getDatabase();
    const potsCollection = db.collection("pots");

    const pots = await potsCollection.find({ userId }).sort({ createdAt: -1 }).toArray();

    response.json({
      success: true,
      pots: pots.map(mapPot),
    });
  } catch (error) {
    next(error);
  }
}

export async function getPotById(request, response, next) {
  try {
    const userId = request.query.userId?.trim() || "";
    const potId = request.params.id;

    validateUserId(userId);
    validateObjectId(potId, "Ongeldig potje-id.");

    const db = await getDatabase();
    const potsCollection = db.collection("pots");

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

    response.json({
      success: true,
      pot: mapPot(pot),
    });
  } catch (error) {
    next(error);
  }
}

export async function createPot(request, response, next) {
  try {
    const userId = request.body.userId?.trim() || "";
    const name = request.body.name?.trim() || "";
    const icon = request.body.icon?.trim() || "";
    const amount = Number(request.body.amount);

    validateUserId(userId);

    if (name.length < 2) {
      throw createValidationError("Geef het potje een naam van minimaal 2 tekens.");
    }

    if (!icon) {
      throw createValidationError("Kies een icoon voor het potje.");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw createValidationError("Vul een geldig bedrag groter dan 0 in.");
    }

    const db = await getDatabase();
    const potsCollection = db.collection("pots");
    const now = new Date();

    const newPot = {
      userId,
      name,
      icon,
      targetAmount: amount,
      currentBalance: amount,
      createdAt: now,
      updatedAt: now,
    };

    const result = await potsCollection.insertOne(newPot);

    response.status(201).json({
      success: true,
      message: "Potje aangemaakt.",
      pot: mapPot({
        ...newPot,
        _id: result.insertedId,
      }),
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePot(request, response, next) {
  try {
    const userId = request.query.userId?.trim() || "";
    const potId = request.params.id;

    validateUserId(userId);
    validateObjectId(potId, "Ongeldig potje-id.");

    const db = await getDatabase();
    const potsCollection = db.collection("pots");
    const transactionsCollection = db.collection("transactions");

    const result = await potsCollection.deleteOne({
      _id: new ObjectId(potId),
      userId,
    });

    if (result.deletedCount === 0) {
      response.status(404).json({
        success: false,
        message: "Potje niet gevonden.",
      });
      return;
    }

    await transactionsCollection.deleteMany({
      userId,
      potId,
    });

    response.json({
      success: true,
      message: "Potje verwijderd.",
    });
  } catch (error) {
    next(error);
  }
}

function mapPot(pot) {
  return {
    id: pot._id.toString(),
    userId: pot.userId,
    name: pot.name,
    icon: pot.icon,
    targetAmount: Number(pot.targetAmount || 0),
    currentBalance: Number(pot.currentBalance || 0),
    createdAt: pot.createdAt,
    updatedAt: pot.updatedAt,
  };
}

function validateUserId(userId) {
  if (!userId) {
    throw createValidationError("Geen gebruiker gevonden. Log opnieuw in.");
  }
}

function validateObjectId(value, message) {
  if (!ObjectId.isValid(value)) {
    throw createValidationError(message);
  }
}

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 422;
  return error;
}
