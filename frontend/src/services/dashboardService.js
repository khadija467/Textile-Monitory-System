import api from "./api";

export const dashboardService = {
  getAdminDashboard: () => api.get("/dashboard/admin").then((r) => r.data),
  getWorkerDashboard: () => api.get("/dashboard/worker").then((r) => r.data),
};
