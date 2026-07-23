const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");

/**
 * GET /api/dashboard/admin
 * Aggregates the KPIs and chart data shown on the admin dashboard.
 */
const getAdminDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const [
    totalMachines,
    runningMachines,
    faultyMachines,
    maintenanceMachines,
    totalWorkers,
    todayProduction,
    avgEfficiency,
    machineStatusGroups,
    weeklyTrendRaw,
  ] = await Promise.all([
    prisma.machine.count(),
    prisma.machine.count({ where: { status: "RUNNING" } }),
    prisma.machine.count({ where: { status: "FAULTY" } }),
    prisma.machine.count({ where: { status: "MAINTENANCE" } }),
    prisma.user.count({ where: { role: { in: ["WORKER", "TECHNICIAN"] } } }),
    prisma.production.aggregate({
      _sum: { dailyOutput: true, targetOutput: true },
      where: { productionDate: { gte: today, lt: tomorrow } },
    }),
    prisma.machine.aggregate({ _avg: { efficiency: true } }),
    prisma.machine.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.production.findMany({
      where: { productionDate: { gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { productionDate: "asc" },
    }),
  ]);

  const weeklyMap = {};
  for (const r of weeklyTrendRaw) {
    const day = r.productionDate.toISOString().slice(0, 10);
    if (!weeklyMap[day]) weeklyMap[day] = { date: day, output: 0, target: 0 };
    weeklyMap[day].output += r.dailyOutput;
    weeklyMap[day].target += r.targetOutput;
  }

  const departmentPerf = await prisma.machine.groupBy({
    by: ["department"],
    _avg: { efficiency: true },
    _count: { id: true },
  });

  return success(res, 200, "Admin dashboard data fetched", {
    kpis: {
      totalMachines,
      runningMachines,
      faultyMachines,
      maintenanceMachines,
      totalWorkers,
      todayOutput: todayProduction._sum.dailyOutput || 0,
      todayTarget: todayProduction._sum.targetOutput || 0,
      avgEfficiency: avgEfficiency._avg.efficiency || 0,
    },
    charts: {
      machineStatusDistribution: machineStatusGroups.map((g) => ({
        status: g.status,
        count: g._count.status,
      })),
      weeklyProduction: Object.values(weeklyMap),
      departmentPerformance: departmentPerf.map((d) => ({
        department: d.department,
        avgEfficiency: d._avg.efficiency || 0,
        machineCount: d._count.id,
      })),
    },
  });
});

/**
 * GET /api/dashboard/worker
 * Simplified dashboard data for the logged-in worker.
 */
const getWorkerDashboard = asyncHandler(async (req, res) => {
  const workerId = req.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [assignedMachines, todayAttendance, notifications, productionToday] = await Promise.all([
    prisma.machine.findMany({ where: { operatorId: workerId } }),
    prisma.attendance.findUnique({ where: { workerId_date: { workerId, date: today } } }),
    prisma.notification.findMany({
      where: { OR: [{ userId: workerId }, { userId: null }] },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.production.findMany({
      where: {
        machine: { operatorId: workerId },
        productionDate: { gte: today },
      },
    }),
  ]);

  return success(res, 200, "Worker dashboard data fetched", {
    assignedMachines,
    todayAttendance,
    notifications,
    productionToday,
  });
});

module.exports = { getAdminDashboard, getWorkerDashboard };
