const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    postedOn: { type: Date, default: Date.now }
  });
  module.exports = mongoose.model('announcement', announcementSchema);