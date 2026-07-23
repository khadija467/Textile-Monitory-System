const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/apiResponse");

/**
 * GET /api/attendance
 * Admin: all records (filterable). Worker: own records only.
 */
const getAttendance = asyncHandler(async (req, res) => {
  const { workerId, date, status, page = 1, limit = 20 } = req.query;

  const where = {
    AND: [
      req.user.role === "WORKER" ? { workerId: req.user.id } : workerId ? { workerId } : {},
      date
        ? {
            date: {
              gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
              lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
            },
          }
        : {},
      status ? { status } : {},
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { date: "desc" },
      include: { worker: { select: { id: true, name: true, department: true } } },
    }),
    prisma.attendance.count({ where }),
  ]);

  return success(res, 200, "Attendance fetched", records, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * POST /api/attendance/checkin
 */
const checkIn = asyncHandler(async (req, res) => {
  const workerId = req.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findUnique({
    where: { workerId_date: { workerId, date: today } },
  });

  if (existing && existing.checkIn) {
    throw new ApiError(409, "You have already checked in today.");
  }

  const record = existing
    ? await prisma.attendance.update({
        where: { id: existing.id },
        data: { checkIn: new Date(), status: "PRESENT" },
      })
    : await prisma.attendance.create({
        data: { workerId, date: today, checkIn: new Date(), status: "PRESENT" },
      });

  return success(res, 200, "Checked in successfully", record);
});

/**
 * POST /api/attendance/checkout
 */
const checkOut = asyncHandler(async (req, res) => {
  const workerId = req.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findUnique({
    where: { workerId_date: { workerId, date: today } },
  });

  if (!existing || !existing.checkIn) {
    throw new ApiError(400, "You must check in before checking out.");
  }

  if (existing.checkOut) {
    throw new ApiError(409, "You have already checked out today.");
  }

  const record = await prisma.attendance.update({
    where: { id: existing.id },
    data: { checkOut: new Date() },
  });

  return success(res, 200, "Checked out successfully", record);
});

/**
 * PUT /api/attendance/:id (admin manual correction)
 */
const updateAttendance = asyncHandler(async (req, res) => {
  const existing = await prisma.attendance.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Attendance record not found.");

  const record = await prisma.attendance.update({
    where: { id: req.params.id },
    data: req.body,
  });

  return success(res, 200, "Attendance updated successfully", record);
});

module.exports = { getAttendance, checkIn, checkOut, updateAttendance };
