import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, availability, useProducts } from '../store';

export default function Shop() {
  const { list, error } = useProducts();
  const [params, setParams] = useSearchParams();
  const [inSeason, setInSeason] = useState(true);
  const [sort, setSort] = useState('featured');
  const q = params.get('q') || '';
  const cat = params.get('cat') || '';
  const set = (k, v) => { const n = new URLSearchParams(params); v ? n.set(k, v) : n.delete(k); setParams(n); };

  const shown = useMemo(() => {
    let r = (list || []).filter((p) => (!inSeason || ['ok', 'low'].includes(availability(p).key))
      && (!cat || p.category === cat) && (!q || p.name.toLowerCase().includes(q.toLowerCase())));
    if (sort === 'low') r = [...r].sort((a, b) => a.price - b.price);
    if (sort === 'high') r = [...r].sort((a, b) => b.price - a.price);
    if (sort === 'az') r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    return r;
  }, [list, inSeason, cat, q, sort]);

  return (
    <section className="section">
      <div className="page-head"><h1>Fresh produce</h1><p className="muted">Straight from local farms. All prices in euro (€).</p></div>
      <div className="toolbar">
        <input className="search" placeholder="Search produce..." value={q} onChange={(e) => set('q', e.target.value)} />
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="featured">Sort: Featured</option><option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option><option value="az">Name: A to Z</option>
        </select>
        <label className="toggle"><input type="checkbox" checked={inSeason} onChange={(e) => setInSeason(e.target.checked)} /> In season now</label>
      </div>
      <div className="chips">
        <button className={`chip ${!cat ? 'on' : ''}`} onClick={() => set('cat', '')}>All</button>
        {CATEGORIES.map((c) => <button key={c.name} className={`chip ${cat === c.name ? 'on' : ''}`} onClick={() => set('cat', c.name)}>{c.emoji} {c.name}</button>)}
      </div>
      {error && <p className="err">{error}</p>}
      {list && <p className="muted small">{shown.length} product{shown.length === 1 ? '' : 's'}</p>}
      <div className="grid">
        {!list && !error && Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" />)}
        {shown.map((p) => <ProductCard key={p._id} p={p} />)}
      </div>
      {list && !shown.length && <div className="empty"><span>🧺</span><h3>Nothing matches your search</h3><p className="muted">Try another category, or untick "In season now" to see what is coming soon.</p></div>}
    </section>
  );
}
