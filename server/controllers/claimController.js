const Claim = require("../models/Claim");
const Item = require("../models/Item");

// Create Claim
const createClaim = async (req, res) => {
  try {
    const { itemId, message } = req.body;

    if (!itemId || !message) {
      return res.status(400).json({
        message: "Item ID and claim message are required",
      });
    }

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (item.type !== "Found") {
      return res.status(400).json({
        message: "Only found items can be claimed",
      });
    }

    if (item.status !== "Active") {
      return res.status(400).json({
        message: "This item is no longer available for claiming",
      });
    }

    if (item.reportedBy.toString() === req.user.toString()) {
      return res.status(400).json({
        message: "You cannot claim your own item",
      });
    }

    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user,
      status: "Pending",
    });

    if (existingClaim) {
      return res.status(400).json({
        message: "You already have a pending claim for this item",
      });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user,
      message,
    });

    const populatedClaim = await Claim.findById(claim._id)
      .populate("claimant", "name email")
      .populate("item", "title type status");

    res.status(201).json({
      message: "Claim request submitted successfully",
      claim: populatedClaim,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get claims submitted by current user
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({
      claimant: req.user,
    })
      .populate("item", "title type location status")
      .sort({ createdAt: -1 });

    res.json({
      count: claims.length,
      claims,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get claims for an item reported by current user
const getItemClaims = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (item.reportedBy.toString() !== req.user.toString()) {
      return res.status(403).json({
        message: "You can only view claims for your own reports",
      });
    }

    const claims = await Claim.find({
      item: req.params.itemId,
    })
      .populate("claimant", "name email")
      .populate("item", "title type status")
      .sort({ createdAt: -1 });

    res.json({
      count: claims.length,
      claims,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Approve or Reject Claim
const updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected",
      });
    }

    const claim = await Claim.findById(req.params.id).populate("item");

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    if (
      claim.item.reportedBy.toString() !== req.user.toString()
    ) {
      return res.status(403).json({
        message: "Only the item reporter can approve or reject claims",
      });
    }

    if (claim.status !== "Pending") {
      return res.status(400).json({
        message: "This claim has already been processed",
      });
    }

    claim.status = status;
    await claim.save();

    // If approved, mark item as claimed
    if (status === "Approved") {
      claim.item.status = "Claimed";
      await claim.item.save();

      // Reject other pending claims for the same item
      await Claim.updateMany(
        {
          item: claim.item._id,
          _id: { $ne: claim._id },
          status: "Pending",
        },
        {
          $set: { status: "Rejected" },
        }
      );
    }

    const updatedClaim = await Claim.findById(claim._id)
      .populate("claimant", "name email")
      .populate("item", "title type status");

    res.json({
      message: `Claim ${status.toLowerCase()} successfully`,
      claim: updatedClaim,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getItemClaims,
  updateClaimStatus,
};