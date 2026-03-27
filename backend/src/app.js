import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";
import { config } from "./config/env.js";

const app = express();

const allowedOrigins = new Set([
  config.clientUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Deze origin is niet toegestaan door CORS."));
    },
  }),
);

app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    success: true,
    message: "BudgetMaatje backend draait.",
  });
});

app.use("/api", systemRoutes);
app.use("/api/auth", authRoutes);

app.use((request, response) => {
  response.status(404).json({
    success: false,
    message: "Route niet gevonden.",
  });
});

app.use((error, request, response, _next) => {
  console.error(error);

  response.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Er ging iets mis in de backend.",
  });
});

export default app;
