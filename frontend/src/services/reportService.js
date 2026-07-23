import api from "./api";

async function downloadFile(url, filename) {
  const response = await api.get(url, { responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export const reportService = {
  getMachineReport: () => api.get("/reports/machines").then((r) => r.data),
  getProductionReport: (params) => api.get("/reports/production", { params }).then((r) => r.data),
  getMaintenanceReport: () => api.get("/reports/maintenance").then((r) => r.data),
  getAttendanceReport: (params) => api.get("/reports/attendance", { params }).then((r) => r.data),
  exportExcel: (reportType) =>
    downloadFile(`/reports/export/excel?reportType=${reportType}`, `${reportType}-report.xlsx`),
  exportPDF: (reportType) =>
    downloadFile(`/reports/export/pdf?reportType=${reportType}`, `${reportType}-report.pdf`),
};
