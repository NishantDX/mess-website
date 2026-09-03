const Menu = require("../models/menuModel");
const moment = require("moment");
const { cacheGet, cacheSet, cacheDel } = require("../services/cache");

// Menus change at most once a day, so a long TTL is fine — writes bust the keys.
const MENU_TTL = 60 * 60; // 1 hour
const WEEK_KEY = "menu:week";
const dayKey = (day) => `menu:day:${day}`;

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
      await cacheDel(WEEK_KEY, dayKey(day));
      return res.status(200).json({ message: "Menu updated", menu });
    } else {
      // Add new menu
      const newMenu = await Menu.create({ day, breakfast, lunch, dinner });
      await cacheDel(WEEK_KEY, dayKey(day));
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

    let menu = await cacheGet(dayKey(dayOfWeek));
    if (menu) {
      res.set("X-Cache", "HIT");
    } else {
      const doc = await Menu.findOne({ day: dayOfWeek });
      if (!doc) {
        return res.status(404).json({
          message: "No menu found for this day",
          day: dayOfWeek
        });
      }
      menu = doc.toObject();
      await cacheSet(dayKey(dayOfWeek), menu, MENU_TTL);
      res.set("X-Cache", "MISS");
    }

    return res.status(200).json({
      ...menu,
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

    const cached = await cacheGet(dayKey(day));
    if (cached) {
      res.set("X-Cache", "HIT");
      return res.status(200).json(cached);
    }

    const menu = await Menu.findOne({ day });
    if (!menu) {
      return res.status(404).json({ message: "No menu found for this day" });
    }

    const plain = menu.toObject();
    await cacheSet(dayKey(day), plain, MENU_TTL);
    res.set("X-Cache", "MISS");
    return res.status(200).json(plain);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

/**
 * Get all menus for the entire week
 */
async function getWeeklyMenu(req, res) {
  try {
    const cached = await cacheGet(WEEK_KEY);
    if (cached) {
      res.set("X-Cache", "HIT");
      return res.status(200).json({ menus: cached });
    }

    const menus = await Menu.find({});

    // Create an ordered array of days for proper sorting
    const orderedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Sort the menus according to the day order
    const sortedMenus = menus.sort((a, b) => {
      return orderedDays.indexOf(a.day) - orderedDays.indexOf(b.day);
    });

    await cacheSet(WEEK_KEY, sortedMenus, MENU_TTL);
    res.set("X-Cache", "MISS");
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
