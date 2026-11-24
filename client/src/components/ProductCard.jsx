import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductArt from './ProductArt';
import { availability, canBuy, eur, useAuth, useCart } from '../store';

export default function ProductCard({ p }) {
  const { user } = useAuth();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const a = availability(p);
  const onAdd = () => { if (add(p, 1)) { setAdded(true); setTimeout(() => setAdded(false), 1300); } };
  return (
    <article className="pcard">
      <Link to={`/product/${p._id}`} className="pcard-top">
        <ProductArt product={p} />
        <span className={`badge badge-${a.key}`}>{a.label}</span>
      </Link>
      <div className="pcard-body">
        <span className="pcard-cat">{p.category}</span>
        <Link to={`/product/${p._id}`} className="pcard-name">{p.name}</Link>
        <span className="muted small">🌱 {p.farmer?.farmName || p.farmer?.name}</span>
        <div className="pcard-bottom">
          <span className="price">{eur(p.price)}<small> / {p.unit}</small></span>
          {user?.role !== 'farmer' && (
            <button className={`btn btn-sm ${added ? 'btn-ok' : ''}`} disabled={!canBuy(p)} onClick={onAdd}>
              {added ? 'Added ✓' : canBuy(p) ? 'Add' : 'Unavailable'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
