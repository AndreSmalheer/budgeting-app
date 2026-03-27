import appConfig from "../../config/appConfig";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

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
  return apiRequest("/register", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export async function loginAccount(formData) {
  return apiRequest("/login", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export default apiRequest;
