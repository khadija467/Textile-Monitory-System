const express = require("express");
const router = express.Router();
const machineController = require("../controllers/machineController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/rbacMiddleware");

router.use(authenticate);

router.get("/stats/summary", authorize("ADMIN"), machineController.getMachineStats);
router.get("/", machineController.getMachines); // Admin sees all, worker sees assigned
router.get("/:id", machineController.getMachineById);
router.post("/", authorize("ADMIN"), machineController.createMachine);
router.put("/:id", authorize("ADMIN"), machineController.updateMachine);
router.delete("/:id", authorize("ADMIN"), machineController.deleteMachine);

module.exports = router;
