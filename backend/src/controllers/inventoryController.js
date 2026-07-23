const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/apiResponse");
const logAudit = require("../utils/auditLogger");

/**
 * GET /api/inventory
 */
const getInventory = asyncHandler(async (req, res) => {
  const { search, category, lowStock, page = 1, limit = 10 } = req.query;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { itemName: { contains: search, mode: "insensitive" } },
              { itemCode: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      category ? { category } : {},
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  let items = await prisma.inventory.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  if (lowStock === "true") {
    items = items.filter((i) => i.quantity <= i.minimumStock);
  }

  const total = items.length;
  const paged = items.slice(skip, skip + Number(limit));

  return success(res, 200, "Inventory fetched", paged, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * GET /api/inventory/:id
 */
const getInventoryById = asyncHandler(async (req, res) => {
  const item = await prisma.inventory.findUnique({
    where: { id: req.params.id },
    include: { stockHistory: { orderBy: { createdAt: "desc" }, take: 50 } },
  });
  if (!item) throw new ApiError(404, "Inventory item not found.");
  return success(res, 200, "Inventory item fetched", item);
});

/**
 * POST /api/inventory
 */
const createInventoryItem = asyncHandler(async (req, res) => {
  const { itemName, itemCode, category, quantity, minimumStock, unit, supplier, unitPrice, location } = req.body;

  if (!itemName || !itemCode || !category) {
    throw new ApiError(400, "itemName, itemCode, and category are required.");
  }

  const item = await prisma.inventory.create({
    data: {
      itemName,
      itemCode,
      category,
      quantity: quantity ?? 0,
      minimumStock: minimumStock ?? 10,
      unit: unit || "pcs",
      supplier,
      unitPrice: unitPrice ?? 0,
      location,
    },
  });

  if (item.quantity > 0) {
    await prisma.stockHistory.create({
      data: { inventoryId: item.id, changeType: "IN", quantity: item.quantity, reason: "Initial stock" },
    });
  }

  await logAudit({
    userId: req.user.id,
    action: "CREATE",
    entity: "Inventory",
    entityId: item.id,
    details: `Created inventory item ${item.itemCode}`,
    ipAddress: req.ip,
  });

  return success(res, 201, "Inventory item created successfully", item);
});

/**
 * PUT /api/inventory/:id
 */
const updateInventoryItem = asyncHandler(async (req, res) => {
  const existing = await prisma.inventory.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Inventory item not found.");

  const payload = { ...req.body };
  delete payload.id;

  const item = await prisma.inventory.update({
    where: { id: req.params.id },
    data: payload,
  });

  if (payload.quantity !== undefined && payload.quantity !== existing.quantity) {
    const diff = payload.quantity - existing.quantity;
    await prisma.stockHistory.create({
      data: {
        inventoryId: item.id,
        changeType: diff > 0 ? "IN" : "OUT",
        quantity: Math.abs(diff),
        reason: "Manual adjustment",
      },
    });
  }

  await logAudit({
    userId: req.user.id,
    action: "UPDATE",
    entity: "Inventory",
    entityId: item.id,
    details: `Updated inventory item ${item.itemCode}`,
    ipAddress: req.ip,
  });

  return success(res, 200, "Inventory item updated successfully", item);
});

/**
 * DELETE /api/inventory/:id
 */
const deleteInventoryItem = asyncHandler(async (req, res) => {
  const existing = await prisma.inventory.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Inventory item not found.");

  await prisma.inventory.delete({ where: { id: req.params.id } });

  await logAudit({
    userId: req.user.id,
    action: "DELETE",
    entity: "Inventory",
    entityId: req.params.id,
    details: `Deleted inventory item ${existing.itemCode}`,
    ipAddress: req.ip,
  });

  return success(res, 200, "Inventory item deleted successfully");
});

/**
 * GET /api/inventory/alerts/low-stock
 */
const getLowStockAlerts = asyncHandler(async (req, res) => {
  const items = await prisma.inventory.findMany();
  const lowStockItems = items.filter((i) => i.quantity <= i.minimumStock);
  return success(res, 200, "Low stock alerts fetched", lowStockItems);
});

module.exports = {
  getInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockAlerts,
};
