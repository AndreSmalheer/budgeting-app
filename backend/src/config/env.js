import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 5050),
  clientUrl: process.env.CLIENT_URL || "http://127.0.0.1:5173",
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: Number(process.env.DB_PORT || 3306),
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "budgeting_app",
  approvalLimit: Number(process.env.APPROVAL_LIMIT || 100),
};
