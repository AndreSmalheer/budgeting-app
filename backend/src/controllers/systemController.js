import { getDatabaseStatus } from "../config/database.js";

export async function healthCheck(request, response) {
  response.json({
    success: true,
    message: "BudgetMaatje Node backend werkt.",
  });
}

export async function databaseStatusCheck(request, response) {
  const status = await getDatabaseStatus();

  if (!status.connected) {
    response.status(status.configured ? 500 : 503).json({
      success: false,
      connected: false,
      configured: status.configured,
      databaseName: status.databaseName,
      message: status.message,
    });
    return;
  }

  response.json({
    success: true,
    connected: true,
    configured: true,
    databaseName: status.databaseName,
    message: status.message,
  });
}
