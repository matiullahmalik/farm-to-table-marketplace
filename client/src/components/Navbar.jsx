import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, useCart } from '../store';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  return (
    <header className="nav">
      <div className="nav-in">
        <Link to="/" className="brand"><span className="brand-mark">🌱</span> Farm to Table</Link>
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/farms">Our farms</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
        <div className="nav-right">
          {user?.role !== 'farmer' && <Link to="/cart" className="cart-link" aria-label="Cart">🛒{count > 0 && <b className="cart-count">{count}</b>}</Link>}
          {user && <NavLink to="/orders" className="nav-text">Orders</NavLink>}
          {user?.role === 'farmer' && <NavLink to="/farmer" className="nav-text">Dashboard</NavLink>}
          {user ? (
            <button className="btn btn-light btn-sm" onClick={() => { logout(); nav('/'); }}>Log out ({user.name.split(' ')[0]})</button>
          ) : (
            <>
              <Link to="/login" className="nav-text">Log in</Link>
              <Link to="/register" className="btn btn-light btn-sm">Join free</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
