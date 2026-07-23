const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/apiResponse");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

/**
 * GET /api/reports/machines
 */
const getMachineReport = asyncHandler(async (req, res) => {
  const machines = await prisma.machine.findMany({
    include: { operator: { select: { name: true } } },
    orderBy: { machineCode: "asc" },
  });
  return success(res, 200, "Machine report generated", machines);
});

/**
 * GET /api/reports/production
 */
const getProductionReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const where =
    from || to
      ? {
          productionDate: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {};

  const records = await prisma.production.findMany({
    where,
    include: { machine: { select: { machineCode: true, machineName: true } } },
    orderBy: { productionDate: "desc" },
  });
  return success(res, 200, "Production report generated", records);
});

/**
 * GET /api/reports/maintenance
 */
const getMaintenanceReport = asyncHandler(async (req, res) => {
  const tickets = await prisma.maintenance.findMany({
    include: {
      machine: { select: { machineCode: true, machineName: true } },
      technician: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return success(res, 200, "Maintenance report generated", tickets);
});

/**
 * GET /api/reports/attendance
 */
const getAttendanceReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const where =
    from || to
      ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {};

  const records = await prisma.attendance.findMany({
    where,
    include: { worker: { select: { name: true, department: true } } },
    orderBy: { date: "desc" },
  });
  return success(res, 200, "Attendance report generated", records);
});

/**
 * GET /api/reports/export/excel?reportType=machines|production|maintenance|attendance
 */
const exportExcel = asyncHandler(async (req, res) => {
  const { reportType } = req.query;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Textile Factory Monitoring System";
  const sheet = workbook.addWorksheet(reportType || "Report");

  let rows = [];
  let columns = [];

  switch (reportType) {
    case "machines": {
      rows = await prisma.machine.findMany({ include: { operator: { select: { name: true } } } });
      columns = [
        { header: "Machine Code", key: "machineCode", width: 16 },
        { header: "Machine Name", key: "machineName", width: 22 },
        { header: "Line", key: "lineNumber", width: 10 },
        { header: "Department", key: "department", width: 16 },
        { header: "Status", key: "status", width: 14 },
        { header: "Efficiency (%)", key: "efficiency", width: 14 },
        { header: "Operator", key: "operatorName", width: 18 },
      ];
      rows = rows.map((r) => ({ ...r, operatorName: r.operator?.name || "Unassigned" }));
      break;
    }
    case "production": {
      rows = await prisma.production.findMany({
        include: { machine: { select: { machineCode: true } } },
      });
      columns = [
        { header: "Date", key: "productionDate", width: 14 },
        { header: "Line", key: "lineNumber", width: 10 },
        { header: "Machine", key: "machineCode", width: 16 },
        { header: "Output", key: "dailyOutput", width: 12 },
        { header: "Target", key: "targetOutput", width: 12 },
        { header: "Efficiency (%)", key: "efficiency", width: 14 },
        { header: "Defects", key: "defectCount", width: 10 },
      ];
      rows = rows.map((r) => ({
        ...r,
        machineCode: r.machine?.machineCode,
        productionDate: r.productionDate.toISOString().slice(0, 10),
      }));
      break;
    }
    case "maintenance": {
      rows = await prisma.maintenance.findMany({
        include: { machine: { select: { machineCode: true } }, technician: { select: { name: true } } },
      });
      columns = [
        { header: "Machine", key: "machineCode", width: 16 },
        { header: "Issue", key: "issue", width: 28 },
        { header: "Priority", key: "priority", width: 12 },
        { header: "Status", key: "status", width: 14 },
        { header: "Technician", key: "technicianName", width: 18 },
        { header: "Created", key: "createdAt", width: 14 },
      ];
      rows = rows.map((r) => ({
        ...r,
        machineCode: r.machine?.machineCode,
        technicianName: r.technician?.name || "Unassigned",
        createdAt: r.createdAt.toISOString().slice(0, 10),
      }));
      break;
    }
    case "attendance": {
      rows = await prisma.attendance.findMany({ include: { worker: { select: { name: true } } } });
      columns = [
        { header: "Worker", key: "workerName", width: 20 },
        { header: "Date", key: "date", width: 14 },
        { header: "Check In", key: "checkInStr", width: 12 },
        { header: "Check Out", key: "checkOutStr", width: 12 },
        { header: "Status", key: "status", width: 12 },
      ];
      rows = rows.map((r) => ({
        ...r,
        workerName: r.worker?.name,
        date: r.date.toISOString().slice(0, 10),
        checkInStr: r.checkIn ? r.checkIn.toTimeString().slice(0, 5) : "-",
        checkOutStr: r.checkOut ? r.checkOut.toTimeString().slice(0, 5) : "-",
      }));
      break;
    }
    default:
      throw new ApiError(400, "Invalid reportType. Use machines, production, maintenance, or attendance.");
  }

  sheet.columns = columns;
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F3D3E" } };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  rows.forEach((r) => sheet.addRow(r));

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=${reportType}-report.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
});

/**
 * GET /api/reports/export/pdf?reportType=machines|production|maintenance|attendance
 */
const exportPDF = asyncHandler(async (req, res) => {
  const { reportType } = req.query;

  let rows = [];
  let title = "Report";

  switch (reportType) {
    case "machines":
      rows = await prisma.machine.findMany({ include: { operator: { select: { name: true } } } });
      title = "Machine Report";
      break;
    case "production":
      rows = await prisma.production.findMany({ include: { machine: { select: { machineCode: true } } } });
      title = "Production Report";
      break;
    case "maintenance":
      rows = await prisma.maintenance.findMany({ include: { machine: { select: { machineCode: true } } } });
      title = "Maintenance Report";
      break;
    case "attendance":
      rows = await prisma.attendance.findMany({ include: { worker: { select: { name: true } } } });
      title = "Attendance Report";
      break;
    default:
      throw new ApiError(400, "Invalid reportType. Use machines, production, maintenance, or attendance.");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${reportType}-report.pdf`);

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  doc.fontSize(20).fillColor("#0F3D3E").text("Textile Factory Monitoring System", { align: "center" });
  doc.fontSize(14).fillColor("#1B8A6B").text(title, { align: "center" });
  doc.moveDown();
  doc.fontSize(9).fillColor("#33424A").text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
  doc.moveDown(1.5);

  doc.fontSize(10).fillColor("#000000");
  rows.forEach((row, idx) => {
    const line = JSON.stringify(row, (key, val) =>
      key === "password" ? undefined : val
    );
    doc.text(`${idx + 1}. ${line.slice(0, 250)}`, { width: 520 });
    doc.moveDown(0.3);
  });

  doc.end();
});

module.exports = {
  getMachineReport,
  getProductionReport,
  getMaintenanceReport,
  getAttendanceReport,
  exportExcel,
  exportPDF,
};
