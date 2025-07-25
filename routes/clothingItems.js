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

const { validateCardBody, validateId } = require("../middlewares/validation");

router.get("/", getItems);

router.post("/", auth, validateCardBody, createItem);

router.put("/:itemId", auth, validateId, updateItem);

router.delete("/:itemId", auth, validateId, deleteItem);

router.put("/:itemId/likes", auth, validateId, likeItem);

router.delete("/:itemId/likes", auth, validateId, unlikeItem);

module.exports = router;
