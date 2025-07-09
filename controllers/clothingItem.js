const mongoose = require("mongoose");
const ClothingItem = require("../models/clothingItem");

const {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  FORBIDDEN,
  UNAUTHORIZED,
  NOT_FOUND_MESSAGE,
  SERVER_ERROR_MESSAGE,
} = require("../utils/errors");

// Créer un vêtement
const createItem = (req, res) => {
  if (!req.user || !req.user._id) {
    return res
      .status(UNAUTHORIZED)
      .json({ message: "Unauthorized: no user found in request" });
  }

  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  return ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).json(item))
    .catch((err) => {
      console.error("CreateItem Error:", err);
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(
          (error) => error.message
        );
        return res.status(BAD_REQUEST).json({ message: messages.join(", ") });
      }
      return res.status(SERVER_ERROR).json({ message: SERVER_ERROR_MESSAGE });
    });
};

// Obtenir tous les vêtements
const getItems = (req, res) =>
  ClothingItem.find({})
    .populate("owner likes")
    .then((items) => res.json(items))
    .catch(() =>
      res.status(SERVER_ERROR).json({ message: SERVER_ERROR_MESSAGE })
    );

// Mettre à jour l’image d’un vêtement
const updateItem = (req, res) => {
  const { itemId } = req.params;
  const { imageUrl } = req.body;

  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $set: { imageUrl } },
    { new: true, runValidators: true }
  )
    .orFail(() => {
      const error = new Error(NOT_FOUND_MESSAGE);
      error.name = "DocumentNotFoundError";
      throw error;
    })
    .then((item) => res.json(item))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: NOT_FOUND_MESSAGE });
      }
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(
          (error) => error.message
        );
        return res.status(BAD_REQUEST).json({ message: messages.join(", ") });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Invalid item ID." });
      }
      return res.status(SERVER_ERROR).json({ message: SERVER_ERROR_MESSAGE });
    });
};

// Supprimer un vêtement
const deleteItem = (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST).json({ message: "Invalid item ID." });
  }

  return ClothingItem.findById(itemId)
    .orFail(() => {
      const err = new Error("Item not found");
      err.name = "DocumentNotFoundError";
      throw err;
    })
    .then((item) => {
      if (item.owner.toString() !== userId) {
        return res
          .status(FORBIDDEN)
          .json({ message: "Forbidden: Not the owner" });
      }
      return item.deleteOne().then(() => res.json({ message: "Item deleted" }));
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: "Item not found" });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Invalid item ID" });
      }
      return res
        .status(SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    });
};

// Ajouter un like
const likeItem = (req, res) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST).json({ message: "Invalid item ID." });
  }

  return ClothingItem.findById(itemId)
    .orFail(() => {
      const error = new Error(NOT_FOUND_MESSAGE);
      error.name = "DocumentNotFoundError";
      throw error;
    })
    .then((item) => {
      if (!item.likes.includes(req.user._id)) {
        item.likes.push(req.user._id);
      }
      return item
        .save()
        .then((savedItem) =>
          savedItem
            .populate("owner likes")
            .then((populatedItem) => res.json(populatedItem))
        );
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({ message: err.message });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: NOT_FOUND_MESSAGE });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Invalid item ID." });
      }
      return res.status(SERVER_ERROR).json({ message: SERVER_ERROR_MESSAGE });
    });
};

// Retirer un like
const unlikeItem = (req, res) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(BAD_REQUEST).json({ message: "Invalid item ID." });
  }

  return ClothingItem.findById(itemId)
    .orFail(() => {
      const error = new Error(NOT_FOUND_MESSAGE);
      error.name = "DocumentNotFoundError";
      throw error;
    })
    .then((item) => {
      item.likes.pull(req.user._id);
      return item
        .save()
        .then((savedItem) =>
          savedItem
            .populate("owner likes")
            .then((populatedItem) => res.json(populatedItem))
        );
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({ message: err.message });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: NOT_FOUND_MESSAGE });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Invalid item ID." });
      }
      return res.status(SERVER_ERROR).json({ message: SERVER_ERROR_MESSAGE });
    });
};

module.exports = {
  createItem,
  getItems,
  updateItem,
  deleteItem,
  likeItem,
  unlikeItem,
};
