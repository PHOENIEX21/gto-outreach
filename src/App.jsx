import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import "./App.css";

import heroImage from "./assets/gto-hero.jpg";
import logoImage from "./assets/gto-logo.jpg";

import NotFound from "./pages/NotFound";
import { AppDataProvider } from "./data/AppDataContext";
import { useAppData } from "./data/useAppData";

// Route-level code splitting: each page is loaded on demand to keep the
// initial bundle small and speed up first paint.
const Devotional = lazy(() => import("./pages/Devotional"));
const Community = lazy(() => import("./pages/Community"));
const CommunityWall = lazy(() => import("./pages/CommunityWall"));
const Media = lazy(() => import("./pages/Media"));
const Announcements = lazy(() => import("./pages/Announcements"));
const Join = lazy(() => import("./pages/Join"));
const Member = lazy(() => import("./pages/Member"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const PasswordReset = lazy(() => import("./pages/PasswordReset"));

function ProtectedAdmin() {
  const { admin } = useAppData();
  return admin ? <Admin /> : <Navigate to="/admin-login" replace />;
}

function RecoveryRedirect() {
  const { passwordRecovery } = useAppData();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (passwordRecovery && location.pathname !== "/reset-password") navigate("/reset-password", { replace: true });
  }, [location.pathname, navigate, passwordRecovery]);

  return null;
}

