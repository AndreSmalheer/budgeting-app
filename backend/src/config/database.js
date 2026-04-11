import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../../data/budgeting.db");

let dbInstance = null;

class SQLiteDatabase {
  constructor(db) {
    this.db = db;
  }

  collection(name) {
    return new SQLiteCollection(this.db, name);
  }
}

class SQLiteCollection {
  constructor(db, name) {
    this.db = db;
    this.name = name;
  }

  findOne(query) {
    const where = this._buildWhere(query);
    const sql = `SELECT * FROM ${this.name} WHERE ${where.clause} LIMIT 1`;
    const result = this.db.prepare(sql).get(...where.values);
    return this._mapRow(result);
  }

  find(query) {
    return new SQLiteFindQuery(this.db, this.name, query);
  }

  async insertOne(doc) {
    const keys = Object.keys(doc).filter((key) => key !== "_id");
    const placeholders = keys.map(() => "?").join(",");
    const sql = `INSERT INTO ${this.name} (${keys.join(",")}) VALUES (${placeholders})`;
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...keys.map((key) => this._formatValue(doc[key])));
    return { insertedId: result.lastInsertRowid };
  }

  async updateOne(query, update) {
    const where = this._buildWhere(query);
    const $set = update.$set || update;
    const setKeys = Object.keys($set).filter((key) => key !== "_id");
    const setClauses = setKeys.map((key) => `${key} = ?`).join(",");
    const sql = `UPDATE ${this.name} SET ${setClauses} WHERE ${where.clause}`;
    const values = [
      ...setKeys.map((key) => this._formatValue($set[key])),
      ...where.values,
    ];
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...values);
    return { modifiedCount: result.changes };
  }

  async deleteOne(query) {
    const where = this._buildWhere(query);
    const sql = `DELETE FROM ${this.name} WHERE ${where.clause}`;
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...where.values);
    return { deletedCount: result.changes };
  }

  async deleteMany(query) {
    const where = this._buildWhere(query);
    const sql = `DELETE FROM ${this.name} WHERE ${where.clause}`;
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...where.values);
    return { deletedCount: result.changes };
  }

  createIndex(_fields, _options) {
    // No-op for SQLite, indexes are created during table creation
  }

  aggregate(pipeline) {
    return new SQLiteAggregateQuery(this.db, this.name, {}, pipeline);
  }

  _buildWhere(query) {
    const clauses = [];
    const values = [];

    for (const [key, value] of Object.entries(query)) {
      if (key === "_id" && typeof value === "object") {
        if (value.$in) {
          const placeholders = value.$in.map(() => "?").join(",");
          clauses.push(`_id IN (${placeholders})`);
          values.push(...value.$in.map((item) => this._idToDb(item)));
        }
      } else if (typeof value === "object" && value !== null) {
        if (value.$in) {
          const placeholders = value.$in.map(() => "?").join(",");
          clauses.push(`${key} IN (${placeholders})`);
          values.push(...value.$in);
        }
      } else {
        clauses.push(`${key} = ?`);
        values.push(this._formatValue(value));
      }
    }

    return {
      clause: clauses.length > 0 ? clauses.join(" AND ") : "1",
      values,
    };
  }

  _formatValue(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return value;
  }

  _mapRow(row) {
    if (!row) return null;

    if (row._id) {
      row._id = row._id.toString();
    }

    return row;
  }

  _idToDb(id) {
    if (typeof id === "object" && id._id) {
      return id._id;
    }

    if (typeof id === "string" && !Number.isNaN(Number(id))) {
      return Number(id);
    }

    return id;
  }
}

class SQLiteFindQuery {
  constructor(db, name, query) {
    this.db = db;
    this.name = name;
    this.query = query;
    this.sortBy = null;
    this.limitCount = null;
  }

  sort(spec) {
    this.sortBy = spec;
    return this;
  }

  async toArray() {
    const where = this._buildWhere(this.query);
    let sql = `SELECT * FROM ${this.name} WHERE ${where.clause}`;

    if (this.sortBy) {
      const sortClauses = [];

      for (const [key, order] of Object.entries(this.sortBy)) {
        sortClauses.push(`${key} ${order === -1 ? "DESC" : "ASC"}`);
      }

      sql += ` ORDER BY ${sortClauses.join(", ")}`;
    }

    if (this.limitCount) {
      sql += ` LIMIT ${this.limitCount}`;
    }

    const stmt = this.db.prepare(sql);
    const results = stmt.all(...where.values);
    return results.map((row) => this._mapRow(row));
  }

