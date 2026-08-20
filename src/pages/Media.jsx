import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../data/useAppData";

export function MediaPost({ post, member, addMediaComment, toggleMediaLike, recordShare }) {
  const [comment, setComment] = useState("");
  const [shareLabel, setShareLabel] = useState("Share");
  const [likeError, setLikeError] = useState("");
  const [shareError, setShareError] = useState("");
  const comments = post.comments || [];

  const sharePost = async () => {
    const postUrl = `${window.location.origin}${window.location.pathname}#media-${post.id}`;
    const shareData = { title: post.title, text: post.body, url: postUrl };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) await navigator.clipboard.writeText(postUrl);
      const result = await recordShare("media", post.id, post.title, postUrl);
      if (!result.success) setShareError(result.error);
      else {
        setShareLabel(navigator.share ? "Shared" : "Copied");
        window.setTimeout(() => setShareLabel("Share"), 1800);
      }
    } catch (error) {
      if (error.name !== "AbortError") setShareError(error.message || "Unable to share this post.");
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (!member || !comment.trim()) return;
    await addMediaComment(post.id, comment);
    setComment("");
  };

  const handleLike = async () => {
    setLikeError("");
    const result = await toggleMediaLike(post.id);
    if (result?.error) setLikeError(result.error);
  };

  return (
    <article className="media-post" id={`media-${post.id}`}>
      <div className="media-post-media">
        {post.kind === "video" && <video controls preload="metadata" src={post.mediaUrl} />}
        {post.kind === "image" && <img src={post.mediaUrl} alt={post.title} />}
        {post.kind === "announcement" && <span className="media-post-mark">✦</span>}
      </div>
      <div className="media-post-copy">
        <span className="media-card-label">{post.kind}</span>
        <h3>{post.title}</h3>
        <p>{post.body}</p>
        <small>{new Date(post.publishedAt).toLocaleDateString()}</small>
        <button type="button" className={post.likedByMember ? "media-like-button active" : "media-like-button"} onClick={handleLike}>{member ? `${post.likedByMember ? "♥ Saved" : "♡ Like"} · ${post.likes || 0}` : "Join GTO to like"}</button>
        {likeError && <small className="media-action-error">{likeError}</small>}
        <button type="button" className="media-share-button" onClick={sharePost}>{shareLabel} <span aria-hidden="true">↗</span></button>
        {shareError && <small className="media-action-error" role="alert">{shareError}</small>}
        <div className="media-post-comments">
          {comments.length > 0 && <div className="media-comment-list">{comments.slice(0, 3).map((item) => <p key={item.id}><span className="comment-author"><span className="comment-avatar">{item.authorAvatar ? <img src={item.authorAvatar} alt="" /> : item.author.slice(0, 1).toUpperCase()}</span><strong>{item.author}</strong></span><span>{item.text}</span></p>)}</div>}
          {member ? <form onSubmit={submitComment}><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Say something encouraging..." aria-label={`Comment on ${post.title}`} /><button type="submit" className="media-comment-button">Post</button></form> : <p className="media-sign-in-prompt"><Link to="/join">Join GTO</Link> to comment on this post.</p>}
        </div>
      </div>
    </article>
  );
}

function Media() {
  const { mediaPosts, member, addMediaComment, toggleMediaLike, recordShare, mediaUpdateNotice, clearMediaUpdateNotice, backendLoading } = useAppData();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [visibleCount, setVisibleCount] = useState(8);
  const visiblePosts = mediaPosts.filter((post) => (kind === "all" || post.kind === kind) && `${post.title} ${post.body}`.toLowerCase().includes(query.toLowerCase().trim()));

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
        {member && <Link to="/member" className="member-return-link">← Back to member space</Link>}
      </section>

      {backendLoading && <p className="content-loading" role="status">Loading the latest from GTO...</p>}

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

      {mediaUpdateNotice && <button type="button" className="media-update-notice" onClick={clearMediaUpdateNotice}>{mediaUpdateNotice} <span aria-hidden="true">×</span></button>}
      {mediaPosts.length > 0 && <section className="media-posts"><div className="media-posts-heading"><p className="eyebrow">LATEST FROM GTO</p><h2>Stay connected.</h2><div className="media-filters"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search GTO media" aria-label="Search GTO media" /><select value={kind} onChange={(event) => setKind(event.target.value)} aria-label="Filter media by type"><option value="all">All posts</option><option value="announcement">Announcements</option><option value="video">Videos</option><option value="image">Images</option></select></div></div><div className="media-post-grid">{visiblePosts.length > 0 ? visiblePosts.slice(0, visibleCount).map((post) => <MediaPost key={post.id} post={post} member={member} addMediaComment={addMediaComment} toggleMediaLike={toggleMediaLike} recordShare={recordShare} />) : <p className="media-filter-empty">No posts match that search.</p>}</div>{visiblePosts.length > visibleCount && <button type="button" className="wall-load-more member-primary" onClick={() => setVisibleCount((count) => count + 8)}>Load more <span aria-hidden="true">↓</span></button>}</section>}

<section id="messages" className="media-content-section">
  <p className="media-card-label">MESSAGES</p>

  <h2>Gospel Messages</h2>

    <p>
    Watch teachings that strengthen your faith and help you live boldly for Christ.
  </p>

  <div className="media-message-placeholder">
    <span>🎥</span>

    <h3>Gospel Messages Coming Soon</h3>

    <p>
      Powerful teachings, sermons, and messages will be added here.
    </p>
  </div>
</section>

<section id="worship" className="media-content-section">
  <p className="media-card-label">WORSHIP</p>

  <h2>Worship & Praise</h2>

  <p>
    Lift your heart through worship and create moments of deeper connection with God.
  </p>

  <div className="media-message-placeholder">
    <span>🎵</span>

    <h3>Worship Content Coming Soon</h3>

    <p>
      Worship sessions, praise moments, and inspiring songs will be added here.
    </p>
  </div>
</section>

<section id="resources" className="media-content-section">
  <p className="media-card-label">RESOURCES</p>

  <h2>Gospel Resources</h2>

  <p>
    Discover helpful resources for your spiritual growth and everyday walk with Christ.
  </p>

  <div className="media-message-placeholder">
    <span>📖</span>

    <h3>Gospel Resources Coming Soon</h3>

    <p>
      Bible study materials, devotionals, and helpful resources will be added here.
    </p>
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