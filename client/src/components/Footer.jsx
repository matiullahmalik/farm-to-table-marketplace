import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-in">
        <div>
          <div className="brand brand-dark"><span className="brand-mark">🌱</span> Farm to Table</div>
          <p className="muted">Seasonal produce straight from local farms to your kitchen. Fair prices for farmers, fresher food for you.</p>
        </div>
        <div><h4>Shop</h4><Link to="/shop">All produce</Link><Link to="/shop?cat=Vegetables">Vegetables</Link><Link to="/shop?cat=Fruits">Fruits</Link><Link to="/shop?cat=Dairy%20%26%20Eggs">Dairy &amp; eggs</Link></div>
        <div><h4>Marketplace</h4><Link to="/farms">Our farms</Link><Link to="/about">How it works</Link><Link to="/register">Sell your harvest</Link></div>
        <div><h4>Contact</h4><span>hello@farmtotable.example</span><span>Mon-Sat, 9am to 6pm</span><span>Dublin, Ireland</span></div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} Farm to Table Marketplace · All prices in euro (€)</div>
    </footer>
  );
}
