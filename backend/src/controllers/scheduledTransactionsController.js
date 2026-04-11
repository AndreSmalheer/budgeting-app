import { getDatabase } from "../config/database.js";
import {
  createValidationError,
  normalizeCategory,
  recalculatePotBalance,
  validateNumericId,
  validateUserId,
} from "./budgetHelpers.js";

const RECURRENCE_TYPES = new Set(["daily", "monthly"]);
const SCHEDULE_TYPES = new Set(["deposit", "expense"]);

export async function getScheduledTransactions(request, response, next) {
  try {
    const userId = request.query.userId?.trim() || "";
    const potId = request.query.potId?.trim() || "";

    validateUserId(userId);

    const db = await getDatabase();
    const schedulesCollection = db.collection("scheduledTransactions");
    const filter = { userId };

    if (potId) {
      filter.potId = potId;
    }

    const schedules = await schedulesCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    const today = getTodayKey();

    response.json({
      success: true,
      scheduledTransactions: schedules.map((schedule) =>
        mapScheduledTransaction(schedule, today),
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function createScheduledTransaction(request, response, next) {
  try {
    const userId = request.body.userId?.trim() || "";
    const potId = request.body.potId?.trim() || "";
    const type = request.body.type?.trim() || "expense";
    const description = request.body.description?.trim() || "";
    const amount = Number(request.body.amount);
    const category = normalizeCategory(request.body.category?.trim() || "overig");
    const startDate = normalizeDateKey(request.body.startDate);
    const endDate = request.body.endDate ? normalizeDateKey(request.body.endDate) : "";
    const recurrence = request.body.recurrence?.trim() || "";

    validateUserId(userId);
    validateNumericId(potId, "Ongeldig potje-id.");
    validateScheduleInput({
      description,
      amount,
      type,
      startDate,
      endDate,
      recurrence,
    });

    const db = await getDatabase();
    const potsCollection = db.collection("pots");
    const schedulesCollection = db.collection("scheduledTransactions");
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

    const now = new Date();
    const scheduledTransaction = {
      userId,
      potId,
      type,
      description,
      amount,
      category,
      startDate,
      endDate: endDate || null,
      recurrence,
      createdAt: now,
      updatedAt: now,
    };

    const result = await schedulesCollection.insertOne(scheduledTransaction);

    response.status(201).json({
      success: true,
      message: "Geplande transactie opgeslagen.",
      scheduledTransaction: mapScheduledTransaction(
        {
          ...scheduledTransaction,
          _id: result.insertedId,
        },
        getTodayKey(),
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateScheduledTransaction(request, response, next) {
  try {
    const userId = request.body.userId?.trim() || "";
    const scheduleId = request.params.id;
    const type = request.body.type?.trim() || "expense";
    const description = request.body.description?.trim() || "";
    const amount = Number(request.body.amount);
    const category = normalizeCategory(request.body.category?.trim() || "overig");
    const startDate = normalizeDateKey(request.body.startDate);
    const endDate = request.body.endDate ? normalizeDateKey(request.body.endDate) : "";
    const recurrence = request.body.recurrence?.trim() || "";

    validateUserId(userId);
    validateNumericId(scheduleId, "Ongeldige geplande transactie.");
    validateScheduleInput({
      description,
      amount,
      type,
      startDate,
      endDate,
      recurrence,
    });

    const db = await getDatabase();
    const schedulesCollection = db.collection("scheduledTransactions");
    const existingSchedule = await schedulesCollection.findOne({
      _id: Number(scheduleId),
      userId,
    });

    if (!existingSchedule) {
      response.status(404).json({
        success: false,
        message: "Geplande transactie niet gevonden.",
      });
      return;
    }

    const now = new Date();
    await schedulesCollection.updateOne(
      {
        _id: Number(scheduleId),
        userId,
      },
      {
        $set: {
          description,
          amount,
          type,
          category,
          startDate,
          endDate: endDate || null,
          recurrence,
          updatedAt: now,
        },
      },
    );

    response.json({
      success: true,
      message: "Geplande transactie bijgewerkt.",
      scheduledTransaction: mapScheduledTransaction(
        {
          ...existingSchedule,
          description,
          amount,
          type,
          category,
          startDate,
          endDate: endDate || null,
          recurrence,
          updatedAt: now,
        },
        getTodayKey(),
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteScheduledTransaction(request, response, next) {
  try {
    const userId = request.query.userId?.trim() || "";
    const scheduleId = request.params.id;

    validateUserId(userId);
    validateNumericId(scheduleId, "Ongeldige geplande transactie.");

    const db = await getDatabase();
    const schedulesCollection = db.collection("scheduledTransactions");
    const result = await schedulesCollection.deleteOne({
      _id: Number(scheduleId),
      userId,
    });

    if (result.deletedCount === 0) {
      response.status(404).json({
        success: false,
        message: "Geplande transactie niet gevonden.",
      });
      return;
    }

    response.json({
      success: true,
      message: "Geplande transactie verwijderd.",
    });
  } catch (error) {
    next(error);
  }
}

export async function syncScheduledTransactions(request, response, next) {
  try {
    const userId = (request.body?.userId || request.query.userId || "").trim();

    validateUserId(userId);

    const result = await runScheduledTransactionSync(userId);

    response.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function runScheduledTransactionSync(userId) {
  const db = await getDatabase();
  const schedulesCollection = db.collection("scheduledTransactions");
  const transactionsCollection = db.collection("transactions");
  const potsCollection = db.collection("pots");
  const schedules = await schedulesCollection
    .find({ userId })
    .sort({ createdAt: 1 })
    .toArray();
  const today = getTodayKey();
  const scheduleIds = schedules.map((schedule) => String(schedule._id));
  const existingGeneratedTransactions = scheduleIds.length
    ? await transactionsCollection
        .find({
          scheduledTransactionId: { $in: scheduleIds },
        })
        .toArray()
    : [];
  const existingOccurrences = new Set(
    existingGeneratedTransactions.map(
      (transaction) =>
        `${transaction.scheduledTransactionId}:${transaction.scheduledOccurrenceDate}`,
    ),
  );
  const affectedPotIds = new Set();
  let generatedCount = 0;

  for (const schedule of schedules) {
    const dueUntil = getDueUntil(schedule, today);

    if (!dueUntil) {
      continue;
    }

    const occurrences = getOccurrencesInRange(schedule, dueUntil);

    for (const occurrenceDate of occurrences) {
      const occurrenceKey = `${schedule._id}:${occurrenceDate}`;

      if (existingOccurrences.has(occurrenceKey)) {
        continue;
      }

      const createdAt = toOccurrenceDate(occurrenceDate);
      const transaction = {
        userId: schedule.userId,
        potId: schedule.potId,
        type: schedule.type || "expense",
        amount: Number(schedule.amount || 0),
        description: schedule.description,
        category: schedule.category || "overig",
        status: "approved",
        reviewParentId: null,
        scheduledTransactionId: String(schedule._id),
        scheduledOccurrenceDate: occurrenceDate,
        createdAt,
        updatedAt: createdAt,
      };

      try {
        await transactionsCollection.insertOne(transaction);
      } catch (error) {
        if (String(error.message || "").includes("UNIQUE constraint failed")) {
          existingOccurrences.add(occurrenceKey);
          continue;
        }

        throw error;
      }

      existingOccurrences.add(occurrenceKey);
      affectedPotIds.add(schedule.potId);
      generatedCount += 1;
    }
  }

  for (const potId of affectedPotIds) {
    await recalculatePotBalance({
      potsCollection,
      transactionsCollection,
      userId,
      potId,
      updatedAt: new Date(),
    });
  }

  return {
    generatedCount,
    scheduledTransactions: schedules.map((schedule) =>
      mapScheduledTransaction(schedule, today),
    ),
  };
}

function validateScheduleInput({
  description,
  amount,
  type,
  startDate,
  endDate,
  recurrence,
}) {
  if (description.length < 2) {
    throw createValidationError(
      "Geef de geplande transactie een naam van minimaal 2 tekens.",
    );
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createValidationError("Vul een geldig bedrag groter dan 0 in.");
  }

  if (!SCHEDULE_TYPES.has(type)) {
    throw createValidationError("Gebruik een geldig transactietype.");
  }

  if (!startDate) {
    throw createValidationError("Kies een startdatum.");
  }

  if (!RECURRENCE_TYPES.has(recurrence)) {
    throw createValidationError("Gebruik een geldige herhaling: daily of monthly.");
  }

  if (endDate && endDate < startDate) {
    throw createValidationError("De einddatum moet op of na de startdatum liggen.");
  }
}

function mapScheduledTransaction(schedule, todayKey = getTodayKey()) {
  return {
    id: String(schedule._id),
    userId: schedule.userId,
    potId: schedule.potId,
    type: schedule.type || "expense",
    description: schedule.description,
    amount: Number(schedule.amount || 0),
    category: schedule.category || "overig",
    startDate: schedule.startDate,
    endDate: schedule.endDate || "",
    recurrence: schedule.recurrence,
    isActive: !schedule.endDate || schedule.endDate >= todayKey,
    nextExecutionDate: getNextExecutionDate(schedule, todayKey),
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt || schedule.createdAt,
  };
}

function getDueUntil(schedule, todayKey) {
  if (schedule.startDate > todayKey) {
    return "";
  }

  if (schedule.endDate && schedule.endDate < schedule.startDate) {
    return "";
  }

  return schedule.endDate && schedule.endDate < todayKey
    ? schedule.endDate
    : todayKey;
}

function getNextExecutionDate(schedule, todayKey) {
  const nextDate = getFirstOccurrenceAfter(schedule, todayKey);

  if (!nextDate) {
    return "";
  }

  if (schedule.endDate && nextDate > schedule.endDate) {
    return "";
  }

  return nextDate;
}

function getOccurrencesInRange(schedule, endDateKey) {
  const occurrences = [];
  let cursor = schedule.startDate;

  while (cursor && cursor <= endDateKey) {
    occurrences.push(cursor);
    cursor = getNextOccurrence(schedule, cursor);
  }

  return occurrences;
}

function getFirstOccurrenceAfter(schedule, dateKey) {
  let cursor = schedule.startDate;

  while (cursor && cursor <= dateKey) {
    cursor = getNextOccurrence(schedule, cursor);
  }

  return cursor;
}

function getNextOccurrence(schedule, occurrenceDate) {
  if (schedule.recurrence === "daily") {
    return addDays(occurrenceDate, 1);
  }

  if (schedule.recurrence === "monthly") {
    return addMonths(occurrenceDate, 1, getDayOfMonth(schedule.startDate));
  }

  return "";
}

function getDayOfMonth(dateKey) {
  return Number(dateKey.split("-")[2]);
}

function addDays(dateKey, amount) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function addMonths(dateKey, amount, preferredDay) {
  const [year, month] = dateKey.split("-").map(Number);
  const targetMonthIndex = month - 1 + amount;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonthIndex = ((targetMonthIndex % 12) + 12) % 12;
  const lastDayOfMonth = new Date(
    Date.UTC(targetYear, normalizedMonthIndex + 1, 0),
  ).getUTCDate();
  const targetDay = Math.min(preferredDay, lastDayOfMonth);

  return formatDateParts(targetYear, normalizedMonthIndex + 1, targetDay);
}

function formatDateParts(year, month, day) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(
    2,
    "0",
  )}-${String(day).padStart(2, "0")}`;
}

function normalizeDateKey(value) {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw createValidationError("Gebruik een geldige datum.");
  }

  return date.toISOString().slice(0, 10);
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function toOccurrenceDate(dateKey) {
  return new Date(`${dateKey}T12:00:00.000Z`);
}
