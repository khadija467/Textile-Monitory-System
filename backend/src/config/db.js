const { PrismaClient } = require("@prisma/client");

// Reuse a single Prisma client instance across the app (avoids
// exhausting DB connections during development hot-reloads).
const prisma = global.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

module.exports = prisma;
