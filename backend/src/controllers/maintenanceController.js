const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/apiResponse");
const logAudit = require("../utils/auditLogger");

/**
 * GET /api/maintenance
 */
const getMaintenanceTickets = asyncHandler(async (req, res) => {
  const { status, priority, machineId, technicianId, page = 1, limit = 10 } = req.query;

  const where = {
    AND: [
      status ? { status } : {},
      priority ? { priority } : {},
      machineId ? { machineId } : {},
      technicianId ? { technicianId } : {},
      req.user.role === "TECHNICIAN" ? { technicianId: req.user.id } : {},
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [tickets, total] = await Promise.all([
    prisma.maintenance.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: {
        machine: { select: { id: true, machineCode: true, machineName: true } },
        technician: { select: { id: true, name: true } },
        reportedBy: { select: { id: true, name: true } },
      },
    }),
    prisma.maintenance.count({ where }),
  ]);

  return success(res, 200, "Maintenance tickets fetched", tickets, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * GET /api/maintenance/:id
 */
const getMaintenanceById = asyncHandler(async (req, res) => {
  const ticket = await prisma.maintenance.findUnique({
    where: { id: req.params.id },
    include: {
      machine: true,
      technician: { select: { id: true, name: true, email: true } },
      reportedBy: { select: { id: true, name: true } },
    },
  });
  if (!ticket) throw new ApiError(404, "Maintenance ticket not found.");
  return success(res, 200, "Maintenance ticket fetched", ticket);
});

/**
 * POST /api/maintenance
 */
const createMaintenanceTicket = asyncHandler(async (req, res) => {
  const { machineId, issue, description, priority, technicianId, repairDate } = req.body;

  if (!machineId || !issue) {
    throw new ApiError(400, "machineId and issue are required.");
  }

  const ticket = await prisma.maintenance.create({
    data: {
      machineId,
      issue,
      description,
      priority: priority || "MEDIUM",
      technicianId: technicianId || null,
      status: technicianId ? "ASSIGNED" : "OPEN",
      reportedById: req.user.id,
      repairDate: repairDate ? new Date(repairDate) : null,
    },
  });

  // Reflect on the machine record so dashboards stay in sync
  await prisma.machine.update({
    where: { id: machineId },
    data: { status: "MAINTENANCE" },
  });

  await logAudit({
    userId: req.user.id,
    action: "CREATE",
    entity: "Maintenance",
    entityId: ticket.id,
    details: `Opened ticket for machine ${machineId}: ${issue}`,
    ipAddress: req.ip,
  });

  return success(res, 201, "Maintenance ticket created successfully", ticket);
});

/**
 * PUT /api/maintenance/:id
 */
const updateMaintenanceTicket = asyncHandler(async (req, res) => {
  const existing = await prisma.maintenance.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Maintenance ticket not found.");

  const payload = { ...req.body };
  if (payload.repairDate) payload.repairDate = new Date(payload.repairDate);
  if (payload.status === "RESOLVED" || payload.status === "CLOSED") {
    payload.resolvedAt = new Date();
  }
  delete payload.id;

  const ticket = await prisma.maintenance.update({
    where: { id: req.params.id },
    data: payload,
  });

  // If resolved, bring the machine back to RUNNING and stamp lastMaintenance
  if (payload.status === "RESOLVED" || payload.status === "CLOSED") {
    await prisma.machine.update({
      where: { id: ticket.machineId },
      data: { status: "RUNNING", lastMaintenance: new Date() },
    });
  }

  await logAudit({
    userId: req.user.id,
    action: "UPDATE",
    entity: "Maintenance",
    entityId: ticket.id,
    details: `Updated ticket ${ticket.id} -> status: ${ticket.status}`,
    ipAddress: req.ip,
  });

  return success(res, 200, "Maintenance ticket updated successfully", ticket);
});

/**
 * DELETE /api/maintenance/:id
 */
const deleteMaintenanceTicket = asyncHandler(async (req, res) => {
  const existing = await prisma.maintenance.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Maintenance ticket not found.");

  await prisma.maintenance.delete({ where: { id: req.params.id } });

  await logAudit({
    userId: req.user.id,
    action: "DELETE",
    entity: "Maintenance",
    entityId: req.params.id,
    ipAddress: req.ip,
  });

  return success(res, 200, "Maintenance ticket deleted successfully");
});

module.exports = {
  getMaintenanceTickets,
  getMaintenanceById,
  createMaintenanceTicket,
  updateMaintenanceTicket,
  deleteMaintenanceTicket,
};
