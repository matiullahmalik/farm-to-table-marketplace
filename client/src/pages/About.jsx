import { Link } from 'react-router-dom';

const VALUES = [
  { icon: '🌍', title: 'Local first', text: 'Our farms are all within a few hours of the customers they serve, so food travels less and tastes better.' },
  { icon: '🤝', title: 'Fair to farmers', text: 'Farmers set their own euro prices and keep the biggest share of every sale.' },
  { icon: '🍂', title: 'Truly seasonal', text: 'We only sell produce while it is in season. If it is not at its best, it is not on the shelf.' },
];
const FAQ = [
  ['How does delivery work?', 'At checkout you choose a morning, afternoon or evening slot. Each slot has limited capacity so your order stays fresh and on time.'],
  ['Can I order from more than one farm?', 'One order contains products from one farm, so each farmer can pack and deliver their own produce. You can place several orders.'],
  ['What does "in season" mean?', 'Every product shows the dates it is at its best. Items outside their season appear as "Coming soon" or "Out of season" and cannot be ordered.'],
  ['How do I pay?', 'This demo uses payment on delivery. Prices are always in euro and are confirmed by the server when you place the order.'],
];

export default function About() {
  return (
    <>
      <section className="hero hero-small"><div className="hero-in"><div className="hero-text"><span className="pill">Our story</span><h1>Good food starts close to home.</h1>
        <p>Farm to Table connects people who love good food with the farmers who grow it. No warehouses, no long journeys. Just fresh, seasonal produce at fair prices.</p></div></div></section>
      <section className="section"><div className="steps">{VALUES.map((v) => <div className="step" key={v.title}><div className="step-icon">{v.icon}</div><h3>{v.title}</h3><p>{v.text}</p></div>)}</div></section>
      <section className="section narrow">
        <h2 className="center">Questions, answered</h2>
        {FAQ.map(([q, a]) => <details className="faq" key={q}><summary>{q}</summary><p>{a}</p></details>)}
      </section>
      <section className="section"><div className="cta"><div><h2>Ready to taste the difference?</h2><p>Browse this week's harvest and book your first delivery.</p></div><Link to="/shop" className="btn btn-light">Start shopping</Link></div></section>
    </>
  );
}
