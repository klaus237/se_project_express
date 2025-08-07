const { NODE_ENV, JWT_SECRET_DEV, JWT_SECRET_PROD, PORT = 3001 } = process.env;

let JWT_SECRET;

if (NODE_ENV === "production") {
  if (!JWT_SECRET_PROD) {
    throw new Error("JWT_SECRET_PROD must be set in production");
  }
  JWT_SECRET = JWT_SECRET_PROD;
} else {
  JWT_SECRET = JWT_SECRET_DEV || "default-dev-secret";
}

module.exports = {
  JWT_SECRET,
  PORT,
};
