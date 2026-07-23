const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const config = require("../config/env");
const prisma = require("../config/db");

/**
 * Verifies the Bearer access token on the request, attaches the
 * authenticated user (minus password) to req.user, and rejects
 * requests with missing, malformed, or expired tokens.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "No access token provided. Please log in.");
  }

  const token = header.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.accessSecret);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Session expired. Please log in again.");
    }
    throw new ApiError(401, "Invalid access token.");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, "Account not found or has been deactivated.");
  }

  req.user = user;
  next();
});

module.exports = authenticate;
