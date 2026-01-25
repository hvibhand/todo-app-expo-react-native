import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://697570c8265838bbea975b4f.mockapi.io",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Optional: simple response/error interceptor (helpful for consistent errors)
apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    // Normalize axios error message
    const message =
      err?.response?.data?.message || err?.message || "Network error";
    return Promise.reject(new Error(message));
  }
);