import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, CartProvider, useAuth } from './store';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Farmer from './pages/Farmer';
import Auth from './pages/Auth';
import Farms from './pages/Farms';
import About from './pages/About';

function ScrollTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0); }, [pathname]); return null; }

function Need({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return !role || user.role === role ? children : <Navigate to="/" replace />;
}

function Shell() {
  return (
    <>
      <ScrollTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/farms" element={<Farms />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth register />} />
          <Route path="/orders" element={<Need><Orders /></Need>} />
          <Route path="/farmer" element={<Need role="farmer"><Farmer /></Need>} />
          <Route path="*" element={<section className="section center"><h1>Page not found</h1><Link to="/" className="btn">Go home</Link></section>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return <AuthProvider><CartProvider><BrowserRouter><Shell /></BrowserRouter></CartProvider></AuthProvider>;
}
