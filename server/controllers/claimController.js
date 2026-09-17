const Claim = require("../models/Claim");
const Item = require("../models/Item");
const Notification = require("../models/Notification");


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

    // Only Found items can be claimed
    if (item.type !== "Found") {
      return res.status(400).json({
        message: "Only found items can be claimed",
      });
    }

    // Only active items can be claimed
    if (item.status !== "Active") {
      return res.status(400).json({
        message: "This item is no longer available for claiming",
      });
    }

    // Prevent reporter from claiming their own item
    if (item.reportedBy.toString() === req.user.toString()) {
      return res.status(400).json({
        message: "You cannot claim your own item",
      });
    }

    // Prevent duplicate pending claims
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

    // Create claim
    const claim = await Claim.create({
      item: itemId,
      claimant: req.user,
      message,
    });

    // Notify item reporter
    await Notification.create({
      user: item.reportedBy,
      type: "CLAIM",
      title: "New Claim Request",
      message: `Someone has submitted a claim for your item "${item.title}".`,
      item: item._id,
      claim: claim._id,
    });

    res.status(201).json({
      message: "Claim submitted successfully",
      claim,
    });
  } catch (error) {
    console.error("Create claim error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Get My Claims


const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({
      claimant: req.user,
    })
      .populate("item")
      .sort({ createdAt: -1 });

    res.json({
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.error("Get my claims error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// Get Claims For Item
// ======================================================

const getClaimsForItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Only item reporter can view claims
    if (item.reportedBy.toString() !== req.user.toString()) {
      return res.status(403).json({
        message: "You can only view claims for your own items",
      });
    }

    const claims = await Claim.find({
      item: req.params.itemId,
    })
      .populate("claimant", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.error("Get item claims error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// Approve / Reject Claim
// ======================================================

const updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected",
      });
    }

    const claim = await Claim.findById(req.params.id)
      .populate("item")
      .populate("claimant", "name email");

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    const item = claim.item;

    // Only item reporter can approve/reject
    if (item.reportedBy.toString() !== req.user.toString()) {
      return res.status(403).json({
        message: "Only the item reporter can update this claim",
      });
    }

    // Prevent changing an already processed claim
    if (claim.status !== "Pending") {
      return res.status(400).json({
        message: `This claim has already been ${claim.status.toLowerCase()}`,
      });
    }

   
    // APPROVE CLAIM
    

    if (status === "Approved") {
      claim.status = "Approved";
      await claim.save();

      // Mark item as claimed
      item.status = "Claimed";
      await item.save();

      // Notify claimant
      await Notification.create({
        user: claim.claimant._id,
        type: "CLAIM_APPROVED",
        title: "Claim Approved",
        message: `Your claim for "${item.title}" has been approved.`,
        item: item._id,
        claim: claim._id,
      });

      // Reject all other pending claims for this item
      const otherClaims = await Claim.find({
        item: item._id,
        _id: { $ne: claim._id },
        status: "Pending",
      });

      for (const otherClaim of otherClaims) {
        otherClaim.status = "Rejected";
        await otherClaim.save();

        // Notify rejected claimant
        await Notification.create({
          user: otherClaim.claimant,
          type: "CLAIM_REJECTED",
          title: "Claim Rejected",
          message: `Your claim for "${item.title}" was not approved because another claim was accepted.`,
          item: item._id,
          claim: otherClaim._id,
        });
      }

      return res.json({
        message: "Claim approved successfully",
        claim,
        item,
      });
    }

   
    // REJECT CLAIM
    

    claim.status = "Rejected";
    await claim.save();

    // Notify claimant
    await Notification.create({
      user: claim.claimant._id,
      type: "CLAIM_REJECTED",
      title: "Claim Rejected",
      message: `Your claim for "${item.title}" has been rejected.`,
      item: item._id,
      claim: claim._id,
    });

    res.json({
      message: "Claim rejected successfully",
      claim,
    });
  } catch (error) {
    console.error("Update claim status error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getClaimsForItem,
  updateClaimStatus,
};