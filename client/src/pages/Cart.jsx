import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductArt from '../components/ProductArt';
import { eur, errMsg, useAuth, useCart } from '../store';

export default function Cart() {
  const { user } = useAuth();
  const { items, setQty, remove, clear, total, count } = useCart();
  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);

  useEffect(() => { api.get('/slots').then((r) => setSlots(r.data)).catch(() => {}); }, []);

  const place = async () => {
    setBusy(true); setErr('');
    try {
      const { data } = await api.post('/orders', { items: items.map((i) => ({ productId: i.id, qty: i.qty })), slotId, address });
      setDone(data); clear();
    } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };

  if (done) return (
    <section className="section narrow center">
      <div className="empty"><span>🎉</span><h2>Order placed. Thank you!</h2>
        <p className="muted">Your farmer has been notified. We will deliver in your {done.slotLabel} slot. Total: <b>{eur(done.total)}</b></p>
        <div className="row"><Link to="/orders" className="btn">Track my order</Link><Link to="/shop" className="btn btn-ghost">Keep shopping</Link></div></div>
    </section>
  );
  if (!items.length) return (
    <section className="section narrow center"><div className="empty"><span>🛒</span><h2>Your cart is empty</h2><p className="muted">Fill it with something fresh and in season.</p><Link to="/shop" className="btn">Browse produce</Link></div></section>
  );

  const farmName = items[0].farmName;
  const slotsByDate = slots.reduce((m, s) => ({ ...m, [s.date]: [...(m[s.date] || []), s] }), {});
  return (
    <section className="section">
      <h1>Your cart</h1>
      <p className="muted">Ordering from <b>{farmName}</b> · {count} item{count === 1 ? '' : 's'}</p>
      <div className="cart-layout">
        <div>
          {items.map((i) => (
            <div className="cart-row" key={i.id}>
              <div className="cart-art"><ProductArt product={i} size="thumb" /></div>
              <div className="cart-info"><b>{i.name}</b><span className="muted small">{eur(i.price)} / {i.unit}</span></div>
              <div className="stepper stepper-sm"><button onClick={() => setQty(i.id, i.qty - 1)}>−</button><b>{i.qty}</b><button onClick={() => setQty(i.id, i.qty + 1)}>+</button></div>
              <b className="cart-line">{eur(i.price * i.qty)}</b>
              <button className="icon-btn" onClick={() => remove(i.id)} aria-label={`Remove ${i.name}`}>✕</button>
            </div>
          ))}
          <button className="link-btn" onClick={clear}>Empty cart</button>
        </div>
        <aside className="summary">
          <h3>Checkout</h3>
          <div className="sum-row"><span>Subtotal</span><b>{eur(total)}</b></div>
          <div className="sum-row"><span>Delivery</span><b className="ok">Free</b></div>
          <div className="sum-row sum-total"><span>Total</span><b>{eur(total)}</b></div>
          {!user ? <p className="notice">Please <Link to="/login">log in</Link> or <Link to="/register">create a free account</Link> to place your order.</p>
            : user.role !== 'buyer' ? <p className="notice">Only buyer accounts can place orders.</p> : (
              <>
                <label className="label">Delivery slot</label>
                <select value={slotId} onChange={(e) => setSlotId(e.target.value)}>
                  <option value="">Choose a delivery slot</option>
                  {Object.entries(slotsByDate).map(([date, list]) => (
                    <optgroup key={date} label={new Date(date).toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'short' })}>
                      {list.map((s) => <option key={s._id} value={s._id}>{s.window} · {s.capacity - s.booked} left</option>)}
                    </optgroup>
                  ))}
                </select>
                <label className="label">Delivery address</label>
                <input placeholder="Street, town, county, Eircode" value={address} onChange={(e) => setAddress(e.target.value)} />
                {err && <p className="err">{err}</p>}
                <button className="btn btn-lg" disabled={!slotId || !address || busy} onClick={place}>{busy ? 'Placing order...' : `Place order · ${eur(total)}`}</button>
                <p className="muted small center">Payment on delivery. Prices are confirmed by the server when you order.</p>
              </>
            )}
        </aside>
      </div>
    </section>
  );
}
