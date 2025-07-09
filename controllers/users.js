const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  CONFLICT,
  UNAUTHORIZED,
  NOT_FOUND_MESSAGE,
  SERVER_ERROR_MESSAGE,
} = require("../utils/errors");

// Create a new user
// const createUser = (req, res) => {
//   const { name, avatar, email, password } = req.body;

//   console.log("📥 Received signup data:", { name, avatar, email, password });
//   // Hash the password before saving

//   return bcrypt
//     .hash(password, 10)
//     .then((hashedPassword) =>

//       User.create({
//         name,
//         avatar,
//         email,
//         password: hashedPassword,
//       })
//     )
//     .then((user) => {
//       // Never send the password back in response
//       const userWithoutPassword = user.toObject();
//       delete userWithoutPassword.password;
//       res.status(201).send(userWithoutPassword);
//     })
//     .catch((err) => {
//       if (err.code === 11000) {
//         // Duplicate email error
//         return res.status(CONFLICT).send({ message: "Email already exists" });
//       }
//       if (err.name === "ValidationError") {
//         const messages = Object.values(err.errors).map(
//           (error) => error.message
//         );
//         return res.status(BAD_REQUEST).send({ message: messages.join(", ") });
//       }
//       return res.status(SERVER_ERROR).send({ message: SERVER_ERROR_MESSAGE });
//     });
// };

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  console.log("📦 req.body = ", req.body);

  // ✅ Vérifier que tous les champs obligatoires sont présents
  if (!name || !email || !password || !avatar) {
    return res.status(BAD_REQUEST).send({
      message: "All fields (name, avatar, email, password) are required",
    });
  }

  // 🔒 Hasher le mot de passe
  return bcrypt
    .hash(password, 10)
    .then((hashedPassword) =>
      User.create({
        name,
        avatar,
        email,
        password: hashedPassword,
      })
    )
    .then((user) => {
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;
      console.log("✅ User created:", userWithoutPassword);
      res.status(201).send(userWithoutPassword);
    })
    .catch((err) => {
      console.error("❌ Error during user creation:", err);

      if (err.code === 11000) {
        return res.status(CONFLICT).send({ message: "Email already exists" });
      }
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(
          (error) => error.message
        );
        return res.status(BAD_REQUEST).send({ message: messages.join(", ") });
      }
      return res.status(SERVER_ERROR).send({ message: SERVER_ERROR_MESSAGE });
    });
};

// Get a user by ID
const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  return User.findById(userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: NOT_FOUND_MESSAGE });
      }
      return res.status(SERVER_ERROR).send({ message: SERVER_ERROR_MESSAGE });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  // Validation simple des champs obligatoires
  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Email and password are required" });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      if (err.message === "Incorrect email or password") {
        return res
          .status(UNAUTHORIZED)
          .send({ message: "Incorrect email or password" });
      }

      return res.status(SERVER_ERROR).send({ message: SERVER_ERROR_MESSAGE });
    });
};

const updateUserProfile = (req, res) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(BAD_REQUEST).send({ message: messages.join(", ") });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: NOT_FOUND_MESSAGE });
      }
      return res.status(SERVER_ERROR).send({ message: SERVER_ERROR_MESSAGE });
    });
};

module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateUserProfile,
};
