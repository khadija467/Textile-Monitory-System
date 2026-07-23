const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/rbacMiddleware");

router.use(authenticate);

router.get("/", authorize("ADMIN", "TECHNICIAN"), maintenanceController.getMaintenanceTickets);
router.get("/:id", authorize("ADMIN", "TECHNICIAN"), maintenanceController.getMaintenanceById);
router.post("/", authorize("ADMIN"), maintenanceController.createMaintenanceTicket);
router.put("/:id", authorize("ADMIN", "TECHNICIAN"), maintenanceController.updateMaintenanceTicket);
router.delete("/:id", authorize("ADMIN"), maintenanceController.deleteMaintenanceTicket);

module.exports = router;
