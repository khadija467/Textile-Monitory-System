const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/apiResponse");
const authService = require("../services/authService");
const logAudit = require("../utils/auditLogger");

/**
 * GET /api/workers
 */
const getWorkers = asyncHandler(async (req, res) => {
  const { search, department, role, page = 1, limit = 10 } = req.query;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      department ? { department } : {},
      role ? { role } : {},
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [workers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        shiftStart: true,
        shiftEnd: true,
        isActive: true,
        createdAt: true,
        _count: { select: { operatedMachines: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return success(res, 200, "Workers fetched", workers, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * GET /api/workers/:id
 */
const getWorkerById = asyncHandler(async (req, res) => {
  const worker = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      phone: true,
      shiftStart: true,
      shiftEnd: true,
      isActive: true,
      createdAt: true,
      operatedMachines: { select: { id: true, machineCode: true, machineName: true, status: true } },
      attendanceRecords: { orderBy: { date: "desc" }, take: 30 },
    },
  });

  if (!worker) throw new ApiError(404, "Worker not found.");
  return success(res, 200, "Worker fetched", worker);
});

/**
 * POST /api/workers
 */
const createWorker = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, phone, shiftStart, shiftEnd } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, "A user with this email already exists.");

  const hashed = await authService.hashPassword(password);

  const worker = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role || "WORKER",
      department,
      phone,
      shiftStart,
      shiftEnd,
    },
  });

  await logAudit({
    userId: req.user.id,
    action: "CREATE",
    entity: "User",
    entityId: worker.id,
    details: `Created worker ${worker.email}`,
    ipAddress: req.ip,
  });

  return success(res, 201, "Worker created successfully", authService.sanitizeUser(worker));
});

/**
 * PUT /api/workers/:id
 */
const updateWorker = asyncHandler(async (req, res) => {
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Worker not found.");

  const payload = { ...req.body };
  delete payload.id;
  delete payload.email; // email changes handled via a dedicated flow in real systems

  if (payload.password) {
    payload.password = await authService.hashPassword(payload.password);
  } else {
    delete payload.password;
  }

  const worker = await prisma.user.update({
    where: { id: req.params.id },
    data: payload,
  });

  await logAudit({
    userId: req.user.id,
    action: "UPDATE",
    entity: "User",
    entityId: worker.id,
    details: `Updated worker ${worker.email}`,
    ipAddress: req.ip,
  });

  return success(res, 200, "Worker updated successfully", authService.sanitizeUser(worker));
});

/**
 * DELETE /api/workers/:id
 */
const deleteWorker = asyncHandler(async (req, res) => {
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Worker not found.");

  await prisma.user.delete({ where: { id: req.params.id } });

  await logAudit({
    userId: req.user.id,
    action: "DELETE",
    entity: "User",
    entityId: req.params.id,
    details: `Deleted worker ${existing.email}`,
    ipAddress: req.ip,
  });

  return success(res, 200, "Worker deleted successfully");
});

/**
 * PUT /api/workers/:id/assign-machine
 */
const assignMachine = asyncHandler(async (req, res) => {
  const { machineId } = req.body;
  if (!machineId) throw new ApiError(400, "machineId is required.");

  const machine = await prisma.machine.update({
    where: { id: machineId },
    data: { operatorId: req.params.id },
  });

  await logAudit({
    userId: req.user.id,
    action: "ASSIGN",
    entity: "Machine",
    entityId: machine.id,
    details: `Assigned machine ${machine.machineCode} to worker ${req.params.id}`,
    ipAddress: req.ip,
  });

  return success(res, 200, "Machine assigned successfully", machine);
});

module.exports = {
  getWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
  assignMachine,
};
