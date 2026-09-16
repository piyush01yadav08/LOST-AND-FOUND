const express = require("express");

const {
  createClaim,
  getMyClaims,
  getItemClaims,
  updateClaimStatus,
} = require("../controllers/claimController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Submit a claim
router.post("/", protect, createClaim);

// Get claims submitted by logged-in user
router.get("/my", protect, getMyClaims);

// Get claims for an item reported by logged-in user
router.get("/item/:itemId", protect, getItemClaims);

// Approve or reject a claim
router.put("/:id", protect, updateClaimStatus);

module.exports = router;