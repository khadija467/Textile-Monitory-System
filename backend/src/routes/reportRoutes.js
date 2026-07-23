const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/rbacMiddleware");

router.use(authenticate);
router.use(authorize("ADMIN")); // Reports module is admin-only per spec

router.get("/machines", reportController.getMachineReport);
router.get("/production", reportController.getProductionReport);
router.get("/maintenance", reportController.getMaintenanceReport);
router.get("/attendance", reportController.getAttendanceReport);
router.get("/export/excel", reportController.exportExcel);
router.get("/export/pdf", reportController.exportPDF);

module.exports = router;
