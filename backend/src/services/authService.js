const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const config = require("../config/env");
const prisma = require("../config/db");

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry }
  );
}

function generateRefreshTokenValue() {
  return crypto.randomBytes(40).toString("hex");
}

async function createRefreshToken(userId, rememberMe = false) {
  const token = generateRefreshTokenValue();
  const days = rememberMe ? 30 : 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

async function rotateRefreshToken(oldToken) {
  const existing = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
    include: { user: true },
  });

  if (!existing || existing.expiresAt < new Date()) {
    return null;
  }

  await prisma.refreshToken.delete({ where: { id: existing.id } });
  const newToken = await createRefreshToken(existing.userId);

  return { user: existing.user, refreshToken: newToken };
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, config.bcryptSaltRounds);
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

module.exports = {
  generateAccessToken,
  createRefreshToken,
  rotateRefreshToken,
  hashPassword,
  comparePassword,
  sanitizeUser,
};
