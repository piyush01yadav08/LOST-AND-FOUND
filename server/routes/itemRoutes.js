const express = require("express");

const {
  createItem,
  getItems,
  getItemById,
  getMyReports,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getItems);

// Protected
router.get("/my-reports", protect, getMyReports);
router.post("/", protect, createItem);
router.put("/:id", protect, updateItem);
router.delete("/:id", protect, deleteItem);

// Public single item
router.get("/:id", getItemById);

module.exports = router;