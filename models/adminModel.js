const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Admin', adminSchema);
