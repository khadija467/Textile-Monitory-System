const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/apiResponse");

/**
 * GET /api/notifications
 * Returns notifications addressed to the current user, plus broadcast
 * notifications (userId === null) visible to everyone.
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { isRead, page = 1, limit = 20 } = req.query;

  const where = {
    AND: [
      { OR: [{ userId: req.user.id }, { userId: null }] },
      isRead !== undefined ? { isRead: isRead === "true" } : {},
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { AND: [{ OR: [{ userId: req.user.id }, { userId: null }] }, { isRead: false }] },
    }),
  ]);

  return success(res, 200, "Notifications fetched", notifications, {
    total,
    unreadCount,
    page: Number(page),
    limit: Number(limit),
  });
});

/**
 * POST /api/notifications (admin broadcast or targeted)
 */
const createNotification = asyncHandler(async (req, res) => {
  const { title, message, type, userId, link } = req.body;
  if (!title || !message) throw new ApiError(400, "title and message are required.");

  const notification = await prisma.notification.create({
    data: { title, message, type: type || "INFO", userId: userId || null, link },
  });

  return success(res, 201, "Notification created successfully", notification);
});

/**
 * PUT /api/notifications/:id/read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true },
  });
  return success(res, 200, "Notification marked as read", notification);
});

/**
 * PUT /api/notifications/read-all
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { OR: [{ userId: req.user.id }, { userId: null }] },
    data: { isRead: true },
  });
  return success(res, 200, "All notifications marked as read");
});

/**
 * DELETE /api/notifications/:id
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const existing = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Notification not found.");

  await prisma.notification.delete({ where: { id: req.params.id } });
  return success(res, 200, "Notification deleted successfully");
});

module.exports = { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification };
