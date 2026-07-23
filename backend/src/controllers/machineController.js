const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/apiResponse");
const logAudit = require("../utils/auditLogger");

/**
 * GET /api/machines
 * Supports: ?search=&status=&department=&lineNumber=&page=&limit=
 */
const getMachines = asyncHandler(async (req, res) => {
  const { search, status, department, lineNumber, page = 1, limit = 10 } = req.query;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { machineName: { contains: search, mode: "insensitive" } },
              { machineCode: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      status ? { status } : {},
      department ? { department } : {},
      lineNumber ? { lineNumber } : {},
      // Workers only see machines they currently operate
      req.user.role === "WORKER" ? { operatorId: req.user.id } : {},
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [machines, total] = await Promise.all([
    prisma.machine.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: {
        operator: { select: { id: true, name: true } },
      },
    }),
    prisma.machine.count({ where }),
  ]);

  return success(res, 200, "Machines fetched", machines, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * GET /api/machines/:id
 */
const getMachineById = asyncHandler(async (req, res) => {
  const machine = await prisma.machine.findUnique({
    where: { id: req.params.id },
    include: {
      operator: { select: { id: true, name: true, email: true } },
      maintenanceTickets: { orderBy: { createdAt: "desc" }, take: 10 },
      productionRecords: { orderBy: { productionDate: "desc" }, take: 30 },
    },
  });

  if (!machine) throw new ApiError(404, "Machine not found.");

  if (req.user.role === "WORKER" && machine.operatorId !== req.user.id) {
    throw new ApiError(403, "You can only view machines assigned to you.");
  }

  return success(res, 200, "Machine fetched", machine);
});

/**
 * POST /api/machines
 */
const createMachine = asyncHandler(async (req, res) => {
  const {
    machineCode,
    machineName,
    machineType,
    lineNumber,
    department,
    status,
    temperature,
    rpm,
    efficiency,
    operatorId,
    lastMaintenance,
    nextMaintenance,
    installedAt,
  } = req.body;

  if (!machineCode || !machineName || !lineNumber || !department) {
    throw new ApiError(400, "machineCode, machineName, lineNumber, and department are required.");
  }

  const machine = await prisma.machine.create({
    data: {
      machineCode,
      machineName,
      machineType,
      lineNumber,
      department,
      status: status || "IDLE",
      temperature: temperature ?? 0,
      rpm: rpm ?? 0,
      efficiency: efficiency ?? 0,
      operatorId: operatorId || null,
      lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : null,
      nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : null,
      installedAt: installedAt ? new Date(installedAt) : null,
    },
  });

  await logAudit({
    userId: req.user.id,
    action: "CREATE",
    entity: "Machine",
    entityId: machine.id,
    details: `Created machine ${machine.machineCode}`,
    ipAddress: req.ip,
  });

  return success(res, 201, "Machine created successfully", machine);
});

/**
 * PUT /api/machines/:id
 */
const updateMachine = asyncHandler(async (req, res) => {
  const existing = await prisma.machine.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Machine not found.");

  const payload = { ...req.body };
  if (payload.lastMaintenance) payload.lastMaintenance = new Date(payload.lastMaintenance);
  if (payload.nextMaintenance) payload.nextMaintenance = new Date(payload.nextMaintenance);
  if (payload.installedAt) payload.installedAt = new Date(payload.installedAt);
  delete payload.id;

  const machine = await prisma.machine.update({
    where: { id: req.params.id },
    data: payload,
  });

  await logAudit({
    userId: req.user.id,
    action: "UPDATE",
    entity: "Machine",
    entityId: machine.id,
    details: `Updated machine ${machine.machineCode}`,
    ipAddress: req.ip,
  });

  return success(res, 200, "Machine updated successfully", machine);
});

/**
 * DELETE /api/machines/:id
 */
const deleteMachine = asyncHandler(async (req, res) => {
  const existing = await prisma.machine.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Machine not found.");

  await prisma.machine.delete({ where: { id: req.params.id } });

  await logAudit({
    userId: req.user.id,
    action: "DELETE",
    entity: "Machine",
    entityId: req.params.id,
    details: `Deleted machine ${existing.machineCode}`,
    ipAddress: req.ip,
  });

  return success(res, 200, "Machine deleted successfully");
});

/**
 * GET /api/machines/stats/summary
 */
const getMachineStats = asyncHandler(async (req, res) => {
  const [total, running, faulty, maintenance, idle, offline] = await Promise.all([
    prisma.machine.count(),
    prisma.machine.count({ where: { status: "RUNNING" } }),
    prisma.machine.count({ where: { status: "FAULTY" } }),
    prisma.machine.count({ where: { status: "MAINTENANCE" } }),
    prisma.machine.count({ where: { status: "IDLE" } }),
    prisma.machine.count({ where: { status: "OFFLINE" } }),
  ]);

  const avgEfficiency = await prisma.machine.aggregate({
    _avg: { efficiency: true },
  });

  return success(res, 200, "Machine stats fetched", {
    total,
    running,
    faulty,
    maintenance,
    idle,
    offline,
    avgEfficiency: avgEfficiency._avg.efficiency || 0,
  });
});

module.exports = {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMachineStats,
};
