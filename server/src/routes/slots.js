const router = require('express').Router();
const Slot = require('../models/Slot');
const { auth, role } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const slots = await Slot.find({ date: { $gte: today } }).sort('date window');
    res.json(slots.filter((s) => s.booked < s.capacity));
  } catch (e) { next(e); }
});

router.post('/', auth, role('farmer', 'admin'), async (req, res, next) => {
  try {
    const { date, window, capacity } = req.body;
    res.status(201).json(await Slot.create({ date, window, capacity }));
  } catch (e) { e.code === 11000 ? res.status(409).json({ message: 'Slot already exists' }) : next(e); }
});

module.exports = router;
