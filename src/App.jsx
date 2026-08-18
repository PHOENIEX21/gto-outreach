import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import heroImage from "./assets/gto-hero.jpg";
import logoImage from "./assets/gto-logo.jpg";

import Devotional from "./pages/Devotional";
import Community from "./pages/Community";
import Media from "./pages/Media";

function Home() {
  return (
    <>
      <section className="hero" id="home">
  <div className="hero-content">
    <p className="eyebrow">GLAD TIDINGS OUTREACH</p>

    <h2>
      Taking Christ
      <br />
      <span>to the world.</span>
    </h2>

    <p className="hero-text">
      We are mandated to preach the Gospel, reach hearts,
      transform lives, and raise believers who live for Christ.
    </p>

    <div className="hero-buttons">
      <a href="/devotional" className="primary-button">
        Read Today's Word →
      </a>

      <a href="/community" className="secondary-button">
        Join the Community
      </a>
    </div>

    <div className="hero-stats">
      <div>
        <strong>01</strong>
        <span>Faith</span>
      </div>

      <div>
        <strong>02</strong>
        <span>Outreach</span>
      </div>

      <div>
        <strong>03</strong>
        <span>Transformation</span>
      </div>
    </div>
  </div>

  <div className="hero-visual">
    <img
      src={heroImage}
      alt="GTO Gospel outreach and worship"
      className="hero-image"
    />

    <div className="hero-quote">
      <span>“</span>
      <p>Go into all the world and preach the gospel.</p>
      <small>Mark 16:15</small>
    </div>
  </div>

</section>

      <section className="devotional-feature">
  <div className="devotional-heading">
    <p className="eyebrow">TODAY'S WORD</p>

    <h2>Start your day with God's Word.</h2>

    <p>
      A moment in God's presence can change the direction
      of your entire day.
    </p>
  </div>

  <div className="word-card">
    <div className="word-top">
      <span>✦ DAILY SCRIPTURE</span>
      <span>MARK 16:15</span>
    </div>

    <h3>Go into all the world</h3>

    <p className="scripture">
      "Go into all the world and preach the gospel to all creation."
    </p>

    <div className="word-bottom">
      <span>Today's Word</span>

      <a href="/devotional">
        Read Devotional →
      </a>
    </div>
  </div>
</section>

      <section className="welcome-section">
  <div className="welcome-intro">
    <div>
      <p className="eyebrow">WELCOME TO GTO</p>

      <h2>
        We exist to make
        <span> Christ known.</span>
      </h2>
    </div>

    <p className="welcome-description">
      Glad Tidings Outreach is a Gospel-focused community committed
      to reaching people, building believers, and taking the message
      of Jesus Christ beyond the walls.
    </p>
  </div>

  <div className="feature-grid">
    <div className="feature-card">
      <div className="feature-number">01</div>

      <div className="feature-icon">📖</div>

      <h3>The Word</h3>

      <p>
        Grow deeper through Scripture, devotionals and biblical
        encouragement for everyday life.
      </p>

      <a href="/devotional">Explore Devotionals →</a>
    </div>

    <div className="feature-card">
      <div className="feature-number">02</div>

      <div className="feature-icon">🤝</div>

      <h3>The Community</h3>

      <p>
        Connect with believers, build meaningful relationships
        and grow together in faith.
      </p>

      <a href="/community">Join the Community →</a>
    </div>

    <div className="feature-card">
      <div className="feature-number">03</div>

      <div className="feature-icon">🌍</div>

      <h3>The Mission</h3>

      <p>
        Take the Gospel beyond the walls and become part of
        God's mission to reach the world.
      </p>

      <a href="/media">Explore GTO Media →</a>
    </div>
  </div>
</section>
    </>
  );
}

function App() { 
  const [menuOpen, setMenuOpen] =
useState(false);
 
return (
    <BrowserRouter>
      <div className="gto-app">
        
        <header className="gto-header">
  <a href="/" className="brand-link">
    <img
    src={logoImage}
    alt="Glad Tidings Outreach Logo"
    className="gto-logo"/>

    <div className="brand">
      <h1>GTO</h1>
      <span>Glad Tidings Outreach</span>
    </div>
  </a>

  <nav className="desktop-nav">
    <a href="/">Home</a>
    <a href="/devotional">Devotional</a>
    <a href="/community">Community</a>
    <a href="/media">Media</a>
  </nav>

  <a href="/community" className="header-button">
    Join Us
  </a>

  <button
  type="button"
  className="menu-button"
  aria-label="Open menu"
  onClick={() => setMenuOpen(true)}
>
  ☰
</button>

  {menuOpen && (
    <nav className="mobile-menu">
      <a href="/" onClick={() => setMenuOpen(false)}>
        Home
      </a>

      <a href="/devotional" onClick={() => setMenuOpen(false)}>
        Devotional
      </a>

      <a href="/community" onClick={() => setMenuOpen(false)}>
        Community
      </a>

      <a href="/media" onClick={() => setMenuOpen(false)}>
        Media
      </a>
    </nav>
  )}
</header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/devotional" element={<Devotional />} />
          <Route path="/community" element={<Community />} />
          <Route path="/media" element={<Media />} />
        </Routes>

<footer className="gto-footer">
  <div className="footer-main">
    <div className="footer-brand">
      <img
    src={logoImage}
    alt="Glad Tidings Outreach Logo"
    className="gto-logo"/>

      <h2>GTO</h2>

      <p>Glad Tidings Outreach</p>

      <span>
        Mandated to preach the Gospel, reach hearts
        and transform lives.
      </span>
    </div>

    <div className="footer-links">
      <h3>Explore</h3>

      <a href="/">Home</a>
      <a href="/devotional">Devotional</a>
      <a href="/community">Community</a>
      <a href="/media">Media</a>
    </div>

    <div className="footer-links">
      <h3>Connect</h3>

      <a href="/community">Join the Community</a>
      <a href="/devotional">Today's Word</a>
      <a href="/media">GTO Media</a>
    </div>
  </div>

  <div className="footer-bottom">
    <span>© 2026 Glad Tidings Outreach</span>
    <span>Built to spread the Gospel.</span>
  </div>
</footer>

        <nav className="bottom-nav">
          <a href="/">Home</a>
          <a href="/devotional">Devotional</a>
          <a href="/community">Community</a>
          <a href="/media">Media</a>
        </nav>
      </div>
    </BrowserRouter>
  );
}

export default App;