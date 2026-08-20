import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAppData } from "../data/useAppData";

function Devotional() {
  const { member, devotionals, engagement, readingProgress, devotionalComments, toggleLike, markComplete, addComment, recordShare, updateReadingProgress } = useAppData();
  const [searchParams] = useSearchParams();
  const [comment, setComment] = useState("");
  const [shareLabel, setShareLabel] = useState("Share today's word");
  const articleRef = useRef(null);
  const lastSavedProgressRef = useRef(-1);
  const featured = devotionals.find((item) => item.id === searchParams.get("id")) || devotionals[0];
  const savedReading = member && featured ? readingProgress[featured.id] || null : null;

  useEffect(() => {
    if (!member || !featured) return undefined;
    const handleScroll = () => {
      const article = articleRef.current;
      if (!article) return;
      const totalDistance = Math.max(article.offsetHeight - window.innerHeight, 1);
      const scrollRatio = Math.max(0, Math.min(1, (window.scrollY - article.offsetTop) / totalDistance));
      const progress = Math.round(scrollRatio * 100);
      if (progress !== lastSavedProgressRef.current) {
        lastSavedProgressRef.current = progress;
        updateReadingProgress(featured.id, progress, scrollRatio);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [featured, member, updateReadingProgress]);

  if (!featured) {
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

        <div className="wall-empty">
          <span aria-hidden="true">✦</span>

          <h2>The next word is on its way.</h2>

          <p>
            GTO devotionals will appear here as soon as they are published.
          </p>
        </div>

        <div className="devotional-actions">
          <Link to="/">← Back Home</Link>

          <Link to="/community">Share With Community →</Link>
        </div>
      </main>
    );
  }

  const isLiked = member ? engagement.liked.includes(featured.id) : false;
  const isComplete = member ? engagement.completed.includes(featured.id) : false;
  const comments = devotionalComments.filter((item) => item.devotionalId === featured.id);

  const submitComment = (event) => {
    event.preventDefault();
    if (!member || !comment.trim()) return;
    addComment(featured.id, comment);
    setComment("");
  };

  const shareDevotional = async () => {
    const url = `${window.location.origin}/devotional#${featured.id}`;
    try {
      if (navigator.share) await navigator.share({ title: featured.title, text: featured.scripture, url });
      else await navigator.clipboard.writeText(url);
      const result = await recordShare("devotional", featured.id, featured.title, url);
      if (result.success) {
        setShareLabel(navigator.share ? "Shared" : "Copied");
        window.setTimeout(() => setShareLabel("Share today's word"), 1800);
      }
    } catch (error) {
      if (error.name !== "AbortError") setShareLabel("Unable to share");
    }
  };

  const continueReading = () => {
    const article = articleRef.current;
    if (!article) return;
    const totalDistance = Math.max(article.offsetHeight - window.innerHeight, 1);
    window.scrollTo({ top: article.offsetTop + (savedReading?.scrollRatio || 0) * totalDistance, behavior: "smooth" });
  };

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
        {member && <Link to="/member" className="member-return-link">← Back to member space</Link>}
      </section>

      <article className="daily-devotional" ref={articleRef}>
        <div className="devotional-meta">
          <span>✦ TODAY'S WORD</span>
          <span>{featured.reference}</span>
        </div>

        {member && <div className="reading-progress-card"><div><strong>{savedReading?.progress || 0}% read</strong><span>{savedReading?.progress ? "Continue where you left off" : "Start your reading journey"}</span></div><div className="reading-progress-track" aria-label={`${savedReading?.progress || 0}% of devotional read`}><span style={{ width: `${savedReading?.progress || 0}%` }} /></div>{savedReading?.progress > 0 && savedReading.progress < 100 && <button type="button" onClick={continueReading}>Continue reading <span aria-hidden="true">→</span></button>}</div>}

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

        <div className="member-card-actions devotional-card-actions">
          {member ? (
            <>
              <button type="button" className={isLiked ? "member-action active" : "member-action"} onClick={() => toggleLike(featured.id)}>♡ {isLiked ? "Saved" : "Save word"}</button>
              <button type="button" className={isComplete ? "member-action active" : "member-action"} onClick={() => markComplete(featured.id)}>{isComplete ? "Completed" : "Mark complete"}</button>
            </>
          ) : (
            <Link to="/join" className="member-action">Join GTO to respond <span aria-hidden="true">→</span></Link>
          )}
            <button type="button" className="member-action" onClick={shareDevotional}>{shareLabel} ↗</button>
        </div>
      </article>

      <section className="member-comments devotional-comments">
        <div>
          <p className="eyebrow">SHARE THE WORD</p>

          <h2>What is God showing you?</h2>
        </div>

        {member ? <form onSubmit={submitComment}><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Leave an encouragement for the community..." rows="4" /><button type="submit" className="member-primary">Post encouragement</button></form> : <p className="media-sign-in-prompt"><Link to="/join">Join GTO</Link> to comment on today's word.</p>}

        {comments.length > 0 && <div className="comment-list">{comments.map((item) => <p key={item.id}><span className="comment-author"><span className="comment-avatar">{item.authorAvatar ? <img src={item.authorAvatar} alt="" /> : item.author.slice(0, 1).toUpperCase()}</span><strong>{item.author}</strong></span><span>{item.text}</span></p>)}</div>}
      </section>

      <div className="devotional-actions">
        <Link to="/">← Back Home</Link>
        <Link to="/community-wall">Community wall →</Link>
        <Link to="/member">Member space →</Link>
      </div>
      <nav className="quick-links" aria-label="Quick links">
        <span>Quick links</span>
        <Link to="/devotional">Today&apos;s word</Link>
        <Link to="/community-wall">Community wall</Link>
        <Link to="/media">GTO media</Link>
        <Link to="/member">Member space</Link>
      </nav>
    </main>
  );
}

export default Devotional;