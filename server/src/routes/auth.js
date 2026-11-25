const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (u) => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, address, farmName } = req.body;
    if (!name || !email || !password || String(password).length < 8)
      return res.status(400).json({ message: 'Name, email and a password of 8+ characters are required' });
    if (!['buyer', 'farmer'].includes(role)) // nobody can self-register as admin
      return res.status(400).json({ message: 'Role must be buyer or farmer' });
    const mail = String(email).toLowerCase(); // String() blocks NoSQL operator injection
    if (await User.findOne({ email: mail })) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email: mail, password: await bcrypt.hash(String(password), 12), role, address, farmName });
    res.status(201).json({ token: sign(user), user: pub(user) });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() });
    const ok = user && (await bcrypt.compare(String(req.body.password || ''), user.password));
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: sign(user), user: pub(user) });
  } catch (e) { next(e); }
});

module.exports = router;
