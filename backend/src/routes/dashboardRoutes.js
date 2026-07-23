const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/rbacMiddleware");

router.use(authenticate);

router.get("/admin", authorize("ADMIN"), dashboardController.getAdminDashboard);
router.get("/worker", authorize("WORKER", "TECHNICIAN"), dashboardController.getWorkerDashboard);

module.exports = router;
