const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} = require("../errors");

function handleMongooseError(err, next) {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return next(new BadRequestError(messages));
  }
  if (err.name === "CastError") {
    return next(new BadRequestError("Invalid ID format"));
  }
  return next(err);
}

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  // ✅ Vérifier que tous les champs obligatoires sont présents
  if (!name || !email || !password || !avatar) {
    return next(
      new BadRequestError(
        "All fields (name, avatar, email, password) are required"
      )
    );
  }

  //  Hasher le mot de passe
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
      res.status(201).send(userWithoutPassword);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError("Email already exists"));
      }
      return handleMongooseError(err, next);
    });
};

// Get a user by ID
const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  return User.findById(userId)
    .orFail(() => new NotFoundError("User not found"))
    .then((user) => res.send(user))
    .catch((err) => handleMongooseError(err, next));
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  // Validation simple des champs obligatoires
  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
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
        return next(new UnauthorizedError("Incorrect email or password"));
      }
      return next(err);
    });
};

const updateUserProfile = (req, res, next) => {
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
    .orFail(() => new NotFoundError("User not found"))
    .then((user) => res.send(user))
    .catch((err) => handleMongooseError(err, next));
};

module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateUserProfile,
};
