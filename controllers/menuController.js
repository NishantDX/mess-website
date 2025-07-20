const Menu = require("../models/menuModel");
const moment = require("moment");

/**
 * Add or update menu for a specific day
 */
async function addOrUpdateMenu(req, res) {
  try {
    const { day, breakfast, lunch, dinner } = req.body;

    if (!day || !breakfast || !lunch || !dinner) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate day is one of the allowed enum values
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    if (!validDays.includes(day)) {
      return res.status(400).json({ message: "Invalid day. Must be one of: " + validDays.join(", ") });
    }

    let menu = await Menu.findOne({ day });

    if (menu) {
      // Update existing menu
      menu.breakfast = breakfast;
      menu.lunch = lunch;
      menu.dinner = dinner;
      await menu.save();
      return res.status(200).json({ message: "Menu updated", menu });
    } else {
      // Add new menu
      const newMenu = await Menu.create({ day, breakfast, lunch, dinner });
      return res.status(201).json({ message: "Menu added", menu: newMenu });
    }

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

/**
 * Get menu for a specific date (returns the menu for that day of the week)
 */
async function getMenuByDate(req, res) {
  try {
    const { date } = req.params;
    
    // Convert date to day of the week
    const dayOfWeek = moment(date).format('dddd'); // e.g., "Monday"
    
    const menu = await Menu.findOne({ day: dayOfWeek });
    if (!menu) {
      return res.status(404).json({ 
        message: "No menu found for this day", 
        day: dayOfWeek 
      });
    }

    return res.status(200).json({
      ...menu.toObject(),
      requestedDate: date,
      day: dayOfWeek
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

/**
 * Get menu for a specific day of the week
 */
async function getMenuByDay(req, res) {
  try {
    const { day } = req.params;
    
    const menu = await Menu.findOne({ day });
    if (!menu) {
      return res.status(404).json({ message: "No menu found for this day" });
    }

    return res.status(200).json(menu);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

/**
 * Get all menus for the entire week
 */
async function getWeeklyMenu(req, res) {
  try {
    const menus = await Menu.find({}).sort({
      day: 1 // Sort by day (Monday first, etc.)
    });

    // Create an ordered array of days for proper sorting
    const orderedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    // Sort the menus according to the day order
    const sortedMenus = menus.sort((a, b) => {
      return orderedDays.indexOf(a.day) - orderedDays.indexOf(b.day);
    });

    return res.status(200).json({ menus: sortedMenus });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

module.exports = { 
  addOrUpdateMenu, 
  getMenuByDate, 
  getMenuByDay,
  getWeeklyMenu
};