const Item = require("../models/Item");
const Claim = require("../models/Claim");

const getDashboardStats = async (req, res) => {
  try {
    const totalLostItems = await Item.countDocuments({
      type: "Lost",
    });

    const totalFoundItems = await Item.countDocuments({
      type: "Found",
    });

    const claimedItems = await Item.countDocuments({
      status: "Claimed",
    });

    const resolvedItems = await Item.countDocuments({
      status: "Resolved",
    });

    const activeReports = await Item.countDocuments({
      status: "Active",
    });

    const pendingClaims = await Claim.countDocuments({
      status: "Pending",
    });

    res.json({
      totalLostItems,
      totalFoundItems,
      claimedItems,
      resolvedItems,
      activeReports,
      pendingClaims,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};