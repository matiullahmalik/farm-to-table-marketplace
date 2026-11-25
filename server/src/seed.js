/*
 * Demo data for Farm to Table (prices in EUR).
 * Run from the server folder:  npm run seed
 * WARNING: this empties the users, products, slots and orders collections first.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Slot = require('./models/Slot');
const Order = require('./models/Order');

const day = (offset) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + offset); return d; };
const iso = (d) => d.toISOString().slice(0, 10);

const FARMS = [
  { name: 'Aoife Byrne', email: 'aoife@farmtable.test', farmName: 'Green Valley Farm', location: 'Co. Wicklow',
    bio: 'Third-generation family farm growing field vegetables on the slopes of the Wicklow hills. No sprays we cannot pronounce, ever.' },
  { name: 'Liam Doyle', email: 'liam@farmtable.test', farmName: 'Sunny Meadows Orchard', location: 'Co. Kildare',
    bio: 'A sheltered orchard and soft-fruit tunnels. We pick in the morning and you eat in the evening.' },
  { name: 'Niamh Murphy', email: 'niamh@farmtable.test', farmName: 'Hillside Dairy & Pantry', location: 'Co. Cork',
    bio: 'Grass-fed cows, free-range hens, and a wood-fired bakery. Everything here is made within sight of the farmhouse kitchen.' },
  { name: 'Conor Walsh', email: 'conor@farmtable.test', farmName: 'Herb & Hearth Garden', location: 'Co. Meath',
    bio: 'Polytunnel salads, herbs and mushrooms grown with rainwater and a lot of patience.' },
];

// [name, category, emoji, price EUR, unit, stock, farm index, description, season: 'in' | 'ended' | 'soon', stock override]
const P = [
  ['Vine Tomatoes', 'Vegetables', '🍅', 3.2, 'kg', 42, 0, 'Sun-ripened vine tomatoes with real flavour. Perfect sliced with olive oil and sea salt.'],
  ['Rainbow Carrots', 'Vegetables', '🥕', 1.9, 'kg', 60, 0, 'Sweet, crunchy carrots in orange, purple and yellow. Just pulled from the soil.'],
  ['Tenderstem Broccoli', 'Vegetables', '🥦', 2.8, 'bunch', 26, 0, 'Tender green stems and florets. Steam for three minutes and add butter.'],
  ['Rooster Potatoes', 'Vegetables', '🥔', 2.1, 'kg', 120, 0, 'Floury red-skinned potatoes, the Irish classic for mash, roasties and chips.'],
  ['Sweet Bell Peppers', 'Vegetables', '🫑', 4.5, 'kg', 18, 0, 'Glossy, thick-walled peppers that are sweet raw and even sweeter roasted.'],
  ['Red Onions', 'Vegetables', '🧅', 1.6, 'kg', 55, 0, 'Mild and sweet red onions that keep well and look great in salads.'],
  ['Sweet Corn', 'Vegetables', '🌽', 2.5, '3 cobs', 14, 0, 'Plump, juicy cobs. Boil for five minutes or throw on the barbecue.'],
  ['Green Courgettes', 'Vegetables', '🥒', 2.9, 'kg', 33, 0, 'Young, tender courgettes. Grill, spiralise or bake into a loaf.'],
  ['Strawberries', 'Fruits', '🍓', 4.5, '500 g', 24, 1, 'Fragrant, hand-picked strawberries with a deep red colour all the way through.'],
  ['Cox Apples', 'Fruits', '🍎', 3.4, 'kg', 80, 1, 'Crisp, aromatic eating apples from our own orchard. Great for pies as well.'],
  ['Conference Pears', 'Fruits', '🍐', 3.6, 'kg', 36, 1, 'Juicy, honey-sweet pears, picked at the perfect point of ripeness.'],
  ['Blueberries', 'Fruits', '🫐', 4.9, '250 g', 0, 1, 'Plump blueberries bursting with flavour. Currently sold out, back soon.'],
  ['Cherries', 'Fruits', '🍒', 7.5, '500 g', 12, 1, 'Dark, sweet cherries. The season has finished, see you next summer.', 'ended'],
  ['White Peaches', 'Fruits', '🍑', 6.2, 'kg', 20, 1, 'Soft, fragrant peaches from the polytunnel. Coming into season soon.', 'soon'],
  ['Free-Range Eggs', 'Dairy & Eggs', '🥚', 3.9, 'dozen', 48, 2, 'Orange-yolked eggs from hens that roam our meadow all day.'],
  ['Fresh Whole Milk', 'Dairy & Eggs', '🥛', 1.6, 'litre', 70, 2, 'Creamy, grass-fed whole milk, bottled the morning you order.'],
  ['Farmhouse Cheddar', 'Dairy & Eggs', '🧀', 6.8, '250 g', 22, 2, 'Mature cheddar, aged for twelve months. Sharp, nutty and crumbly.'],
  ['Cultured Butter', 'Dairy & Eggs', '🧈', 3.7, '250 g', 30, 2, 'Slowly churned butter with a rich, slightly tangy flavour.'],
  ['Wildflower Honey', 'Pantry', '🍯', 6.5, 'jar', 16, 2, 'Raw honey from our own hives. Floral, golden and delicious on porridge.'],
  ['Porridge Oats', 'Pantry', '🌾', 2.4, 'kg', 64, 2, 'Rolled pinhead oats for creamy porridge and flapjacks.'],
  ['Sourdough Loaf', 'Pantry', '🍞', 4.2, 'loaf', 9, 2, 'Slow-fermented, wood-fired sourdough with a crackling crust.'],
  ['Butterhead Lettuce', 'Leafy Greens', '🥬', 1.9, 'head', 40, 3, 'Soft, buttery leaves. Wash, tear and dress with lemon and olive oil.'],
  ['Baby Spinach', 'Leafy Greens', '🥬', 2.2, '200 g bag', 8, 3, 'Tender young leaves for salads, smoothies and wilting into pasta.'],
  ['Genovese Basil', 'Herbs', '🌿', 1.5, 'bunch', 30, 3, 'Big, aromatic basil leaves. Pesto, pizza or a tomato salad needs this.'],
  ['Flat-Leaf Parsley', 'Herbs', '🌿', 1.2, 'bunch', 38, 3, 'Fresh, peppery parsley, cut to order.'],
  ['Garden Mint', 'Herbs', '🌱', 1.3, 'bunch', 27, 3, 'Cool, bright mint for tea, lamb, peas and cocktails.'],
  ['Hardneck Garlic', 'Vegetables', '🧄', 1.8, '3 bulbs', 44, 3, 'Strong, juicy garlic with a sweet finish when roasted.'],
  ['Chestnut Mushrooms', 'Vegetables', '🍄', 3.8, '400 g', 15, 3, 'Meaty, earthy mushrooms. Fry hot with butter and thyme.'],
  ['Crunchy Cucumbers', 'Vegetables', '🥒', 1.4, 'each', 50, 3, 'Cool, crisp cucumbers from the polytunnel.'],
  ['Purple Aubergines', 'Vegetables', '🍆', 3.1, 'kg', 19, 3, 'Glossy aubergines that turn silky when roasted or grilled.'],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Slot.deleteMany({}), Order.deleteMany({})]);

  const password = await bcrypt.hash('password123', 12);
  const farmers = await User.insertMany(FARMS.map((f) => ({ ...f, password, role: 'farmer' })));
  const buyers = await User.insertMany([1, 2, 3].map((i) => ({
    name: ['Sarah Kelly', 'Tom Gallagher', 'Priya Nair'][i - 1], email: `buyer${i}@farmtable.test`, password, role: 'buyer',
    address: ['12 Main Street, Dublin 2', '7 Oak Road, Galway', '31 River Lane, Cork'][i - 1],
  })));

  const products = await Product.insertMany(P.map(([name, category, emoji, price, unit, stock, f, description, season]) => ({
    farmer: farmers[f]._id, name, category, emoji, price, unit, stock, description,
    seasonStart: season === 'ended' ? day(-200) : season === 'soon' ? day(60) : day(-45),
    seasonEnd: season === 'ended' ? day(-120) : season === 'soon' ? day(180) : day(150),
  })));

  const windows = ['Morning 8-12', 'Afternoon 12-4', 'Evening 4-8'];
  const slotDocs = [];
  for (let d = 1; d <= 10; d++) for (const w of windows) slotDocs.push({ date: iso(day(d)), window: w, capacity: 6 + ((d + w.length) % 5), booked: 0 });
  const slots = await Slot.insertMany(slotDocs);

  // sample orders in every status
  const pick = (farmIdx, names) => names.map((n) => products.find((p) => p.name === n && String(p.farmer) === String(farmers[farmIdx]._id)));
  const demo = [
    [0, 0, ['Vine Tomatoes', 'Rainbow Carrots', 'Rooster Potatoes'], [2, 1, 3], 'Delivered'],
    [3, 0, ['Baby Spinach', 'Genovese Basil'], [2, 2], 'Delivered'],
    [2, 1, ['Free-Range Eggs', 'Fresh Whole Milk', 'Sourdough Loaf'], [1, 2, 1], 'Out for delivery'],
    [1, 2, ['Strawberries', 'Cox Apples'], [2, 2], 'Confirmed'],
    [0, 1, ['Sweet Bell Peppers', 'Red Onions'], [1, 2], 'Placed'],
    [2, 0, ['Farmhouse Cheddar', 'Wildflower Honey'], [1, 1], 'Placed'],
  ];
  for (let i = 0; i < demo.length; i++) {
    const [fi, bi, names, qtys, status] = demo[i];
    const items = pick(fi, names).map((p, k) => ({ product: p._id, name: p.name, price: p.price, qty: qtys[k] }));
    const slot = slots[i * 3];
    await Slot.updateOne({ _id: slot._id }, { $inc: { booked: 1 } });
    await Order.create({
      buyer: buyers[bi]._id, farmer: farmers[fi]._id, items, slot: slot._id, slotLabel: `${slot.date} ${slot.window}`,
      address: buyers[bi].address, total: Math.round(items.reduce((s, l) => s + l.price * l.qty, 0) * 100) / 100, status,
    });
  }

  console.log(`Seeded: ${farmers.length} farms, ${buyers.length} buyers, ${products.length} products, ${slots.length} slots, ${demo.length} orders.`);
  console.log('Demo logins (password: password123):');
  console.log('  buyer :  buyer1@farmtable.test');
  console.log('  farmer:  aoife@farmtable.test  (liam@, niamh@, conor@ also work)');
  await mongoose.disconnect();
})().catch((e) => { console.error('Seeding failed:', e.message); process.exit(1); });
