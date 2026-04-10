import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import familyRoutes from "./routes/familyRoutes.js";
import potsRoutes from "./routes/potsRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";
import transactionsRoutes from "./routes/transactionsRoutes.js";

const app = express();

// Voor lokale development en testen op telefoon/PWA laten we alle origins toe.
app.use(cors());

app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    success: true,
    message: "BudgetApp backend draait.",
  });
});

app.use("/api", systemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/pots", potsRoutes);
app.use("/api/transactions", transactionsRoutes);

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
