import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../data/useAppData";

function CommunityWall() {
  const { member, communityPosts, createCommunityPost, deleteCommunityPost, toggleCommunitySupport, backendLoading } = useAppData();
  const [kind, setKind] = useState("prayer");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");

  const submitPost = async (event) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    await createCommunityPost({ kind, title, body });
    setTitle("");
    setBody("");
    setNotice(kind === "prayer" ? "Your prayer request is now with the GTO family." : "Your testimony has been shared with the GTO family.");
  };

  return (
    <main className="community-wall-page">
      <section className="community-wall-hero">
        <p className="eyebrow">GTO COMMUNITY WALL</p>
        <h1>We carry it <span>together.</span></h1>
        <p>Share what is on your heart, celebrate what God is doing and encourage the family in faith.</p>
        <div className="community-wall-links"><Link to="/community">Back to community</Link><Link to="/join">Join GTO</Link></div>
      </section>

      {backendLoading && <p className="content-loading" role="status">Loading the community wall...</p>}

      <section className="community-wall-layout">
        <div className="community-wall-feed">
          {communityPosts.length === 0 ? <div className="wall-empty"><span aria-hidden="true">✦</span><h2>The wall is waiting for your story.</h2><p>Be the first person to share a prayer request or testimony.</p></div> : communityPosts.map((post) => <article className="wall-post" key={post.id}><div className={post.kind === "prayer" ? "wall-post-kind prayer" : "wall-post-kind testimony"}>{post.kind === "prayer" ? "Prayer request" : "Testimony"}</div><h2>{post.title}</h2><p>{post.body}</p><footer><span>{post.author} · {new Date(post.createdAt).toLocaleDateString()}</span><div className="wall-post-actions">{member && <button type="button" className={post.supportedByMember ? "wall-support active" : "wall-support"} onClick={() => toggleCommunitySupport(post.id, post.kind === "prayer" ? "praying" : "amen")}>{post.kind === "prayer" ? "🙏 I'm praying" : "🙌 Amen"} · {post.supportCount || 0}</button>}{member && (member.id === post.userId || member.role === "admin") && <button type="button" className="text-button danger-button" onClick={() => deleteCommunityPost(post.id)}>Remove</button>}</div></footer></article>)}
        </div>

        {member ? <form className="wall-form" onSubmit={submitPost}><p className="eyebrow">SHARE WITH THE FAMILY</p><h2>What would you like to share?</h2><div className="wall-type-toggle"><button type="button" className={kind === "prayer" ? "active" : ""} onClick={() => setKind("prayer")}>Prayer request</button><button type="button" className={kind === "testimony" ? "active" : ""} onClick={() => setKind("testimony")}>Testimony</button></div><label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={kind === "prayer" ? "What can we pray with you about?" : "What has God done?"} required /></label><label>Your message<textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write from the heart..." rows="7" maxLength="2000" required /></label><button type="submit" className="member-primary">Share with GTO <span aria-hidden="true">→</span></button>{notice && <small className="admin-notice">{notice}</small>}</form> : <aside className="wall-signin"><p className="eyebrow">JOIN THE FAMILY</p><h2>Your story has a place here.</h2><p>Join GTO to share prayer requests, testimonies and encouragement with the community.</p><Link to="/join" className="member-primary">Join GTO <span aria-hidden="true">→</span></Link></aside>}
      </section>
    </main>
  );
}

export default CommunityWall;
