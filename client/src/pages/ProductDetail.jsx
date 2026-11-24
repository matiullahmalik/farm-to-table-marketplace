import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import ProductArt from '../components/ProductArt';
import ProductCard from '../components/ProductCard';
import { availability, canBuy, eur, fmtDate, useAuth, useCart, useProducts } from '../store';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const { list } = useProducts();
  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => { setP(null); setErr(''); setQty(1); api.get(`/products/${id}`).then((r) => setP(r.data)).catch(() => setErr('Product not found.')); window.scrollTo(0, 0); }, [id]);
  if (err) return <section className="section"><p className="err">{err}</p><Link to="/shop" className="link">← Back to shop</Link></section>;
  if (!p) return <section className="section"><div className="skeleton" style={{ height: 380 }} /></section>;

  const a = availability(p);
  const related = (list || []).filter((x) => x.category === p.category && x._id !== p._id && canBuy(x)).slice(0, 4);
  const onAdd = () => { if (add(p, qty)) { setAdded(true); setTimeout(() => setAdded(false), 1500); } };

  return (
    <section className="section">
      <p className="crumbs"><Link to="/shop">Shop</Link> / <Link to={`/shop?cat=${encodeURIComponent(p.category)}`}>{p.category}</Link> / {p.name}</p>
      <div className="detail">
        <div className="detail-art"><ProductArt product={p} size="big" /></div>
        <div className="detail-info">
          <span className={`badge badge-${a.key} badge-static`}>{a.label}</span>
          <h1>{p.name}</h1>
          <p className="muted">Grown by <b>{p.farmer?.farmName}</b> · 📍 {p.farmer?.location}</p>
          <div className="detail-price">{eur(p.price)}<small> / {p.unit}</small></div>
          <p>{p.description}</p>
          <ul className="facts">
            <li><span>🗓️ Season</span><b>{fmtDate(p.seasonStart)} to {fmtDate(p.seasonEnd)}</b></li>
            <li><span>📦 Stock</span><b>{p.stock} {p.stock === 1 ? 'unit' : 'units'} available</b></li>
            <li><span>🚚 Delivery</span><b>Choose a slot at checkout</b></li>
          </ul>
          {user?.role === 'farmer' ? <p className="notice">You are logged in as a farmer. Log in as a buyer to order.</p> : (
            <div className="buy">
              <div className="stepper">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Less">−</button><b>{qty}</b>
                <button onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="More">+</button>
              </div>
              <button className={`btn btn-lg ${added ? 'btn-ok' : ''}`} disabled={!canBuy(p)} onClick={onAdd}>
                {added ? 'Added to cart ✓' : canBuy(p) ? `Add to cart · ${eur(p.price * qty)}` : a.label}
              </button>
            </div>
          )}
        </div>
      </div>
      {related.length > 0 && <><h2 style={{ marginTop: 48 }}>You may also like</h2><div className="grid">{related.map((x) => <ProductCard key={x._id} p={x} />)}</div></>}
    </section>
  );
}
