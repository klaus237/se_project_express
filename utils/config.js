// const JWT_SECRET = "very-secure-secret-key";

// module.exports = { JWT_SECRET };
// config.js
const { JWT_SECRET = "super-strong-secret" } = process.env;

module.exports = { JWT_SECRET };
