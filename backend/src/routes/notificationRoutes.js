const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/rbacMiddleware");

router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.post("/", authorize("ADMIN"), notificationController.createNotification);
router.put("/read-all", notificationController.markAllAsRead);
router.put("/:id/read", notificationController.markAsRead);
router.delete("/:id", authorize("ADMIN"), notificationController.deleteNotification);

module.exports = router;
