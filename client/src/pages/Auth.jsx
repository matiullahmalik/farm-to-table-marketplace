import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { errMsg, useAuth } from '../store';

const DEMOS = [
  { label: 'Demo buyer', email: 'buyer1@farmtable.test' },
  { label: 'Demo farmer', email: 'aoife@farmtable.test' },
];

export default function Auth({ register }) {
  const { save } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'buyer', farmName: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const { data } = await api.post(register ? '/auth/register' : '/auth/login', f);
      save(data); nav(data.user.role === 'farmer' ? '/farmer' : '/shop');
    } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };

  return (
    <section className="auth">
      <div className="auth-side">
        <h2>{register ? 'Join the harvest' : 'Welcome back'}</h2>
        <p>{register ? 'Create a free account to order fresh produce, or list your own harvest as a farmer.' : 'Log in to order seasonal produce and track your deliveries.'}</p>
        <div className="auth-emoji">🍅 🥕 🥚 🍓 🌽</div>
      </div>
      <form onSubmit={submit} className="auth-form">
        <h1>{register ? 'Create account' : 'Log in'}</h1>
        {register && (
          <>
            <div className="role-pick">
              <button type="button" className={f.role === 'buyer' ? 'on' : ''} onClick={() => setF({ ...f, role: 'buyer' })}>🛒 I want to buy</button>
              <button type="button" className={f.role === 'farmer' ? 'on' : ''} onClick={() => setF({ ...f, role: 'farmer' })}>🚜 I want to sell</button>
            </div>
            <input placeholder="Full name" value={f.name} onChange={set('name')} required />
            {f.role === 'farmer' && <input placeholder="Farm name" value={f.farmName} onChange={set('farmName')} required />}
          </>
        )}
        <input type="email" placeholder="Email address" value={f.email} onChange={set('email')} required />
        <input type="password" placeholder="Password (8+ characters)" value={f.password} onChange={set('password')} required />
        {err && <p className="err">{err}</p>}
        <button className="btn btn-lg" disabled={busy}>{busy ? 'Please wait...' : register ? 'Create account' : 'Log in'}</button>
        {!register && (
          <div className="demo">
            <span className="muted small">Try the demo data (password: password123)</span>
            <div className="row">{DEMOS.map((d) => <button type="button" key={d.email} className="btn btn-ghost btn-sm" onClick={() => setF({ ...f, email: d.email, password: 'password123' })}>{d.label}</button>)}</div>
          </div>
        )}
        <p className="muted small center">{register ? <>Already have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</p>
      </form>
    </section>
  );
}
