function Devotional() {
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

        <h2>Go into all the world</h2>

        <p className="scripture">
          "Go into all the world and preach the gospel to all creation."
        </p>

        <span className="reference">Mark 16:15</span>

        <div className="devotional-divider" />

        <div className="devotional-body">
          <h3>Today's Reflection</h3>

          <p>
            We are called to take the message of Christ beyond the walls,
            reaching hearts and transforming lives. Every believer has a
            part to play in sharing the good news.
          </p>

          <p>
            The Gospel is not something we keep to ourselves. God has
            placed us where we are so that our words, actions and lives
            can point people toward Jesus.
          </p>

          <p>
            Today, ask God to show you one person you can encourage,
            pray for, or share the love of Christ with.
          </p>
        </div>

        <div className="prayer-box">
          <span>🙏 PRAYER</span>

          <p>
            Lord, give me courage to share Your love today.
            Open my eyes to the people around me and help my life
            point others to Jesus. Amen.
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
        <a href="/">← Back Home</a>

        <a href="/community">Share With Community →</a>
      </div>
    </main>
  );
}

export default Devotional;