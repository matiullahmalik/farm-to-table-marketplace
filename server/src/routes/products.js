const router = require('express').Router();
const Product = require('../models/Product');
const { auth, role } = require('../middleware/auth');

const FARMER_FIELDS = 'name farmName location bio';

// Public list. ?inSeason=true shows only in-season, in-stock items
router.get('/', async (req, res, next) => {
  try {
    const q = {};
    if (req.query.inSeason === 'true') {
      const now = new Date();
      Object.assign(q, { seasonStart: { $lte: now }, seasonEnd: { $gte: now }, stock: { $gt: 0 } });
    }
    res.json(await Product.find(q).populate('farmer', FARMER_FIELDS).sort('-createdAt'));
  } catch (e) { next(e); }
});

router.get('/mine', auth, role('farmer'), async (req, res, next) => {
  try { res.json(await Product.find({ farmer: req.user.id }).sort('-createdAt')); } catch (e) { next(e); }
});

// Single product (used by the product detail page). Must stay below /mine.
router.get('/:id', async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id).populate('farmer', FARMER_FIELDS);
    p ? res.json(p) : res.status(404).json({ message: 'Product not found' });
  } catch (e) { next(e); }
});

router.post('/', auth, role('farmer'), async (req, res, next) => {
  try {
    const { name, description, category, emoji, price, unit, stock, seasonStart, seasonEnd, imageUrl } = req.body; // whitelist fields
    if (new Date(seasonEnd) < new Date(seasonStart)) return res.status(400).json({ message: 'Season end is before start' });
    const p = await Product.create({ farmer: req.user.id, name, description, category, emoji, price, unit, stock, seasonStart, seasonEnd, imageUrl });
    res.status(201).json(p);
  } catch (e) { next(e); }
});

router.delete('/:id', auth, role('farmer'), async (req, res, next) => {
  try {
    const p = await Product.findOneAndDelete({ _id: req.params.id, farmer: req.user.id }); // owner-only
    p ? res.json({ message: 'Deleted' }) : res.status(404).json({ message: 'Not found' });
  } catch (e) { next(e); }
});

module.exports = router;
