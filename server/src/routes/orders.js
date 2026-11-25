const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Slot = require('../models/Slot');
const { auth, role } = require('../middleware/auth');

const FLOW = ['Placed', 'Confirmed', 'Out for delivery', 'Delivered'];

/*
 * CENTRAL TECHNICAL CHALLENGE: overselling stock / overbooking slots.
 * Each reservation is ONE atomic conditional update (stock >= qty, booked < capacity).
 * MongoDB applies it to a single document atomically, so two simultaneous buyers
 * cannot both take the last item. If any step fails, earlier reservations are released.
 */
router.post('/', auth, role('buyer'), async (req, res, next) => {
  const reserved = [];
  let slotId = null;
  const rollback = async () => {
    await Promise.all(reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } })));
    if (slotId) await Slot.updateOne({ _id: slotId }, { $inc: { booked: -1 } });
  };
  const fail = async (status, message) => { await rollback(); return res.status(status).json({ message }); };

  try {
    const { items, slotId: wantedSlot, address } = req.body;
    if (!Array.isArray(items) || !items.length || !address)
      return res.status(400).json({ message: 'Items and delivery address are required' });

    const now = new Date();
    const lines = [];
    let farmer = null;
    for (const it of items) {
      const qty = Number(it.qty);
      if (!Number.isInteger(qty) || qty < 1) return fail(400, 'Invalid quantity');
      const p = await Product.findOneAndUpdate(
        { _id: it.productId, stock: { $gte: qty }, seasonStart: { $lte: now }, seasonEnd: { $gte: now } },
        { $inc: { stock: -qty } }, { new: true });
      if (!p) return fail(409, 'An item is out of stock or out of season');
      reserved.push({ id: p._id, qty });
      if (farmer && String(farmer) !== String(p.farmer)) return fail(400, 'One order can only contain items from one farmer');
      farmer = p.farmer;
      lines.push({ product: p._id, name: p.name, price: p.price, qty }); // price comes from DB, never the client
    }

    const slot = await Slot.findOneAndUpdate(
      { _id: wantedSlot, $expr: { $lt: ['$booked', '$capacity'] } }, { $inc: { booked: 1 } });
    if (!slot) return fail(409, 'Delivery slot is full or invalid');
    slotId = slot._id;

    const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const order = await Order.create({
      buyer: req.user.id, farmer, items: lines, slot: slot._id,
      slotLabel: `${slot.date} ${slot.window}`, address, total,
    });
    res.status(201).json(order);
  } catch (e) { await rollback().catch(() => {}); next(e); }
});

router.get('/', auth, role('buyer', 'farmer'), async (req, res, next) => {
  try {
    const filter = req.user.role === 'farmer' ? { farmer: req.user.id } : { buyer: req.user.id };
    res.json(await Order.find(filter).sort('-createdAt'));
  } catch (e) { next(e); }
});

// Farmer moves the order one step forward
router.patch('/:id/status', auth, role('farmer'), async (req, res, next) => {
  try {
    const o = await Order.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!o) return res.status(404).json({ message: 'Order not found' });
    const i = FLOW.indexOf(o.status);
    if (i === FLOW.length - 1) return res.status(400).json({ message: 'Already delivered' });
    o.status = FLOW[i + 1];
    await o.save();
    res.json(o);
  } catch (e) { next(e); }
});

module.exports = router;
