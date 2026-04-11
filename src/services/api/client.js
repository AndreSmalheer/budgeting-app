import appConfig from "../../config/appConfig";

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw new Error("De nieuwe MongoDB backend is nog niet gekoppeld.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Er ging iets mis met de API.");
  }

  return data;
}

export async function getApiHealth() {
  return apiRequest("/health");
}

export async function getDatabaseStatus() {
  return apiRequest("/db-status");
}

export async function registerAccount(formData) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export async function loginAccount(formData) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export async function getFamilyStatus(userId) {
  const params = new URLSearchParams({ userId });

  return apiRequest(`/family/status?${params.toString()}`);
}

export async function linkChildAccount(formData) {
  return apiRequest("/family/link", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export async function unlinkFamilyAccount(userId) {
  const params = new URLSearchParams({ userId });

  return apiRequest(`/family/link?${params.toString()}`, {
    method: "DELETE",
  });
}

export async function getLinkedChildPots(userId) {
  const params = new URLSearchParams({ userId });

  return apiRequest(`/family/child/pots?${params.toString()}`);
}

export async function getLinkedChildTransactions(userId, options = {}) {
  const params = new URLSearchParams({ userId });
  const { potId = "", type = "" } = options;

  if (potId) {
    params.set("potId", potId);
  }

  if (type) {
    params.set("type", type);
  }

  return apiRequest(`/family/child/transactions?${params.toString()}`);
}

export async function getPendingApprovals(userId) {
  const params = new URLSearchParams({ userId });

  return apiRequest(`/family/approvals?${params.toString()}`);
}

export async function reviewApproval(formData) {
  return apiRequest(`/family/approvals/${formData.approvalId}`, {
    method: "PATCH",
    body: JSON.stringify({
      userId: formData.userId,
      action: formData.action,
    }),
  });
}

export async function getPots(userId) {
  const params = new URLSearchParams({ userId });

  return apiRequest(`/pots?${params.toString()}`);
}

export async function getPotById(userId, potId) {
  const params = new URLSearchParams({ userId });

  return apiRequest(`/pots/${potId}?${params.toString()}`);
}

export async function createPot(formData) {
  return apiRequest("/pots", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export async function updatePot(potId, formData) {
  return apiRequest(`/pots/${potId}`, {
    method: "PATCH",
    body: JSON.stringify(formData),
  });
}

export async function deletePot(userId, potId) {
  const params = new URLSearchParams({ userId });

  return apiRequest(`/pots/${potId}?${params.toString()}`, {
    method: "DELETE",
  });
}

export async function getTransactions(userId, options = {}) {
  const params = new URLSearchParams({ userId });
  const { potId = "", type = "", category = "" } = options;

  if (potId) {
    params.set("potId", potId);
  }

  if (type) {
    params.set("type", type);
  }

  if (category && category !== "all") {
    params.set("category", category);
  }

  return apiRequest(`/transactions?${params.toString()}`);
}

export async function getScheduledTransactions(userId, options = {}) {
  const params = new URLSearchParams({ userId });
  const { potId = "" } = options;

  if (potId) {
    params.set("potId", potId);
  }

  return apiRequest(`/scheduled-transactions?${params.toString()}`);
}

export async function createScheduledTransaction(formData) {
  return apiRequest("/scheduled-transactions", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export async function updateScheduledTransaction(scheduleId, formData) {
  return apiRequest(`/scheduled-transactions/${scheduleId}`, {
    method: "PATCH",
    body: JSON.stringify(formData),
  });
}

export async function deleteScheduledTransaction(userId, scheduleId) {
  const params = new URLSearchParams({ userId });

  return apiRequest(`/scheduled-transactions/${scheduleId}?${params.toString()}`, {
    method: "DELETE",
  });
}

export async function syncScheduledTransactions(userId) {
  return apiRequest("/scheduled-transactions/sync", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function createTransaction(formData) {
  return apiRequest("/transactions", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export async function updateTransaction(transactionId, formData) {
  return apiRequest(`/transactions/${transactionId}`, {
    method: "PATCH",
    body: JSON.stringify(formData),
  });
}

export async function deleteTransaction(userId, transactionId) {
  const params = new URLSearchParams({ userId });

  return apiRequest(`/transactions/${transactionId}?${params.toString()}`, {
    method: "DELETE",
  });
}

export default apiRequest;
