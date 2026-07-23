import api from "./api";

export const attendanceService = {
  getAll: (params) => api.get("/attendance", { params }).then((r) => r.data),
  checkIn: () => api.post("/attendance/checkin").then((r) => r.data),
  checkOut: () => api.post("/attendance/checkout").then((r) => r.data),
  update: (id, payload) => api.put(`/attendance/${id}`, payload).then((r) => r.data),
};
