const router = require("express").Router();

const userRouter = require("./users");

const clothingRouter = require("./clothingItems");

const { login, createUser } = require("../controllers/users");

const { NOT_FOUND, NOT_FOUND_MESSAGE } = require("../utils/errors");

const {
  validateUserBody,
  validateLogin,
} = require("../middlewares/validation");

// Auth routes
router.post("/signin", validateLogin, login);
router.post("/signup", validateUserBody, createUser);

// Main routes
router.use("/users", userRouter);
router.use("/items", clothingRouter);

// Catch-all for undefined routes
router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: NOT_FOUND_MESSAGE });
});

module.exports = router;
