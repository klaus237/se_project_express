const router = require("express").Router();
const auth = require("../middlewares/auth");

const {
  createItem,
  getItems,
  updateItem,
  deleteItem,
  likeItem,
  unlikeItem,
} = require("../controllers/clothingItem");

router.get("/", getItems);

router.post("/", auth, createItem);

router.put("/:itemId", auth, updateItem);

router.delete("/:itemId", auth, deleteItem);

router.put("/:itemId/likes", auth, likeItem);

router.delete("/:itemId/likes", auth, unlikeItem);

module.exports = router;
