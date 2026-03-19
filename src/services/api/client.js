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

export default apiRequest;
