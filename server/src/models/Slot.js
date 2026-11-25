const { Schema, model } = require('mongoose');
const s = new Schema({
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // YYYY-MM-DD
  window: { type: String, required: true },                              // e.g. "Morning 8-12"
  capacity: { type: Number, required: true, min: 1 },
  booked: { type: Number, default: 0, min: 0 },
});
s.index({ date: 1, window: 1 }, { unique: true });
module.exports = model('Slot', s);
