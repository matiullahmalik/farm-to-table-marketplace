import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { CATEGORIES, availability, eur, errMsg } from '../store';

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

export default function Farmer() {
  const blank = { name: '', description: '', category: 'Vegetables', emoji: '', price: '', unit: 'kg', stock: '', seasonStart: today(), seasonEnd: inDays(90), imageUrl: '' };
  const [p, setP] = useState(blank);
  const [slot, setSlot] = useState({ date: inDays(1), window: 'Morning 8-12', capacity: 10 });
  const [mine, setMine] = useState([]);
  const [orders, setOrders] = useState([]);
  const [note, setNote] = useState({ text: '', ok: true });

  const load = () => {
    api.get('/products/mine').then((r) => setMine(r.data));
    api.get('/orders').then((r) => setOrders(r.data));
  };
  useEffect(load, []);
  const say = (text, ok = true) => { setNote({ text, ok }); setTimeout(() => setNote({ text: '' }), 3500); };
  const bind = (obj, setObj, k) => (e) => setObj({ ...obj, [k]: e.target.value });

  const addProduct = async (e) => {
    e.preventDefault();
    try { await api.post('/products', { ...p, emoji: p.emoji || undefined, imageUrl: p.imageUrl || undefined }); setP(blank); say('Product added.'); load(); }
    catch (x) { say(errMsg(x), false); }
  };
  const addSlot = async (e) => {
    e.preventDefault();
    try { await api.post('/slots', slot); say('Delivery slot added.'); } catch (x) { say(errMsg(x), false); }
  };
  const del = async (id) => { if (window.confirm('Delete this product?')) { await api.delete(`/products/${id}`); load(); } };

  const open = orders.filter((o) => o.status !== 'Delivered').length;
  const revenue = orders.filter((o) => o.status === 'Delivered').reduce((s, o) => s + o.total, 0);
  const low = mine.filter((m) => m.stock < 10).length;

  return (
    <section className="section">
      <h1>Farmer dashboard</h1>
      {note.text && <p className={note.ok ? 'toast ok-toast' : 'toast err-toast'}>{note.text}</p>}
      <div className="stats">
        <div><span>🥕</span><b>{mine.length}</b>Products</div>
        <div><span>📦</span><b>{open}</b>Open orders</div>
        <div><span>⚠️</span><b>{low}</b>Low stock</div>
        <div><span>💶</span><b>{eur(revenue)}</b>Delivered revenue</div>
      </div>
      <p><Link to="/orders" className="link">Manage incoming orders →</Link></p>

      <div className="forms">
        <form onSubmit={addProduct} className="panel">
          <h3>Add a product</h3>
          <input placeholder="Product name" value={p.name} onChange={bind(p, setP, 'name')} required />
          <textarea placeholder="Short description" rows="2" value={p.description} onChange={bind(p, setP, 'description')} />
          <div className="two">
            <select value={p.category} onChange={bind(p, setP, 'category')}>{CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}</select>
            <input placeholder="Emoji (optional) 🍅" value={p.emoji} onChange={bind(p, setP, 'emoji')} maxLength="4" />
          </div>
          <div className="three">
            <input type="number" step="0.01" min="0" placeholder="Price (€)" value={p.price} onChange={bind(p, setP, 'price')} required />
            <input placeholder="Unit (kg, bunch)" value={p.unit} onChange={bind(p, setP, 'unit')} required />
            <input type="number" min="0" placeholder="Stock" value={p.stock} onChange={bind(p, setP, 'stock')} required />
          </div>
          <div className="two">
            <div><label className="label">Season starts</label><input type="date" value={p.seasonStart} onChange={bind(p, setP, 'seasonStart')} required /></div>
            <div><label className="label">Season ends</label><input type="date" value={p.seasonEnd} onChange={bind(p, setP, 'seasonEnd')} required /></div>
          </div>
          <input placeholder="Photo URL (optional)" value={p.imageUrl} onChange={bind(p, setP, 'imageUrl')} />
          <button className="btn">Add product</button>
        </form>

        <form onSubmit={addSlot} className="panel">
          <h3>Add a delivery slot</h3>
          <label className="label">Date</label><input type="date" min={today()} value={slot.date} onChange={bind(slot, setSlot, 'date')} required />
          <label className="label">Time window</label>
          <select value={slot.window} onChange={bind(slot, setSlot, 'window')}><option>Morning 8-12</option><option>Afternoon 12-4</option><option>Evening 4-8</option></select>
          <label className="label">Capacity (orders)</label><input type="number" min="1" value={slot.capacity} onChange={bind(slot, setSlot, 'capacity')} required />
          <button className="btn">Add slot</button>
        </form>
      </div>

      <h2>My products</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead>
          <tbody>
            {mine.map((m) => {
              const a = availability(m);
              return <tr key={m._id}><td>{m.emoji} {m.name}</td><td>{eur(m.price)} / {m.unit}</td><td>{m.stock}</td>
                <td><span className={`badge badge-${a.key} badge-static`}>{a.label}</span></td>
                <td><button className="link-btn danger" onClick={() => del(m._id)}>Delete</button></td></tr>;
            })}
            {!mine.length && <tr><td colSpan="5" className="muted">No products yet. Add your first one above.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
