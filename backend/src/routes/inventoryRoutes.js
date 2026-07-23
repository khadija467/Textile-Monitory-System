const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/rbacMiddleware");

router.use(authenticate);
router.use(authorize("ADMIN")); // Inventory is admin-only per spec

router.get("/alerts/low-stock", inventoryController.getLowStockAlerts);
router.get("/", inventoryController.getInventory);
router.get("/:id", inventoryController.getInventoryById);
router.post("/", inventoryController.createInventoryItem);
router.put("/:id", inventoryController.updateInventoryItem);
router.delete("/:id", inventoryController.deleteInventoryItem);

module.exports = router;
