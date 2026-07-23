const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/machines", require("./machineRoutes"));
router.use("/workers", require("./workerRoutes"));
router.use("/attendance", require("./attendanceRoutes"));
router.use("/maintenance", require("./maintenanceRoutes"));
router.use("/inventory", require("./inventoryRoutes"));
router.use("/production", require("./productionRoutes"));
router.use("/notifications", require("./notificationRoutes"));
router.use("/reports", require("./reportRoutes"));
router.use("/dashboard", require("./dashboardRoutes"));

module.exports = router;