function Home() {
  const { devotionals } = useAppData();
  const featured = devotionals[0];

  return (
    <main className="landing-page">
      <section className="landing-hero" id="home">
        <div className="landing-copy">
          <p className="landing-kicker">GTO · GLAD TIDINGS OUTREACH</p>
          <p className="landing-eyebrow">Mandated to preach the Gospel</p>
          <h1>Take the Gospel<span>beyond the walls.</span></h1>
          <p className="landing-subtitle">A living community for people discovering Christ, growing in the Word, and carrying hope into everyday life.</p>
          <div className="landing-actions">
            <Link to="/devotional" className="landing-primary">Explore today&apos;s Word <span aria-hidden="true">→</span></Link>
            <Link to="/join" className="landing-secondary">Join the outreach</Link>
          </div>
          <p className="landing-scroll-note"><span aria-hidden="true">↓</span> Begin with the Word</p>
        </div>
        <div className="landing-stage">
          <img src={heroImage} alt="Glad Tidings Outreach worship and gospel outreach" className="landing-image" />
          <div className="landing-stage-shade" aria-hidden="true" />
          <div className="landing-stage-label"><span>01</span><span>THE OUTREACH</span></div>
          <div className="landing-video-card">
            <video autoPlay muted loop playsInline preload="metadata" poster={heroImage} aria-label="GTO worship and outreach video">
              <source src="/videos/holiness.mp4" type="video/mp4" />
            </video>
            <span className="landing-video-caption"><span className="landing-live-dot" aria-hidden="true" /> Watch the mission unfold</span>
          </div>
        </div>
      </section>
      <section className="landing-word" aria-labelledby="landing-word-title">
        <div className="landing-word-index"><span>02</span><span>TODAY&apos;S WORD</span></div>
        <div className="landing-word-copy">
          <p className="landing-eyebrow">A moment with God</p>
          <h2 id="landing-word-title">{featured?.scripture || "The Word is alive and speaking."}</h2>
          <p className="landing-word-reference">{featured?.reference || "Glad Tidings Outreach"}</p>
        </div>
        <Link to={featured ? `/devotional?id=${featured.id}` : "/devotional"} className="landing-word-link">Read today&apos;s devotional <span aria-hidden="true">↗</span></Link>
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
  const { member, mediaUpdateNotice, clearMediaUpdateNotice, theme, toggleTheme, unreadNotifications, signOutMember } = useAppData();

  const openAnnouncements = () => {
    setMenuOpen(false);
    clearMediaUpdateNotice();
  };

  return (
    <header className="gto-header landing-header">
      <Link to="/" className="brand-link" aria-label="GTO home">
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

        {!member && <Link to="/join" className="header-button">Join Us</Link>}
        {member && <div className="member-header-tools"><Link to="/member" className="member-header-link"><span className="header-member-avatar">{member.avatarUrl ? <img src={member.avatarUrl} alt="" /> : member.name.slice(0, 1).toUpperCase()}</span><span>{member.name.split(" ")[0]}&apos;s space</span>{unreadNotifications > 0 && <span className="member-alert-badge" aria-label={`${unreadNotifications} unread notifications`}>{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>}</Link><button type="button" className="header-signout" onClick={signOutMember}>Sign out</button></div>}
      <button
        type="button"
        className="theme-toggle"
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        onClick={toggleTheme}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
      <button type="button" className="menu-button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>☰</button>

      {menuOpen && <nav className="mobile-menu">
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/devotional" onClick={() => setMenuOpen(false)}>Devotional</Link>
        <Link to="/community" onClick={() => setMenuOpen(false)}>Community</Link>
        <Link to="/media" onClick={() => setMenuOpen(false)}>Media</Link>
        <Link to="/announcements" onClick={openAnnouncements}>Announcements {mediaUpdateNotice && <span className="header-update-dot">New</span>}</Link>
        <Link to="/member" onClick={() => setMenuOpen(false)}>{member ? `${member.name.split(" ")[0]}'s space` : "Member space"}{member && unreadNotifications > 0 && <span className="header-update-dot">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>}</Link>
        {member && <button type="button" className="mobile-signout" onClick={() => { setMenuOpen(false); signOutMember(); }}>Sign out</button>}
        <Link to="/admin-login" onClick={() => setMenuOpen(false)}>Staff sign in</Link>
        <button type="button" className="mobile-theme-toggle" onClick={toggleTheme}>{theme === "dark" ? "☀️ Use light theme" : "🌙 Use dark theme"}</button>
      </nav>}
    </header>
  );
}

function PageLoading() {
  return <p className="content-loading" role="status">Loading GTO...</p>;
}

function BackendStatus() {
  const { backendError, clearBackendError } = useAppData();
  if (!backendError) return null;
  return <div className="backend-error" role="alert"><span>{backendError}</span><button type="button" onClick={clearBackendError} aria-label="Dismiss backend error">×</button></div>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <AppDataProvider>
      <div className="gto-app">
        <RecoveryRedirect />
        <SiteHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <BackendStatus />
        <Suspense fallback={<PageLoading />}>
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
          <Route path="/reset-password" element={<PasswordReset />} />
          <Route path="/admin" element={<ProtectedAdmin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>

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
      <Link to="/community-wall">Community Wall</Link>
      <Link to="/media">Media</Link>
      <Link to="/announcements">Announcements</Link>
    </div>

    <div className="footer-links">
      <h3>Connect</h3>

      <Link to="/join">Join the Community</Link>
      <Link to="/member">Member Space</Link>
      <Link to="/devotional">Today&apos;s Word</Link>
      <Link to="/media">GTO Media</Link>
      <a className="social-link" href="https://www.facebook.com/profile.php?id=61559895093699" target="_blank" rel="noopener noreferrer" aria-label="Open Facebook profile 01"><span className="social-logo facebook-logo" aria-hidden="true">f</span><span><strong>Facebook</strong><small>Profile 01 · Visit page</small></span></a>
      <a className="social-link" href="https://www.facebook.com/GTIPGGTIPG" target="_blank" rel="noopener noreferrer" aria-label="Open GTIPG Facebook page"><span className="social-logo facebook-logo" aria-hidden="true">f</span><span><strong>GTIPG</strong><small>Facebook · Visit page</small></span></a>
      <a className="social-link" href="https://www.facebook.com/profile.php?id=61571096139841" target="_blank" rel="noopener noreferrer" aria-label="Open Facebook profile 03"><span className="social-logo facebook-logo" aria-hidden="true">f</span><span><strong>Facebook</strong><small>Profile 03 · Visit page</small></span></a>
      <a className="social-link" href="https://www.facebook.com/profile.php?id=61557515515868" target="_blank" rel="noopener noreferrer" aria-label="Open Facebook profile 04"><span className="social-logo facebook-logo" aria-hidden="true">f</span><span><strong>Facebook</strong><small>Profile 04 · Visit page</small></span></a>
      <a className="social-link" href="https://www.tiktok.com/@ifeomabasil11" target="_blank" rel="noopener noreferrer" aria-label="Open Ifeoma Basil TikTok account"><span className="social-logo tiktok-logo" aria-hidden="true">♪</span><span><strong>Ifeoma Basil</strong><small>TikTok · Visit account</small></span></a>
      <a className="social-link" href="https://www.tiktok.com/@gladtidingsoutreach" target="_blank" rel="noopener noreferrer" aria-label="Open Glad Tidings Outreach TikTok account"><span className="social-logo tiktok-logo" aria-hidden="true">♪</span><span><strong>Glad Tidings Outreach</strong><small>TikTok · Visit account</small></span></a>
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

        <nav className="bottom-nav" aria-label="Primary navigation">
          <NavLink to="/" end><span aria-hidden="true">⌂</span><span className="bottom-nav-label">Home</span></NavLink>
          <NavLink to="/devotional"><span aria-hidden="true">◫</span><span className="bottom-nav-label">Devotional</span></NavLink>
          <NavLink to="/community"><span aria-hidden="true">♧</span><span className="bottom-nav-label">Community</span></NavLink>
          <NavLink to="/media"><span aria-hidden="true">▶</span><span className="bottom-nav-label">Media</span></NavLink>
        </nav>
      </div>
      </AppDataProvider>
    </BrowserRouter>
  );
}

export default App;
