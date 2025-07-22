const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  handleTransfer,
  getFavorites,
  addFavorite,
  removeFavorite,
  searchRecipients,
  verifyRecipient,
} = require("../controllers/TransferController");

router.get("/favorites", authMiddleware, getFavorites);
router.post("/favorites/add", authMiddleware, addFavorite);
router.post("/favorites/remove", authMiddleware, removeFavorite);
router.get("/search-recipients", authMiddleware, searchRecipients);
router.post("/verify-recipient", authMiddleware, verifyRecipient);
router.post("/initiate", authMiddleware, handleTransfer);

module.exports = router;
