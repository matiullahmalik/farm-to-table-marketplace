import { Link } from 'react-router-dom';
import ProductArt from '../components/ProductArt';
import { eur, groupFarms, canBuy, useProducts } from '../store';

export default function Farms() {
  const { list, error } = useProducts();
  const farms = groupFarms(list || []);
  return (
    <section className="section">
      <div className="page-head"><h1>Meet our farms</h1><p className="muted">Small, local and proud. Every product on the marketplace comes from one of these farms.</p></div>
      {error && <p className="err">{error}</p>}
      {!list && !error && <div className="skeleton" style={{ height: 240 }} />}
      {farms.map((f) => (
        <article className="farm-block" key={f.id}>
          <div className="farm-intro">
            <div className="farm-badge">🚜</div>
            <h2>{f.farmName}</h2>
            <span className="muted">📍 {f.location} · {f.products.length} products</span>
            <p>{f.bio}</p>
            <Link to={`/shop`} className="link">Shop all produce →</Link>
          </div>
          <div className="farm-products">
            {f.products.filter(canBuy).slice(0, 4).map((p) => (
              <Link to={`/product/${p._id}`} key={p._id} className="mini">
                <ProductArt product={p} size="thumb" /><b>{p.name}</b><span>{eur(p.price)} / {p.unit}</span>
              </Link>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
