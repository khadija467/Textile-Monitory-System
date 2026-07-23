const express = require("express");
const router = express.Router();
const productionController = require("../controllers/productionController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/rbacMiddleware");

router.use(authenticate);

router.get("/analytics", authorize("ADMIN"), productionController.getProductionAnalytics);
router.get("/department-performance", authorize("ADMIN"), productionController.getDepartmentPerformance);
router.get("/", authorize("ADMIN"), productionController.getProduction);
router.post("/", authorize("ADMIN"), productionController.createProduction);
router.put("/:id", authorize("ADMIN"), productionController.updateProduction);
router.delete("/:id", authorize("ADMIN"), productionController.deleteProduction);

module.exports = router;
