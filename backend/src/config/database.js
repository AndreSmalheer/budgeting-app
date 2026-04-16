import mysql from "mysql2/promise";
import { config } from "./env.js";

let pool = null;

class MySQLDatabase {
  constructor(pool) {
    this._pool = pool;
  }

  get pool() {
    return this._pool;
  }

  collection(name) {
    return new MySQLCollection(this._pool, name);
  }
}

class MySQLCollection {
  constructor(pool, name) {
    this.pool = pool;
    this.name = name;
  }

  async findOne(query) {
    const where = this._buildWhere(query);
    const sql = `SELECT * FROM \`${this.name}\` WHERE ${where.clause} LIMIT 1`;
    const [rows] = await this.pool.execute(sql, where.values);
    return this._mapRow(rows[0]);
  }

  find(query) {
    return new MySQLFindQuery(this.pool, this.name, query);
  }

  async insertOne(doc) {
    const keys = Object.keys(doc).filter((key) => key !== "_id");
    const placeholders = keys.map(() => "?").join(",");
    const sql = `INSERT INTO \`${this.name}\` (${keys.map(k => `\`${k}\``).join(",")}) VALUES (${placeholders})`;
    
    const [result] = await this.pool.execute(sql, keys.map((key) => this._formatValue(doc[key])));
    return { insertedId: result.insertId };
  }

  async updateOne(query, update) {
    const where = this._buildWhere(query);
    const $set = update.$set || update;
    const setKeys = Object.keys($set).filter((key) => key !== "_id");
    const setClauses = setKeys.map((key) => `\`${key}\` = ?`).join(",");
    
    const sql = `UPDATE \`${this.name}\` SET ${setClauses} WHERE ${where.clause}`;
    const values = [
      ...setKeys.map((key) => this._formatValue($set[key])),
      ...where.values,
    ];
    
    const [result] = await this.pool.execute(sql, values);
    return { modifiedCount: result.affectedRows };
  }

  async deleteOne(query) {
    const where = this._buildWhere(query);
    const sql = `DELETE FROM \`${this.name}\` WHERE ${where.clause} LIMIT 1`;
    const [result] = await this.pool.execute(sql, where.values);
    return { deletedCount: result.affectedRows };
  }

  async deleteMany(query) {
    const where = this._buildWhere(query);
    const sql = `DELETE FROM \`${this.name}\` WHERE ${where.clause}`;
    const [result] = await this.pool.execute(sql, where.values);
    return { deletedCount: result.affectedRows };
  }

  createIndex(_fields, _options) {
    // No-op for MySQL in this context
  }

  aggregate(pipeline) {
    return new MySQLAggregateQuery(this.pool, this.name, {}, pipeline);
  }

  _buildWhere(query) {
    const clauses = [];
    const values = [];

    for (const [key, value] of Object.entries(query)) {
      const dbKey = key === "_id" ? "_id" : key;
      
      if (key === "_id" && typeof value === "object" && value !== null) {
        if (value.$in) {
          const placeholders = value.$in.map(() => "?").join(",");
          clauses.push(`\`_id\` IN (${placeholders})`);
          values.push(...value.$in);
        }
      } else if (typeof value === "object" && value !== null) {
        if (value.$in) {
          const placeholders = value.$in.map(() => "?").join(",");
          clauses.push(`\`${key}\` IN (${placeholders})`);
          values.push(...value.$in);
        }
      } else {
        clauses.push(`\`${dbKey}\` = ?`);
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
      return value.toISOString().slice(0, 19).replace('T', ' ');
    }
    return value;
  }

  _mapRow(row) {
    if (!row) return null;
    // MySQL might return BigInt for IDs, convert to string if needed
    if (row._id !== undefined && row._id !== null) {
      row._id = row._id.toString();
    }
    return row;
  }
}

class MySQLFindQuery {
  constructor(pool, name, query) {
    this.pool = pool;
    this.name = name;
    this.query = query;
    this.sortBy = null;
    this.limitCount = null;
  }

  sort(spec) {
    this.sortBy = spec;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  async toArray() {
    const where = this._buildWhere(this.query);
    let sql = `SELECT * FROM \`${this.name}\` WHERE ${where.clause}`;

    if (this.sortBy) {
      const sortClauses = [];
      for (const [key, order] of Object.entries(this.sortBy)) {
        sortClauses.push(`\`${key}\` ${order === -1 ? "DESC" : "ASC"}`);
      }
      sql += ` ORDER BY ${sortClauses.join(", ")}`;
    }

    if (this.limitCount) {
      sql += ` LIMIT ${this.limitCount}`;
    }

    const [results] = await this.pool.execute(sql, where.values);
    return results.map((row) => this._mapRow(row));
  }

  _buildWhere(query) {
    const clauses = [];
    const values = [];

    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "object" && value !== null) {
        if (value.$in) {
          const placeholders = value.$in.map(() => "?").join(",");
          clauses.push(`\`${key}\` IN (${placeholders})`);
          values.push(...value.$in);
        }
      } else {
        clauses.push(`\`${key}\` = ?`);
        values.push(value instanceof Date ? value.toISOString().slice(0, 19).replace('T', ' ') : value);
      }
    }

    return {
      clause: clauses.length > 0 ? clauses.join(" AND ") : "1",
      values,
    };
  }

  _mapRow(row) {
    if (!row) return null;
    if (row._id !== undefined && row._id !== null) {
      row._id = row._id.toString();
    }
    return row;
  }
}

class MySQLAggregateQuery {
  constructor(pool, name, query, pipeline) {
    this.pool = pool;
    this.name = name;
    this.query = query;
    this.pipeline = pipeline;
  }

  async toArray() {
    const matchStage = this.pipeline.find((stage) => stage.$match);
    const groupStage = this.pipeline.find((stage) => stage.$group);

    if (matchStage && groupStage && groupStage.$group.total) {
      const where = this._buildWhere(matchStage.$match);
      const sql = `SELECT SUM(amount) as total FROM \`${this.name}\` WHERE ${where.clause}`;
      const [results] = await this.pool.execute(sql, where.values);
      const total = results[0]?.total;
      return total !== null && total !== undefined ? [{ _id: null, total: Number(total) }] : [];
    }

    return [];
  }

  _buildWhere(query) {
    const clauses = [];
    const values = [];

    for (const [key, value] of Object.entries(query)) {
      clauses.push(`\`${key}\` = ?`);
      values.push(value);
    }

    return {
      clause: clauses.length > 0 ? clauses.join(" AND ") : "1",
      values,
    };
  }
}

export async function connectToDatabase() {
  if (pool) {
    return new MySQLDatabase(pool);
  }

  pool = mysql.createPool({
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    REDACTED_PASSWORD: config.dbPassword,
    database: config.dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  return new MySQLDatabase(pool);
}

export async function getDatabase() {
  return connectToDatabase();
}

export async function getDatabaseStatus() {
  try {
    const db = await connectToDatabase();
    // Simple query to check connection
    await pool.query("SELECT 1");

    return {
      configured: true,
      connected: true,
      databaseName: `MySQL (${config.dbName})`,
      message: "MySQL database verbinding gelukt.",
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      databaseName: "MySQL Database",
      message: error.message,
    };
  }
}
