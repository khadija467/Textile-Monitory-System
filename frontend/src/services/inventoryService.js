import api from "./api";

export const inventoryService = {
  getAll: (params) => api.get("/inventory", { params }).then((r) => r.data),
  getById: (id) => api.get(`/inventory/${id}`).then((r) => r.data),
  create: (payload) => api.post("/inventory", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/inventory/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/inventory/${id}`).then((r) => r.data),
  getLowStockAlerts: () => api.get("/inventory/alerts/low-stock").then((r) => r.data),
};