  aggregate(pipeline) {
    return new SQLiteAggregateQuery(this.db, this.name, this.query, pipeline);
  }

  _buildWhere(query) {
    const clauses = [];
    const values = [];

    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "object" && value !== null) {
        if (value.$in) {
          const placeholders = value.$in.map(() => "?").join(",");
          clauses.push(`${key} IN (${placeholders})`);
          values.push(...value.$in);
        }
      } else {
        clauses.push(`${key} = ?`);
        values.push(value instanceof Date ? value.toISOString() : value);
      }
    }

    return {
      clause: clauses.length > 0 ? clauses.join(" AND ") : "1",
      values,
    };
  }

  _mapRow(row) {
    if (!row) return null;
    return row;
  }
}

class SQLiteAggregateQuery {
  constructor(db, name, query, pipeline) {
    this.db = db;
    this.name = name;
    this.query = query;
    this.pipeline = pipeline;
  }

  async toArray() {
    const matchStage = this.pipeline.find((stage) => stage.$match);
    const groupStage = this.pipeline.find((stage) => stage.$group);

    if (matchStage && groupStage && groupStage.$group.total) {
      const where = this._buildWhere(matchStage.$match);
      const sql = `SELECT SUM(amount) as total FROM ${this.name} WHERE ${where.clause}`;
      const stmt = this.db.prepare(sql);
      const result = stmt.get(...where.values);
      return result.total ? [{ _id: null, total: result.total }] : [];
    }

    return [];
  }

  _buildWhere(query) {
    const clauses = [];
    const values = [];

    for (const [key, value] of Object.entries(query)) {
      clauses.push(`${key} = ?`);
      values.push(value);
    }

    return {
      clause: clauses.length > 0 ? clauses.join(" AND ") : "1",
      values,
    };
  }
}

export async function connectToDatabase() {
  if (dbInstance) {
    return new SQLiteDatabase(dbInstance);
  }

  const dataDir = path.dirname(dbPath);

  try {
    const fs = await import("fs");

    if (!fs.default.existsSync(dataDir)) {
      fs.default.mkdirSync(dataDir, { recursive: true });
    }
  } catch {
    // Ignore local directory bootstrap problems here.
  }

  dbInstance = new Database(dbPath);
  dbInstance.pragma("journal_mode = WAL");

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      REDACTED_PASSWORDHash TEXT NOT NULL,
      role TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS parentChildLinks (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      parentId TEXT NOT NULL,
      childId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      UNIQUE(parentId, childId)
    );

    CREATE TABLE IF NOT EXISTS pots (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      targetAmount REAL NOT NULL,
      currentBalance REAL NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      potId TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      reviewParentId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scheduledTransactions (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      potId TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT,
      recurrence TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_pots_userId ON pots(userId, createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_transactions_userId ON transactions(userId, createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_transactions_potId ON transactions(potId, createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_parentChildLinks_parentId ON parentChildLinks(parentId, childId);
    CREATE INDEX IF NOT EXISTS idx_scheduledTransactions_userId ON scheduledTransactions(userId, createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_scheduledTransactions_potId ON scheduledTransactions(potId, startDate ASC);
  `);

  ensureColumn(dbInstance, "transactions", "scheduledTransactionId", "TEXT");
  ensureColumn(dbInstance, "transactions", "scheduledOccurrenceDate", "TEXT");
  dbInstance.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_schedule_occurrence
    ON transactions(scheduledTransactionId, scheduledOccurrenceDate)
    WHERE scheduledTransactionId IS NOT NULL AND scheduledOccurrenceDate IS NOT NULL;
  `);

  return new SQLiteDatabase(dbInstance);
}

export async function getDatabase() {
  return connectToDatabase();
}

export async function getDatabaseStatus() {
  try {
    const db = await connectToDatabase();
    const users = db.collection("users");
    users.findOne({ _id: 1 });

    return {
      configured: true,
      connected: true,
      databaseName: "SQLite Local Database",
      message: "Lokale SQLite database verbinding gelukt.",
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      databaseName: "SQLite Local Database",
      message: error.message,
    };
  }
}

function ensureColumn(db, tableName, columnName, columnDefinition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    db.exec(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`,
    );
  }
}
