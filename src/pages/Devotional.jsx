import { Link } from "react-router-dom";
import { useAppData } from "../data/useAppData";

function Devotional() {
  const { devotionals } = useAppData();
  const featured = devotionals[0];

  return (
    <main className="devotional-page">
      <section className="devotional-hero">
        <p className="eyebrow">GTO DEVOTIONAL</p>

        <h1>
          Start your day
          <span> with God.</span>
        </h1>

        <p className="devotional-intro">
          A moment in God's presence can change the direction
          of your entire day.
        </p>
      </section>

      <article className="daily-devotional">
        <div className="devotional-meta">
          <span>✦ TODAY'S WORD</span>
          <span>MARK 16:15</span>
        </div>

        <h2>{featured.title}</h2>

        <p className="scripture">
          &quot;{featured.scripture}&quot;
        </p>

        <span className="reference">{featured.reference}</span>

        <div className="devotional-divider" />

        <div className="devotional-body">
          <h3>Today's Reflection</h3>

          <p>
            {featured.reflection}
          </p>
        </div>

        <div className="prayer-box">
          <span>🙏 PRAYER</span>

          <p>
            {featured.prayer}
          </p>
        </div>

        <div className="reflection-box">
          <span>💭 REFLECT</span>

          <p>
            Who can I encourage or reach with the love of Christ today?
          </p>
        </div>
      </article>

      <div className="devotional-actions">
        <Link to="/">← Back Home</Link>

        <Link to="/community">Share With Community →</Link>
      </div>
    </main>
  );
}

export default Devotional;