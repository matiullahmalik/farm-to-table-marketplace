const { Schema, model } = require('mongoose');
module.exports = model('Product', new Schema({
  farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: String,
  category: { type: String, default: 'Vegetables' }, // Vegetables, Fruits, Leafy Greens, Herbs, Dairy & Eggs, Pantry
  emoji: String,                                     // used for the illustrated product tile
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },            // e.g. kg, bunch
  stock: { type: Number, required: true, min: 0 },
  seasonStart: { type: Date, required: true },
  seasonEnd: { type: Date, required: true },
  imageUrl: String,                                  // optional: paste a real photo URL here
}, { timestamps: true }));
