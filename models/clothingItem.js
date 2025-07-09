const mongoose = require("mongoose");
const validator = require("validator");

const clothingItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "The name field is required"],
    minlength: [2, "The name must be at least 2 characters"],
    maxlength: [30, "The name must be at most 30 characters"],
  },
  weather: {
    type: String,
    required: [true, "The weather field is required"],
    enum: {
      values: ["hot", "warm", "cold"],
      message: "Weather must be one of: hot, warm, or cold",
    },
  },
  imageUrl: {
    type: String,
    required: [true, "The imageUrl field is required"],
    validate: {
      validator: (v) => validator.isURL(v),
      message: "Image URL is not valid",
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [true, "Owner is required"],
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: [],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("clothingItem", clothingItemSchema);
