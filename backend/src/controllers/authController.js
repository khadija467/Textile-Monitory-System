const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/apiResponse");
const authService = require("../services/authService");
const logAudit = require("../utils/auditLogger");

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isMatch = await authService.comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const accessToken = authService.generateAccessToken(user);
  const refreshToken = await authService.createRefreshToken(user.id, !!rememberMe);

  await logAudit({
    userId: user.id,
    action: "LOGIN",
    entity: "User",
    entityId: user.id,
    ipAddress: req.ip,
  });

  return success(res, 200, "Logged in successfully", {
    user: authService.sanitizeUser(user),
    accessToken,
    refreshToken,
  });
});

/**
 * POST /api/auth/register
 * Admin-only in production use, but left open here per spec.
 * In a real deployment, wrap this with authenticate + authorize("ADMIN").
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, phone } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "A user with this email already exists.");
  }

  const hashed = await authService.hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role || "WORKER",
      department: department || null,
      phone: phone || null,
    },
  });

  await logAudit({
    userId: req.user?.id || user.id,
    action: "REGISTER",
    entity: "User",
    entityId: user.id,
    ipAddress: req.ip,
  });

  return success(res, 201, "User registered successfully", {
    user: authService.sanitizeUser(user),
  });
});

/**
 * POST /api/auth/refresh
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required.");
  }

  const result = await authService.rotateRefreshToken(refreshToken);
  if (!result) {
    throw new ApiError(401, "Refresh token is invalid or expired.");
  }

  const accessToken = authService.generateAccessToken(result.user);

  return success(res, 200, "Token refreshed", {
    accessToken,
    refreshToken: result.refreshToken,
  });
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  return success(res, 200, "Logged out successfully");
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  return success(res, 200, "Current user fetched", { user: req.user });
});

module.exports = { login, register, refresh, logout, getMe };
