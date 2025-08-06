const mongoose = require("mongoose");
const ClothingItem = require("../models/clothingItem");

const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} = require("../errors");

function handleMongooseError(err, next) {
  if (err.name === "ValidationError") {
    return next(new BadRequestError(err.message));
  }
  if (err.name === "CastError") {
    return next(new BadRequestError("Invalid item ID."));
  }

  return next(err);
}

// Créer un vêtement
const createItem = (req, res, next) => {
  if (!req.user || !req.user._id) {
    return next(
      new UnauthorizedError("Unauthorized: no user found in request")
    );
  }

  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  return ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).json(item))
    .catch((err) => handleMongooseError(err, next));
};

// Obtenir tous les vêtements
const getItems = (req, res, next) =>
  ClothingItem.find({})
    .populate("owner likes")
    .then((items) => res.json(items))
    .catch(next);

// Mettre à jour l’image d’un vêtement
const updateItem = (req, res, next) => {
  const { itemId } = req.params;
  const { imageUrl } = req.body;

  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $set: { imageUrl } },
    { new: true, runValidators: true }
  )
    .orFail(() => new NotFoundError("Item not found"))
    .then((item) => res.json(item))
    .catch((err) => handleMongooseError(err, next));
};

// Supprimer un vêtement
const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new BadRequestError("Invalid item ID."));
  }

  return ClothingItem.findById(itemId)
    .orFail(() => new NotFoundError("Item not found"))
    .then((item) => {
      if (item.owner.toString() !== userId) {
        return next(new ForbiddenError("Forbidden: Not the owner"));
      }
      return item.deleteOne().then(() => res.json({ message: "Item deleted" }));
    })
    .catch((err) => handleMongooseError(err, next));
};

// Ajouter un like
const likeItem = (req, res, next) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new BadRequestError("Invalid item ID."));
  }

  return ClothingItem.findById(itemId)
    .orFail(() => new NotFoundError("Item not found"))
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
    .catch((err) => handleMongooseError(err, next));
};

// Retirer un like
const unlikeItem = (req, res, next) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return next(new BadRequestError("Invalid item ID."));
  }

  return ClothingItem.findById(itemId)
    .orFail(() => new NotFoundError("Item not found"))
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
    .catch((err) => handleMongooseError(err, next));
};

module.exports = {
  createItem,
  getItems,
  updateItem,
  deleteItem,
  likeItem,
  unlikeItem,
};
