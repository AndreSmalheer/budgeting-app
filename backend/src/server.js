import app from "./app.js";
import { config } from "./config/env.js";
import { connectToDatabase } from "./config/database.js";

app.listen(config.port, async () => {
  console.log(`BudgetApp backend draait op http://localhost:${config.port}`);

  try {
    await connectToDatabase();
    console.log("SQLite lokale database verbinding is gelukt.");
  } catch (error) {
    console.log(
      `SQLite database verbinding is nog niet gelukt: ${error.message}`,
    );
  }
});
