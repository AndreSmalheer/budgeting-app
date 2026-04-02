import { MongoClient } from "mongodb";
import { config } from "./env.js";

let client = null;
let database = null;

export async function connectToDatabase() {
  if (!config.mongodbUri) {
    throw new Error("MONGODB_URI ontbreekt in backend/.env.");
  }

  if (database) {
    return database;
  }

  client = new MongoClient(config.mongodbUri);
  await client.connect();

  database = client.db(config.mongodbDbName);

  await database.collection("users").createIndex({ email: 1 }, { unique: true });
  await database.collection("parentChildLinks").createIndex(
    { parentId: 1, childId: 1 },
    { unique: true },
  );
  await database.collection("pots").createIndex({ childId: 1 });
  await database.collection("transactions").createIndex({ potId: 1, createdAt: -1 });

  return database;
}

export async function getDatabase() {
  return connectToDatabase();
}

export async function getDatabaseStatus() {
  if (!config.mongodbUri) {
    return {
      configured: false,
      connected: false,
      databaseName: config.mongodbDbName,
      message: "MongoDB URI ontbreekt nog.",
    };
  }

  try {
    const db = await connectToDatabase();
    await db.command({ ping: 1 });

    return {
      configured: true,
      connected: true,
      databaseName: db.databaseName,
      message: "MongoDB verbinding gelukt.",
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      databaseName: config.mongodbDbName,
      message: error.message,
    };
  }
}
