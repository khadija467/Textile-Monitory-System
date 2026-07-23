const ApiError = require("../utils/ApiError");

/**
 * Restricts a route to a set of allowed roles. Must run after
 * authenticate() so req.user is populated.
 *
 * Usage: router.delete("/:id", authenticate, authorize("ADMIN"), handler)
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required.");
  }

  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(
      403,
      "You don't have permission to perform this action."
    );
  }

  next();
};

module.exports = authorize;
