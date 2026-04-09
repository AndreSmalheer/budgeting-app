import app from "./app.js";
import { config } from "./config/env.js";
import { connectToDatabase } from "./config/database.js";

app.listen(config.port, async () => {
  console.log(`BudgetApp backend draait op http://localhost:${config.port}`);

  if (!config.mongodbUri) {
    console.log("MongoDB is nog niet gekoppeld. Vul eerst backend/.env in.");
    return;
  }

  try {
    await connectToDatabase();
    console.log("MongoDB verbinding is gelukt.");
  } catch (error) {
    console.log(`MongoDB verbinding is nog niet gelukt: ${error.message}`);
  }
});
