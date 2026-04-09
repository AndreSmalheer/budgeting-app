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

export async function createTransaction(formData) {
  return apiRequest("/transactions", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export default apiRequest;
