const Item = require("../models/Item");
const Notification = require("../models/Notification");

// ======================================================
// Create Item + Bidirectional Smart Matching
// ======================================================

const createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      location,
      date,
      image,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !category ||
      !type ||
      !location ||
      !date
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    // Create the new item
    const item = await Item.create({
      title,
      description,
      category,
      type,
      location,
      date,
      image: image || "",
      reportedBy: req.user,
    });

    // ==================================================
    // BIDIRECTIONAL SMART MATCHING
    // ==================================================

    // If the new item is Found:
    // Search existing active Lost reports.
    //
    // If the new item is Lost:
    // Search existing active Found reports.

    const oppositeType =
      type === "Found" ? "Lost" : "Found";

    const matchingItems = await Item.find({
      type: oppositeType,
      status: "Active",
      reportedBy: { $ne: req.user },
      _id: { $ne: item._id },
    });

    // Normalize new item's data
    const newTitle = title.toLowerCase();
    const newDescription = description.toLowerCase();
    const newCategory = category.toLowerCase();
    const newLocation = location.toLowerCase();

    // Check every active opposite-type report
    for (const existingItem of matchingItems) {
      let score = 0;

      // Normalize existing item's data
      const existingTitle =
        existingItem.title.toLowerCase();

      const existingDescription =
        existingItem.description.toLowerCase();

      const existingCategory =
        existingItem.category.toLowerCase();

      const existingLocation =
        existingItem.location.toLowerCase();

      // ----------------------------------------------
      // 1. CATEGORY MATCH
      // Maximum: 25 points
      // ----------------------------------------------

      if (newCategory === existingCategory) {
        score += 25;
      }

      // ----------------------------------------------
      // 2. LOCATION MATCH
      // Maximum: 20 points
      // ----------------------------------------------

      if (
        newLocation.includes(existingLocation) ||
        existingLocation.includes(newLocation)
      ) {
        score += 20;
      }

      // ----------------------------------------------
      // 3. TITLE MATCH
      // Maximum: 40 points
      // ----------------------------------------------

      const titleWords = newTitle
        .split(/\s+/)
        .filter((word) => word.length > 2);

      const matchingTitleWords = titleWords.filter(
        (word) => existingTitle.includes(word)
      );

      if (matchingTitleWords.length > 0) {
        score += Math.min(
          matchingTitleWords.length * 15,
          40
        );
      }

      // ----------------------------------------------
      // 4. DESCRIPTION MATCH
      // Maximum: 15 points
      // ----------------------------------------------

      const descriptionWords = newDescription
        .split(/\s+/)
        .filter((word) => word.length > 3);

      const matchingDescriptionWords =
        descriptionWords.filter((word) =>
          existingDescription.includes(word)
        );

      if (matchingDescriptionWords.length > 0) {
        score += Math.min(
          matchingDescriptionWords.length * 5,
          15
        );
      }

      // ----------------------------------------------
      // 5. DATE PROXIMITY
      // Maximum: 10 points
      // ----------------------------------------------

      const newDate = new Date(date);
      const existingDate = new Date(existingItem.date);

      const differenceInDays =
        Math.abs(newDate - existingDate) /
        (1000 * 60 * 60 * 24);

      if (differenceInDays <= 7) {
        score += 10;
      }

      // Log matching information for debugging
      console.log(
        `Match check: "${existingItem.title}" ↔ "${item.title}" | Score: ${score}`
      );

      // ==================================================
      // MATCH THRESHOLD
      // ==================================================

      if (score >= 45) {
        // ----------------------------------------------
        // Prevent duplicate MATCH notifications
        // ----------------------------------------------

        const existingNotification =
          await Notification.findOne({
            type: "MATCH",
            $or: [
              {
                user: existingItem.reportedBy,
                item: item._id,
              },
              {
                user: req.user,
                item: existingItem._id,
              },
            ],
          });

        if (!existingNotification) {
          // ============================================
          // NOTIFICATION FOR EXISTING REPORT OWNER
          // ============================================

          if (type === "Found") {
            // New Found → Existing Lost
            await Notification.create({
              user: existingItem.reportedBy,
              type: "MATCH",
              title: "Possible Item Match Found",
              message: `A found item may match your lost item "${existingItem.title}".`,
              item: item._id,
            });
          } else {
            // New Lost → Existing Found
            await Notification.create({
              user: existingItem.reportedBy,
              type: "MATCH",
              title: "Possible Item Match Found",
              message: `A lost item may match your found item "${existingItem.title}".`,
              item: item._id,
            });
          }

          // ============================================
          // NOTIFICATION FOR NEW REPORT OWNER
          // ============================================

          if (type === "Found") {
            // New Found user gets notification
            // about matching Lost report
            await Notification.create({
              user: req.user,
              type: "MATCH",
              title: "Possible Item Match Found",
              message: `Your found item "${item.title}" may match an existing lost item.`,
              item: existingItem._id,
            });
          } else {
            // New Lost user gets notification
            // about matching Found report
            await Notification.create({
              user: req.user,
              type: "MATCH",
              title: "Possible Item Found",
              message: `Your lost item "${item.title}" may match an existing found item.`,
              item: existingItem._id,
            });
          }
        }
      }
    }

    // ==================================================
    // SUCCESS RESPONSE
    // ==================================================

    res.status(201).json({
      message: "Item reported successfully",
      item,
    });
  } catch (error) {
    console.error("Create item error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// Get All Items + Search + Filters
// ======================================================

const getItems = async (req, res) => {
  try {
    const {
      search,
      type,
      category,
      location,
      status,
    } = req.query;

    const filter = {};

    // Search title and description
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Type filter
    if (type) {
      filter.type = type;
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Location filter
    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    const items = await Item.find(filter)
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get items error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// Get Single Item
// ======================================================

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("reportedBy", "name email");

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.json(item);
  } catch (error) {
    console.error("Get item error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// Get My Reports
// ======================================================

const getMyReports = async (req, res) => {
  try {
    const items = await Item.find({
      reportedBy: req.user,
    }).sort({ createdAt: -1 });

    res.json({
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get my reports error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// Update Item
// ======================================================

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Only owner can update
    if (
      item.reportedBy.toString() !==
      req.user.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only update your own reports",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "type",
      "location",
      "date",
      "image",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    await item.save();

    res.json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update item error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// Delete Item
// ======================================================

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Only owner can delete
    if (
      item.reportedBy.toString() !==
      req.user.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only delete your own reports",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete item error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// Exports
// ======================================================

module.exports = {
  createItem,
  getItems,
  getItemById,
  getMyReports,
  updateItem,
  deleteItem,
};