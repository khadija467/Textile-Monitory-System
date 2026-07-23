import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a 401, try to refresh the access token once, then retry the request.
let isRefreshing = false;
let pendingQueue = [];

function resolvePending(token) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { config, response } = err;
    if (!response || response.status !== 401 || config._retried) {
      return Promise.reject(err);
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      return Promise.reject(err);
    }

    config._retried = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingQueue.push((token) => {
          config.headers.Authorization = `Bearer ${token}`;
          resolve(api(config));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post("/api/auth/refresh", { refreshToken });
      const newAccess = data.data.accessToken;
      localStorage.setItem("accessToken", newAccess);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      resolvePending(newAccess);
      config.headers.Authorization = `Bearer ${newAccess}`;
      return api(config);
    } catch (refreshErr) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
