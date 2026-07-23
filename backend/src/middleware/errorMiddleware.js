const ApiError = require("../utils/ApiError");

/**
 * Catches all errors forwarded via next(err) (including from
 * asyncHandler) and formats a consistent JSON error response.
 * Must be registered last, after all routes.
 */
function errorMiddleware(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || null;

  // Prisma unique constraint violation
  if (err.code === "P2002") {
    statusCode = 409;
    message = `A record with this ${err.meta?.target?.join(", ") || "value"} already exists.`;
  }

  // Prisma "record not found" on update/delete
  if (err.code === "P2025") {
    statusCode = 404;
    message = "The requested record was not found.";
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
}

function notFoundMiddleware(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { errorMiddleware, notFoundMiddleware };
