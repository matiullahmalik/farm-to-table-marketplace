import { catOf } from '../store';

// Illustrated product tile. If a product has a real photo URL it is shown instead.
export default function ProductArt({ product, size = 'card' }) {
  const cat = catOf(product.category);
  if (product.imageUrl) return <img className={`art art-${size}`} src={product.imageUrl} alt={product.name} loading="lazy" />;
  return (
    <div className={`art art-${size}`} style={{ background: `linear-gradient(145deg, ${cat.from}, ${cat.to})` }} role="img" aria-label={product.name}>
      <i className="blob b1" /><i className="blob b2" /><i className="blob b3" />
      <span className="art-emoji">{product.emoji || cat.emoji}</span>
    </div>
  );
}
