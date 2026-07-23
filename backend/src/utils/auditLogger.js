const prisma = require("../config/db");

/**
 * Fire-and-forget audit log entry. Failures here must never break
 * the primary request, so errors are swallowed after logging.
 */
async function logAudit({ userId, action, entity, entityId, details, ipAddress }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId ? String(entityId) : null,
        details: details ? String(details) : null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
}

module.exports = logAudit;
