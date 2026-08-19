import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import "./App.css";

import heroImage from "./assets/gto-hero.jpg";
import logoImage from "./assets/gto-logo.jpg";

import Devotional from "./pages/Devotional";
import Community from "./pages/Community";
import CommunityWall from "./pages/CommunityWall";
import Media from "./pages/Media";
import Announcements from "./pages/Announcements";
import Join from "./pages/Join";
import Member from "./pages/Member";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import { AppDataProvider } from "./data/AppDataContext";
import { useAppData } from "./data/useAppData";

function ProtectedAdmin() {
  const { admin } = useAppData();
  return admin ? <Admin /> : <Navigate to="/admin-login" replace />;
}

function Home() {
  return (
    <main className="landing-page">
      <section className="landing-hero" id="home">
        <svg className="landing-rays" viewBox="0 0 640 640" aria-hidden="true">
          <circle className="ray-one" cx="320" cy="640" r="180" />
          <circle className="ray-two" cx="320" cy="640" r="260" />
          <circle className="ray-three" cx="320" cy="640" r="340" />
        </svg>
        <div className="landing-copy">
          <p className="landing-eyebrow">Mandated to preach the gospel</p>
          <h1>Taking Christ<span>to the world</span></h1>
          <p className="landing-subtitle">We reach hearts, transform lives, and raise believers who live boldly for Christ.</p>
          <div className="landing-actions">
            <Link to="/devotional" className="landing-primary">Read today&apos;s word <span aria-hidden="true">→</span></Link>
            <Link to="/join" className="landing-secondary">Join the community</Link>
          </div>
        </div>
        <div className="landing-visual">
          <img src={heroImage} alt="Glad Tidings Outreach worship and gospel outreach" className="landing-image" />
          <div className="landing-quote">
            <span aria-hidden="true">&quot;</span>
            <p>Go into all the world and preach the gospel.</p>
            <small>Mark 16:15</small>
          </div>
        </div>
      </section>
      <section className="landing-stats" aria-label="Glad Tidings Outreach impact">
        <div><strong>40+</strong><span>Nations reached</span></div>
        <div><strong>12k</strong><span>Community members</span></div>
        <div><strong>Daily</strong><span>Devotionals</span></div>
      </section>

      <section className="purpose-section" id="mission">
        <div className="purpose-intro">
          <p className="landing-eyebrow">Our purpose</p>
          <h2>One Gospel.<br /><span>One family.</span></h2>
          <p>
            Glad Tidings Outreach exists to keep the Great Commission at the heart of everyday faith,
            bringing people back to Christ and building a family that serves together.
          </p>
        </div>

        <div className="purpose-grid">
          <article className="purpose-card purpose-card-featured">
            <span className="purpose-number">01</span>
            <p className="purpose-label">Our mission</p>
            <h3>Remind. Reconcile. Harness.</h3>
            <p>
              To remind all of the Great Commission, reconcile lost souls back to Christ,
              and harness the essence of the Body of Christ. We are one.
            </p>
            <Link to="/media">Explore the mission <span aria-hidden="true">→</span></Link>
          </article>

          <article className="purpose-card">
            <span className="purpose-number">02</span>
            <p className="purpose-label">Our vision</p>
            <h3>Believe. Belong. Become.</h3>
            <p>
              We are committed to helping every person believe in Jesus Christ, belong to a family,
              become a disciple, and build God&apos;s Kingdom.
            </p>
            <Link to="/community">Find your family <span aria-hidden="true">→</span></Link>
          </article>
        </div>
      </section>

      <section className="landing-invitation">
        <div>
          <p className="landing-eyebrow">Your next step</p>
          <h2>There is a place for you in the story.</h2>
          <p>Start with the Word, find your people, and carry the Gospel beyond the walls.</p>
        </div>
        <div className="landing-invitation-actions">
          <Link to="/devotional" className="landing-primary">Start with today&apos;s word <span aria-hidden="true">→</span></Link>
          <Link to="/media" className="landing-secondary">Watch GTO Media</Link>
        </div>
      </section>
    </main>
  );
}

function SiteHeader({ menuOpen, setMenuOpen }) {
  const { mediaUpdateNotice, clearMediaUpdateNotice } = useAppData();

  const openAnnouncements = () => {
    setMenuOpen(false);
    clearMediaUpdateNotice();
  };

  return (
    <header className="gto-header landing-header">
      <Link to="/" className="brand-link">
        <img src={logoImage} alt="Glad Tidings Outreach logo" className="dashboard-logo" />
        <div className="brand"><h1>Glad Tidings</h1><span>Outreach</span></div>
      </Link>

      <nav className="desktop-nav">
        <Link to="/">Home</Link>
        <Link to="/devotional">Devotional</Link>
        <Link to="/community">Community</Link>
        <Link to="/media">Media</Link>
        <Link to="/announcements" onClick={clearMediaUpdateNotice}>Announcements {mediaUpdateNotice && <span className="header-update-dot" aria-label="New update">•</span>}</Link>
        <Link to="/admin-login" className="staff-nav-link">Staff</Link>
      </nav>

      <Link to="/join" className="header-button">Join Us</Link>
      <Link to="/member" className="member-header-link">Member space</Link>
      <button type="button" className="menu-button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>☰</button>

      {menuOpen && <nav className="mobile-menu">
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/devotional" onClick={() => setMenuOpen(false)}>Devotional</Link>
        <Link to="/community" onClick={() => setMenuOpen(false)}>Community</Link>
        <Link to="/media" onClick={() => setMenuOpen(false)}>Media</Link>
        <Link to="/announcements" onClick={openAnnouncements}>Announcements {mediaUpdateNotice && <span className="header-update-dot">New</span>}</Link>
        <Link to="/admin-login" onClick={() => setMenuOpen(false)}>Staff sign in</Link>
      </nav>}
    </header>
  );
}

function App() {
  const [menuOpen, setMenuOpen] =
useState(false);
 
return (
    <BrowserRouter>
      <AppDataProvider>
      <div className="gto-app">
        
        <SiteHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/devotional" element={<Devotional />} />
          <Route path="/community" element={<Community />} />
            <Route path="/community-wall" element={<CommunityWall />} />
          <Route path="/media" element={<Media />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/join" element={<Join />} />
          <Route path="/member" element={<Member />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedAdmin />} />
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

      <Link to="/">Home</Link>
      <Link to="/devotional">Devotional</Link>
      <Link to="/community">Community</Link>
      <Link to="/media">Media</Link>
    </div>

    <div className="footer-links">
      <h3>Connect</h3>

      <Link to="/join">Join the Community</Link>
      <Link to="/member">Member Space</Link>
      <Link to="/devotional">Today&apos;s Word</Link>
      <Link to="/media">GTO Media</Link>
    </div>

    <div className="footer-links">
      <h3>GTO Staff</h3>
      <Link to="/admin-login">Staff sign in</Link>
    </div>

  </div>

  <div className="footer-bottom">
    <span>© 2026 Glad Tidings Outreach</span>
    <span>Built to spread the Gospel.</span>
  </div>
</footer>

        <nav className="bottom-nav">
          <Link to="/">Home</Link>
          <Link to="/devotional">Devotional</Link>
          <Link to="/community">Community</Link>
          <Link to="/media">Media</Link>
        </nav>
      </div>
      </AppDataProvider>
    </BrowserRouter>
  );
}

export default App;