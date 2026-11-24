import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductArt from '../components/ProductArt';
import { CATEGORIES, canBuy, groupFarms, useProducts } from '../store';

const STEPS = [
  { icon: '🔍', title: 'Browse what is in season', text: 'Every product shows when it is at its best, so you always buy food at its freshest and tastiest.' },
  { icon: '📅', title: 'Pick a delivery slot', text: 'Choose a morning, afternoon or evening window that suits you. Slots are limited so every box stays fresh.' },
  { icon: '🚚', title: 'We bring it to your door', text: 'Your farmer packs your order and delivers it straight from the farm. No warehouses, no middlemen.' },
];
const REVIEWS = [
  { name: 'Sarah K.', place: 'Dublin 2', text: 'The tomatoes taste like tomatoes again. My weekly box is the highlight of my kitchen.' },
  { name: 'Tom G.', place: 'Galway', text: 'Eggs arrived the same morning they were laid. I love knowing exactly which farm my food comes from.' },
  { name: 'Priya N.', place: 'Cork', text: 'Easy to order, great delivery slots, and the sourdough is unreal. Cannot go back to supermarkets.' },
];

export default function Home() {
  const { list, error } = useProducts();
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const fresh = (list || []).filter(canBuy);
  const farms = groupFarms(list || []);
  const search = (e) => { e.preventDefault(); nav(`/shop?q=${encodeURIComponent(q)}`); };

  return (
    <>
      <section className="hero">
        <div className="hero-in">
          <div className="hero-text">
            <span className="pill">🌾 Local · Seasonal · Fresh</span>
            <h1>Fresh from the farm,<br />straight to your table.</h1>
            <p>Order seasonal vegetables, fruit, eggs and more directly from local farmers. Harvested this week, delivered in the slot you choose.</p>
            <form className="hero-search" onSubmit={search}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tomatoes, eggs, honey..." aria-label="Search produce" />
              <button className="btn">Search</button>
            </form>
            <div className="hero-stats">
              <div><b>{list ? list.length : '30'}+</b><span>Fresh products</span></div>
              <div><b>{farms.length || 4}</b><span>Local farms</span></div>
              <div><b>100%</b><span>Seasonal</span></div>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <span className="float f1">🍅</span><span className="float f2">🥕</span><span className="float f3">🍓</span>
            <span className="float f4">🥚</span><span className="float f5">🌽</span><span className="float f6">🍎</span>
            <div className="hero-card"><span>🧺</span><b>This week's harvest box</b><small>Hand-picked at sunrise</small></div>
          </div>
        </div>
      </section>

      <section className="perks">
        <div><span>🚜</span><b>Direct from farmers</b><small>No middlemen</small></div>
        <div><span>🗓️</span><b>Flexible delivery</b><small>Choose your slot</small></div>
        <div><span>💶</span><b>Fair euro prices</b><small>Farmers set them</small></div>
        <div><span>♻️</span><b>Less waste</b><small>Harvested to order</small></div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Shop by category</h2><Link to="/shop" className="link">View all →</Link></div>
        <div className="cats">
          {CATEGORIES.map((c) => (
            <Link key={c.name} to={`/shop?cat=${encodeURIComponent(c.name)}`} className="cat" style={{ background: `linear-gradient(145deg, ${c.from}, ${c.to})` }}>
              <span>{c.emoji}</span><b>{c.name}</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>In season right now</h2><Link to="/shop" className="link">See everything →</Link></div>
        {error && <p className="err">{error}</p>}
        <div className="grid">
          {!list && !error && Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" />)}
          {fresh.slice(0, 8).map((p) => <ProductCard key={p._id} p={p} />)}
        </div>
      </section>

      <section className="band">
        <div className="section">
          <h2 className="center">How Farm to Table works</h2>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div className="step" key={s.title}><span className="step-n">{i + 1}</span><div className="step-icon">{s.icon}</div><h3>{s.title}</h3><p>{s.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      {farms.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>Meet your farmers</h2><Link to="/farms" className="link">All farms →</Link></div>
          <div className="farms">
            {farms.map((f) => (
              <Link to="/farms" className="farm" key={f.id}>
                <div className="farm-art">{f.products.slice(0, 3).map((p) => <span key={p._id}>{p.emoji}</span>)}</div>
                <h3>{f.farmName}</h3>
                <span className="muted small">📍 {f.location}</span>
                <p>{f.bio}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="center">Loved by local kitchens</h2>
        <div className="reviews">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="review"><div className="stars">★★★★★</div><blockquote>{r.text}</blockquote><figcaption><b>{r.name}</b> · {r.place}</figcaption></figure>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="cta">
          <div><h2>Grow it? Sell it here.</h2><p>Set your own euro prices, list your harvest in minutes and deliver on your schedule. Keep more of what you earn.</p></div>
          <Link to="/register" className="btn btn-light">Become a seller</Link>
        </div>
      </section>
    </>
  );
}
