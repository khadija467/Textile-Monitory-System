const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/apiResponse");

/**
 * GET /api/production
 */
const getProduction = asyncHandler(async (req, res) => {
  const { lineNumber, machineId, from, to, page = 1, limit = 20 } = req.query;

  const where = {
    AND: [
      lineNumber ? { lineNumber } : {},
      machineId ? { machineId } : {},
      from || to
        ? {
            productionDate: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {},
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [records, total] = await Promise.all([
    prisma.production.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { productionDate: "desc" },
      include: { machine: { select: { machineCode: true, machineName: true } } },
    }),
    prisma.production.count({ where }),
  ]);

  return success(res, 200, "Production records fetched", records, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * POST /api/production
 */
const createProduction = asyncHandler(async (req, res) => {
  const { lineNumber, machineId, dailyOutput, targetOutput, efficiency, defectCount, productionDate } = req.body;

  if (!lineNumber || !machineId) {
    throw new ApiError(400, "lineNumber and machineId are required.");
  }

  const record = await prisma.production.create({
    data: {
      lineNumber,
      machineId,
      dailyOutput: dailyOutput ?? 0,
      targetOutput: targetOutput ?? 0,
      efficiency: efficiency ?? 0,
      defectCount: defectCount ?? 0,
      productionDate: productionDate ? new Date(productionDate) : new Date(),
    },
  });

  return success(res, 201, "Production record created successfully", record);
});

/**
 * PUT /api/production/:id
 */
const updateProduction = asyncHandler(async (req, res) => {
  const existing = await prisma.production.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Production record not found.");

  const payload = { ...req.body };
  if (payload.productionDate) payload.productionDate = new Date(payload.productionDate);
  delete payload.id;

  const record = await prisma.production.update({ where: { id: req.params.id }, data: payload });
  return success(res, 200, "Production record updated successfully", record);
});

/**
 * DELETE /api/production/:id
 */
const deleteProduction = asyncHandler(async (req, res) => {
  const existing = await prisma.production.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Production record not found.");

  await prisma.production.delete({ where: { id: req.params.id } });
  return success(res, 200, "Production record deleted successfully");
});

/**
 * GET /api/production/analytics?range=daily|weekly|monthly|yearly
 */
const getProductionAnalytics = asyncHandler(async (req, res) => {
  const { range = "weekly" } = req.query;

  const now = new Date();
  let from;
  switch (range) {
    case "daily":
      from = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      break;
    case "monthly":
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "yearly":
      from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default: // weekly
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const records = await prisma.production.findMany({
    where: { productionDate: { gte: from } },
    orderBy: { productionDate: "asc" },
  });

  // Group by day for trend chart
  const trendMap = {};
  for (const r of records) {
    const day = r.productionDate.toISOString().slice(0, 10);
    if (!trendMap[day]) trendMap[day] = { date: day, output: 0, target: 0, count: 0 };
    trendMap[day].output += r.dailyOutput;
    trendMap[day].target += r.targetOutput;
    trendMap[day].count += 1;
  }
  const trend = Object.values(trendMap);

  const totalOutput = records.reduce((sum, r) => sum + r.dailyOutput, 0);
  const totalTarget = records.reduce((sum, r) => sum + r.targetOutput, 0);
  const avgEfficiency =
    records.length > 0 ? records.reduce((sum, r) => sum + r.efficiency, 0) / records.length : 0;
  const totalDefects = records.reduce((sum, r) => sum + r.defectCount, 0);

  return success(res, 200, "Production analytics fetched", {
    range,
    totalOutput,
    totalTarget,
    avgEfficiency,
    totalDefects,
    trend,
  });
});

/**
 * GET /api/production/department-performance
 */
const getDepartmentPerformance = asyncHandler(async (req, res) => {
  const machines = await prisma.machine.findMany({
    include: { productionRecords: { orderBy: { productionDate: "desc" }, take: 7 } },
  });

  const deptMap = {};
  for (const m of machines) {
    if (!deptMap[m.department]) deptMap[m.department] = { department: m.department, output: 0, efficiency: 0, count: 0 };
    const totalOut = m.productionRecords.reduce((s, r) => s + r.dailyOutput, 0);
    const avgEff = m.productionRecords.length
      ? m.productionRecords.reduce((s, r) => s + r.efficiency, 0) / m.productionRecords.length
      : 0;
    deptMap[m.department].output += totalOut;
    deptMap[m.department].efficiency += avgEff;
    deptMap[m.department].count += 1;
  }

  const result = Object.values(deptMap).map((d) => ({
    department: d.department,
    output: d.output,
    efficiency: d.count ? d.efficiency / d.count : 0,
  }));

  return success(res, 200, "Department performance fetched", result);
});

module.exports = {
  getProduction,
  createProduction,
  updateProduction,
  deleteProduction,
  getProductionAnalytics,
  getDepartmentPerformance,
};
