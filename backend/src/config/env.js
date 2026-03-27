import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 5050),
  clientUrl: process.env.CLIENT_URL || "http://127.0.0.1:5173",
  mongodbUri: process.env.MONGODB_URI || "",
  mongodbDbName: process.env.MONGODB_DB_NAME || "budgettingbp03",
  approvalLimit: Number(process.env.APPROVAL_LIMIT || 40),
};
