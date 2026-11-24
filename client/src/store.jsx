import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

/* ---------- helpers ---------- */
export const eur = (n) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
export const errMsg = (e) => e.response?.data?.message || 'Something went wrong';

export const CATEGORIES = [
  { name: 'Vegetables', emoji: '🥕', from: '#e3f5cf', to: '#a9da82' },
  { name: 'Fruits', emoji: '🍓', from: '#ffe3e0', to: '#ffb4ab' },
  { name: 'Leafy Greens', emoji: '🥬', from: '#d7f5de', to: '#8adc9f' },
  { name: 'Herbs', emoji: '🌿', from: '#e8f7d4', to: '#bfe28f' },
  { name: 'Dairy & Eggs', emoji: '🥛', from: '#fff3d1', to: '#ffd98a' },
  { name: 'Pantry', emoji: '🍯', from: '#f8e7d0', to: '#e9c18f' },
];
export const catOf = (name) => CATEGORIES.find((c) => c.name === name) || CATEGORIES[0];

export const isInSeason = (p) => { const n = Date.now(); return new Date(p.seasonStart) <= n && new Date(p.seasonEnd) >= n; };
export const availability = (p) => {
  if (!isInSeason(p)) return new Date(p.seasonStart) > Date.now() ? { key: 'soon', label: 'Coming soon' } : { key: 'ended', label: 'Out of season' };
  if (p.stock <= 0) return { key: 'sold', label: 'Sold out' };
  if (p.stock < 10) return { key: 'low', label: `Only ${p.stock} left` };
  return { key: 'ok', label: 'In season' };
};
export const canBuy = (p) => { const k = availability(p).key; return k === 'ok' || k === 'low'; };

export function groupFarms(products) {
  const map = new Map();
  products.forEach((p) => {
    const f = p.farmer; if (!f) return;
    if (!map.has(f._id)) map.set(f._id, { ...f, id: f._id, products: [] });
    map.get(f._id).products.push(p);
  });
  return [...map.values()];
}

export function useProducts() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    api.get('/products').then((r) => live && setList(r.data)).catch(() => live && setError('Could not load products. Is the server running?'));
    return () => { live = false; };
  }, []);
  return { list, error };
}

/* ---------- auth ---------- */
const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const save = ({ token, user }) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); setUser(user); };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };
  return <AuthCtx.Provider value={{ user, save, logout }}>{children}</AuthCtx.Provider>;
}

/* ---------- cart (kept in localStorage so a refresh does not empty it) ---------- */
const CartCtx = createContext();
export const useCart = () => useContext(CartCtx);
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(items)); }, [items]);

  // One order can only contain items from one farm (the API enforces this too)
  const add = (p, qty = 1) => {
    if (items.length && items[0].farmerId !== p.farmer._id) {
      if (!window.confirm(`Your cart has items from ${items[0].farmName}. Orders are per farm. Start a new cart with ${p.farmer.farmName}?`)) return false;
      setItems([]);
    }
    setItems((cur) => {
      const base = cur.length && cur[0].farmerId !== p.farmer._id ? [] : cur;
      const found = base.find((i) => i.id === p._id);
      if (found) return base.map((i) => (i.id === p._id ? { ...i, qty: Math.min(p.stock, i.qty + qty) } : i));
      return [...base, { id: p._id, name: p.name, emoji: p.emoji, category: p.category, imageUrl: p.imageUrl, price: p.price, unit: p.unit,
        stock: p.stock, farmerId: p.farmer._id, farmName: p.farmer.farmName || p.farmer.name, qty: Math.min(p.stock, qty) }];
    });
    return true;
  };
  const setQty = (id, qty) => setItems((c) => c.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(i.stock, qty)) } : i)));
  const remove = (id) => setItems((c) => c.filter((i) => i.id !== id));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  return <CartCtx.Provider value={{ items, add, setQty, remove, clear, count, total }}>{children}</CartCtx.Provider>;
}
