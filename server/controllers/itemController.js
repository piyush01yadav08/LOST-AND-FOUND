const Item = require("../models/Item");

// Create Item
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

    res.status(201).json({
      message: "Item reported successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get All Items + Search + Filters
const getItems = async (req, res) => {
  try {
    const { search, type, category, location, status } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

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
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get Single Item
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
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get My Reports
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
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Item
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (item.reportedBy.toString() !== req.user.toString()) {
      return res.status(403).json({
        message: "You can only update your own reports",
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
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete Item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (item.reportedBy.toString() !== req.user.toString()) {
      return res.status(403).json({
        message: "You can only delete your own reports",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  getMyReports,
  updateItem,
  deleteItem,
};