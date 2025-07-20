const Announcement = require("../models/announcementModel");
const moment = require("moment"); /**
const Announcement = require("../models/announcementModel");
const moment = require("moment");

/**
 * Add a new announcement
 * @route POST /api/announcements
 */
async function addAnnouncement(req, res) {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const announcement = await Announcement.create({
      title,
      description,
      postedOn: new Date(),
    });

    return res.status(201).json({
      message: "Announcement created",
      announcement,
    });
  } catch (error) {
    console.error("Error adding announcement:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

/**
 * Get all announcements
 * @route GET /api/announcements
 */
async function getAnnouncements(req, res) {
  try {
    const announcements = await Announcement.find().sort({ postedOn: -1 }); // Most recent first

    // Format the postedOn date
    const formattedAnnouncements = announcements.map((announcement) => ({
      id: announcement._id,
      title: announcement.title,
      description: announcement.description,
      postedOn: moment(announcement.postedOn).format("MMMM D, YYYY"),
    }));

    return res.status(200).json(formattedAnnouncements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

/**
 * Remove an announcement
 * @route DELETE /api/announcements/:id
 */
async function removeAnnouncement(req, res) {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.status(200).json({
      message: "Announcement removed",
    });
  } catch (error) {
    console.error("Error removing announcement:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

/**
 * Update an announcement
 * @route PUT /api/announcements/:id
 */
async function updateAnnouncement(req, res) {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title && !description) {
      return res
        .status(400)
        .json({
          message: "At least one field (title or description) is required",
        });
    }

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (title) announcement.title = title;
    if (description) announcement.description = description;

    await announcement.save();

    return res.status(200).json({
      message: "Announcement updated",
      announcement,
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

module.exports = {
  addAnnouncement,
  getAnnouncements,
  removeAnnouncement,
  updateAnnouncement,
};
