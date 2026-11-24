import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { eur, fmtDate, useAuth } from '../store';

const FLOW = ['Placed', 'Confirmed', 'Out for delivery', 'Delivered'];

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const load = () => api.get('/orders').then((r) => setOrders(r.data)).catch(() => setOrders([]));
  useEffect(() => { load(); }, []);
  const advance = async (id) => { await api.patch(`/orders/${id}/status`); load(); };

  return (
    <section className="section narrow">
      <h1>{user.role === 'farmer' ? 'Incoming orders' : 'My orders'}</h1>
      {!orders && <div className="skeleton" style={{ height: 160 }} />}
      {orders && !orders.length && <div className="empty"><span>📦</span><h3>No orders yet</h3><p className="muted">When orders arrive they will appear here.</p>{user.role === 'buyer' && <Link to="/shop" className="btn">Start shopping</Link>}</div>}
      {orders?.map((o) => {
        const step = FLOW.indexOf(o.status);
        return (
          <div className="order" key={o._id}>
            <div className="order-head">
              <div><b>Order #{o._id.slice(-6).toUpperCase()}</b><span className="muted small"> · placed {fmtDate(o.createdAt)}</span></div>
              <b>{eur(o.total)}</b>
            </div>
            <div className="track">
              {FLOW.map((s, i) => <div key={s} className={`track-step ${i <= step ? 'done' : ''}`}><i>{i < step ? '✓' : i + 1}</i><span>{s}</span></div>)}
            </div>
            <ul className="order-items">{o.items.map((i) => <li key={i.name}><span>{i.name} × {i.qty}</span><span>{eur(i.price * i.qty)}</span></li>)}</ul>
            <p className="muted small">🚚 {o.slotLabel} · 📍 {o.address}</p>
            {user.role === 'farmer' && o.status !== 'Delivered' && <button className="btn btn-sm" onClick={() => advance(o._id)}>Move to "{FLOW[step + 1]}"</button>}
          </div>
        );
      })}
    </section>
  );
}
