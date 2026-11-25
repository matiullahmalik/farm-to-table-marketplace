const { Schema, model } = require('mongoose');
module.exports = model('Order', new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ product: Schema.Types.ObjectId, name: String, price: Number, qty: Number }],
  slot: { type: Schema.Types.ObjectId, ref: 'Slot', required: true },
  slotLabel: String,
  address: { type: String, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Placed', 'Confirmed', 'Out for delivery', 'Delivered'], default: 'Placed' },
}, { timestamps: true }));
