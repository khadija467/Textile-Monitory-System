module.exports = {
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_me",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
    refreshExpiryRememberMe: "30d",
  },
  roles: {
    ADMIN: "ADMIN",
    WORKER: "WORKER",
    TECHNICIAN: "TECHNICIAN",
  },
  bcryptSaltRounds: 10,
};
