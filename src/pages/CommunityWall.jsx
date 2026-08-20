import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../data/useAppData";

function CommunityWall() {
  const { member, communityPosts, createCommunityPost, addCommunityComment, deleteCommunityPost, toggleCommunitySupport, recordShare, backendLoading } = useAppData();
  const [kind, setKind] = useState("prayer");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentErrors, setCommentErrors] = useState({});

  const sharePost = async (post) => {
    const url = `${window.location.origin}/community-wall#community-${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: post.title, text: post.body, url });
      else await navigator.clipboard.writeText(url);
      await recordShare("community", post.id, post.title, url);
    } catch (error) {
      if (error.name !== "AbortError") setError(error.message || "Unable to share this post.");
    }
  };

  const submitComment = async (event, postId) => {
    event.preventDefault();
    const draft = commentDrafts[postId] || "";
    const result = await addCommunityComment(postId, draft);
    if (!result.success) {
      setCommentErrors((current) => ({ ...current, [postId]: result.error }));
      return;
    }
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    setCommentErrors((current) => ({ ...current, [postId]: "" }));
  };

  const submitPost = async (event) => {
    event.preventDefault();
    if (submitting || !title.trim() || !body.trim()) return;
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      await createCommunityPost({ kind, title, body });
      setTitle("");
      setBody("");
      setNotice(kind === "prayer" ? "Your prayer request is now with the GTO family." : "Your testimony has been shared with the GTO family.");
    } catch (postError) {
      setError(postError.message || "Unable to share your post right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="community-wall-page">
      <section className="community-wall-hero">
        <p className="eyebrow">GTO COMMUNITY WALL</p>
        <h1>We carry it <span>together.</span></h1>
        <p>Share what is on your heart, celebrate what God is doing and encourage the family in faith.</p>
        <div className="community-wall-links"><Link to="/community">Back to community</Link>{member ? <Link to="/member" className="member-return-link">Back to member space</Link> : <Link to="/join">Join GTO</Link>}</div>
      </section>

      {backendLoading && <p className="content-loading" role="status">Loading the community wall...</p>}

      <section className="community-wall-layout">
        <div className="community-wall-feed">
          {communityPosts.length === 0 ? <div className="wall-empty"><span aria-hidden="true">✦</span><h2>The wall is waiting for your story.</h2><p>Be the first person to share a prayer request or testimony.</p></div> : communityPosts.slice(0, visibleCount).map((post) => <article className="wall-post" id={`community-${post.id}`} key={post.id}><div className={post.kind === "prayer" ? "wall-post-kind prayer" : "wall-post-kind testimony"}>{post.kind === "prayer" ? "Prayer request" : "Testimony"}</div><h2>{post.title}</h2><p>{post.body}</p><div className="wall-post-meta"><span>{post.author}</span><time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString()}</time><span>{post.comments?.length || 0} comments</span><span>{post.supportCount || 0} supported</span></div>{post.comments?.length > 0 && <div className="wall-comments">{post.comments.slice(-3).map((comment) => <p key={comment.id}><span className="comment-author"><span className="comment-avatar">{comment.authorAvatar ? <img src={comment.authorAvatar} alt="" /> : comment.author.slice(0, 1).toUpperCase()}</span><strong>{comment.author}</strong></span><span>{comment.text}</span></p>)}</div>}{member && <form className="wall-comment-form" onSubmit={(event) => submitComment(event, post.id)}><input value={commentDrafts[post.id] || ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Encourage this person..." aria-label={`Comment on ${post.title}`} maxLength="1000" /><button type="submit">Reply</button></form>}{commentErrors[post.id] && <small className="form-alert error" role="alert">{commentErrors[post.id]}</small>}<footer><span>{post.author} · {new Date(post.createdAt).toLocaleDateString()}</span><div className="wall-post-actions">{member && <button type="button" className={post.supportedByMember ? "wall-support active" : "wall-support"} onClick={() => toggleCommunitySupport(post.id, post.kind === "prayer" ? "praying" : "amen")}>{post.kind === "prayer" ? "🙏 I'm praying" : "🙌 Amen"} · {post.supportCount || 0}</button>}<button type="button" className="text-button" onClick={() => sharePost(post)}>Share ↗</button>{member && (member.id === post.userId || member.role === "admin") && <button type="button" className="text-button danger-button" onClick={() => deleteCommunityPost(post.id)}>Remove</button>}</div></footer></article>)}{communityPosts.length > visibleCount && <button type="button" className="wall-load-more member-primary" onClick={() => setVisibleCount((count) => count + 8)}>Load more <span aria-hidden="true">↓</span></button>}
        </div>

        {member ? <form className="wall-form" onSubmit={submitPost} aria-busy={submitting}><p className="eyebrow">SHARE WITH THE FAMILY</p><h2>What would you like to share?</h2><div className="wall-type-toggle"><button type="button" className={kind === "prayer" ? "active" : ""} onClick={() => setKind("prayer")} disabled={submitting}>Prayer request</button><button type="button" className={kind === "testimony" ? "active" : ""} onClick={() => setKind("testimony")} disabled={submitting}>Testimony</button></div><label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={kind === "prayer" ? "What can we pray with you about?" : "What has God done?"} required /></label><label>Your message<textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write from the heart..." rows="7" maxLength="2000" required /></label><button type="submit" className="member-primary" disabled={submitting}>{submitting ? "Sharing..." : "Share with GTO"} {!submitting && <span aria-hidden="true">→</span>}</button>{notice && <small className="admin-notice" role="status">{notice}</small>}{error && <small className="form-alert error" role="alert">{error}</small>}</form> : <aside className="wall-signin"><p className="eyebrow">JOIN THE FAMILY</p><h2>Your story has a place here.</h2><p>Join GTO to share prayer requests, testimonies and encouragement with the community.</p><Link to="/join" className="member-primary">Join GTO <span aria-hidden="true">→</span></Link></aside>}
      </section>
    </main>
  );
}

export default CommunityWall;
