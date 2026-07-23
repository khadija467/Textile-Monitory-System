import api from "./api";

export const workerService = {
  getAll: (params) => api.get("/workers", { params }).then((r) => r.data),
  getById: (id) => api.get(`/workers/${id}`).then((r) => r.data),
  create: (payload) => api.post("/workers", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/workers/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/workers/${id}`).then((r) => r.data),
  assignMachine: (id, machineId) =>
    api.put(`/workers/${id}/assign-machine`, { machineId }).then((r) => r.data),
};
