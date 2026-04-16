import { getDatabase } from "../config/database.js";
import {
  createValidationError,
  getPotOrFail,
  mapPot,
  validateNumericId,
  validateUserId,
} from "./budgetHelpers.js";

export async function getPots(request, response, next) {
  try {
    const userId = request.query.userId?.trim() || "";

    validateUserId(userId);

    const db = await getDatabase();
    const potsCollection = db.collection("pots");

    // Updated to sort by orderIndex first
    const pots = await potsCollection.find({ userId }).sort({ orderIndex: 1, createdAt: -1 }).toArray();

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
    validateNumericId(potId, "Ongeldig potje-id.");

    const db = await getDatabase();
    const potsCollection = db.collection("pots");
    const pot = await potsCollection.findOne({
      _id: Number(potId),
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
    validatePotInput({ name, icon, amount });

    const db = await getDatabase();
    const potsCollection = db.collection("pots");
    const now = new Date();

    const newPot = {
      userId,
      name,
      icon,
      targetAmount: amount,
      currentBalance: 0,
      createdAt: now,
      updatedAt: now,
      orderIndex: 0 // Default order index
    };

    const result = await potsCollection.insertOne(newPot);

    response.status(201).json({
      success: true,
      message: "Doelpotje aangemaakt.",
      pot: mapPot({
        ...newPot,
        _id: result.insertedId,
      }),
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePot(request, response, next) {
  try {
    const userId = request.body.userId?.trim() || "";
    const potId = request.params.id;
    const name = request.body.name?.trim() || "";
    const icon = request.body.icon?.trim() || "";
    const amount = Number(request.body.amount);

    validateUserId(userId);
    validateNumericId(potId, "Ongeldig potje-id.");
    validatePotInput({ name, icon, amount });

    const db = await getDatabase();
    const potsCollection = db.collection("pots");
    const existingPot = await getPotOrFail({
      potsCollection,
      userId,
      potId,
      response,
    });

    if (!existingPot) {
      return;
    }

    const now = new Date();
    await potsCollection.updateOne(
      { _id: Number(potId), userId },
      {
        $set: {
          name,
          icon,
          targetAmount: amount,
          updatedAt: now,
        },
      },
    );

    response.json({
      success: true,
      message: "Potje bijgewerkt.",
      pot: mapPot({
        ...existingPot,
        name,
        icon,
        targetAmount: amount,
        updatedAt: now,
      }),
    });
  } catch (error) {
    next(error);
  }
}

export async function reorderPots(request, response, next) {
  try {
    const userId = request.body.userId?.trim() || "";
    const orderedIds = request.body.orderedIds; // Array of pot IDs
    console.log("reorderPots called with userId:", userId, "orderedIds:", orderedIds);

    validateUserId(userId);
    if (!Array.isArray(orderedIds)) {
      throw createValidationError("Ongeldige invoer voor sortering.");
    }

    const db = await getDatabase();
    // Ensure we access the pool correctly
    const pool = db.pool;

    for (let i = 0; i < orderedIds.length; i++) {
      await pool.execute(
        "UPDATE pots SET orderIndex = ? WHERE _id = ? AND userId = ?",
        [i, Number(orderedIds[i]), userId]
      );
    }

    response.json({
      success: true,
      message: "Potjes opnieuw gesorteerd.",
    });
  } catch (error) {
    console.error("reorderPots error:", error);
    next(error);
  }
}

export async function deletePot(request, response, next) {
  try {
    const userId = request.query.userId?.trim() || "";
    const potId = request.params.id;

    validateUserId(userId);
    validateNumericId(potId, "Ongeldig potje-id.");

    const db = await getDatabase();
    const potsCollection = db.collection("pots");
    const transactionsCollection = db.collection("transactions");

    const result = await potsCollection.deleteOne({
      _id: Number(potId),
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

function validatePotInput({ name, icon, amount }) {
  if (name.length < 2) {
    throw createValidationError("Geef het potje een naam van minimaal 2 tekens.");
  }

  if (!icon) {
    throw createValidationError("Kies een icoon voor het potje.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createValidationError("Vul een geldig bedrag groter dan 0 in.");
  }
}
