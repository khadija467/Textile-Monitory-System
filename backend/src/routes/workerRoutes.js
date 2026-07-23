const express = require("express");
const router = express.Router();
const workerController = require("../controllers/workerController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/rbacMiddleware");

router.use(authenticate);
router.use(authorize("ADMIN")); // All worker-management routes are admin-only

router.get("/", workerController.getWorkers);
router.get("/:id", workerController.getWorkerById);
router.post("/", workerController.createWorker);
router.put("/:id", workerController.updateWorker);
router.delete("/:id", workerController.deleteWorker);
router.put("/:id/assign-machine", workerController.assignMachine);

module.exports = router;
