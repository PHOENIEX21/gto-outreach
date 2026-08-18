function Community() {
  return (
    <main className="community-page">
      <section className="community-hero">
        <p className="eyebrow">GTO COMMUNITY</p>

        <h1>
          We grow
          <span> together.</span>
        </h1>

        <p>
          Faith was never meant to be lived alone.
          Connect with people who are passionate about
          following Christ and growing together.
        </p>
      </section>

      <section className="community-grid">
        <div className="community-card">
          <span className="community-icon">🙏</span>

          <h2>Pray Together</h2>

          <p>
            Share prayer requests, encourage one another,
            and stand together in faith.
          </p>

          <a href="#prayer">Prayer Community →</a>
        </div>

        <div className="community-card featured">
          <span className="community-icon">🤝</span>

          <h2>Grow Together</h2>

          <p>
            Learn from God's Word, share experiences,
            and encourage one another in your walk with Christ.
          </p>

          <a href="#grow">Join the Conversation →</a>
        </div>

        <div className="community-card">
          <span className="community-icon">🌍</span>

          <h2>Reach Together</h2>

          <p>
            Become part of the mission to take the Gospel
            beyond the walls and into our communities.
          </p>

          <a href="#mission">Our Mission →</a>
        </div>
      </section>

      <section className="community-message">
        <p className="eyebrow">A PLACE TO BELONG</p>

        <h2>
          One faith.
          <br />
          One family.
          <br />
          <span>One mission.</span>
        </h2>

        <p>
          GTO exists to create a space where believers can
          find encouragement, build meaningful relationships,
          discover their purpose and live boldly for Christ.
        </p>
      </section>

      <section className="community-cta">
        <div>
          <p className="eyebrow">JOIN GTO</p>

          <h2>Let's grow in Christ together.</h2>

          <p>
            Your journey matters. Your story matters.
            And there is a place for you here.
          </p>
        </div>

        <a href="mailto:hello@gtooutreach.org">
          Connect With Us →
        </a>
      </section>
    </main>
  );
}

export default Community;