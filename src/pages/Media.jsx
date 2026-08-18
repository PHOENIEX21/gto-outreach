import { useEffect } from "react";
function Media() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return (
    <main className="media-page">
      <section className="media-hero">
        <p className="eyebrow">GTO MEDIA</p>

        <h1>
          Faith that
          <span> speaks.</span>
        </h1>

        <p>
          Messages, worship, teachings and resources designed
          to strengthen your faith and help you grow in Christ.
        </p>
      </section>

      <section className="media-feature">
        <div className="media-feature-content">
          <span className="media-label">✦ FEATURED</span>

          <h2>Go into all the world.</h2>

          <p>
            Discover messages and teachings centered on the
            Gospel and our calling to take Christ beyond the walls.
          </p>

          <a
  href="https://vt.tiktok.com/ZSVMQ8gEJ/"
  target="_blank"
  rel="noopener noreferrer"
  className="media-play-button"
>
  ▶ Watch Message
</a>
        </div>

       <div className="media-visual">
  <video
    controls
    playsInline
    preload="metadata"
    className="gto-video"
  >
    <source src="/videos/holiness.mp4" type="video/mp4" />
    Your browser does not support video playback.
  </video>
</div>
      </section>

      <section className="media-grid">
        <div className="media-card">
          <span className="media-card-icon">🎥</span>

          <p className="media-card-label">MESSAGES</p>

          <h3>Gospel Messages</h3>

          <p>
            Watch teachings that strengthen your faith and
            help you live boldly for Christ.
          </p>

          <a href="#messages">Explore Messages →</a>
        </div>

        <div className="media-card">
          <span className="media-card-icon">🎵</span>

          <p className="media-card-label">WORSHIP</p>

          <h3>Worship & Praise</h3>

          <p>
            Lift your heart through worship and create moments
            of deeper connection with God.
          </p>

          <a href="#worship">Explore Worship →</a>
        </div>

        <div className="media-card">
          <span className="media-card-icon">📖</span>

          <p className="media-card-label">RESOURCES</p>

          <h3>Gospel Resources</h3>

          <p>
            Discover helpful resources for your spiritual
            growth and everyday walk with Christ.
          </p>

          <a href="#resources">View Resources →</a>
        </div>
      </section>

      <section className="media-cta">
        <p className="eyebrow">KEEP GROWING</p>

        <h2>
          Feed your faith.
          <br />
          <span>Share the Gospel.</span>
        </h2>

        <p>
          New content will continue to be added as GTO grows.
          Stay connected and keep building your faith.
        </p>
      </section>
    </main>
  );
}

export default Media;