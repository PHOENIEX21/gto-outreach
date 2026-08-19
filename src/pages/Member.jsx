import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../data/useAppData";

function Member() {
  const { member, devotionals, engagement, memberActivity, memberBadges, toggleLike, markComplete, addComment, leaveCommunity } = useAppData();
  const [comment, setComment] = useState("");
  const featured = devotionals[0];

  if (!member) {
    return (
      <main className="member-page member-empty">
        <p className="eyebrow">GTO MEMBER SPACE</p>
        <h1>Your place to <span>grow.</span></h1>
        <p>Join the community to save your progress, respond to devotionals and stay connected.</p>
        <Link to="/join" className="member-primary">Join GTO <span aria-hidden="true">→</span></Link>
      </main>
    );
  }

  const isLiked = engagement.liked.includes(featured.id);
  const isComplete = engagement.completed.includes(featured.id);
  const comments = engagement.comments.filter((item) => item.devotionalId === featured.id);

  const submitComment = (event) => {
    event.preventDefault();
    addComment(featured.id, comment);
    setComment("");
  };

  return (
    <main className="member-page">
      <section className="member-dashboard-header">
        <div><p className="eyebrow">YOUR GTO SPACE</p><h1>Keep growing, <span>{member.name}.</span></h1><p>Small steps in the Word become a life of bold faith.</p></div>
        <button type="button" className="text-button" onClick={leaveCommunity}>Leave local profile</button>
      </section>
      <section className="member-metrics"><div><strong>{memberActivity.points}</strong><span>Activity points</span></div><div><strong>{memberActivity.grade}</strong><span>Growth grade</span></div><div><strong>{engagement.completed.length}</strong><span>Words completed</span></div><div><strong>{engagement.comments.length}</strong><span>Encouragements</span></div></section>
      <section className="member-badges"><div><p className="eyebrow">YOUR MILESTONES</p><h2>Small steps worth celebrating.</h2></div><div className="badge-list">{memberBadges.length === 0 ? <p className="badge-empty">Your first badge is waiting in today&apos;s word.</p> : memberBadges.map((badge) => <article className="member-badge" key={badge.name}><span>{badge.icon}</span><div><strong>{badge.name}</strong><small>{badge.detail}</small></div></article>)}</div></section>
      <section className="member-content-grid">
        <article className="member-devotional-card"><div className="member-card-top"><span>✦ FEATURED WORD</span><span>{featured.reference}</span></div><h2>{featured.title}</h2><p className="member-scripture">&quot;{featured.scripture}&quot;</p><p className="member-reflection">{featured.reflection}</p><div className="member-card-actions"><button type="button" className={isLiked ? "member-action active" : "member-action"} onClick={() => toggleLike(featured.id)}>♡ {isLiked ? "Saved" : "Save word"}</button><button type="button" className={isComplete ? "member-action active" : "member-action"} onClick={() => markComplete(featured.id)}>{isComplete ? "Completed" : "Mark complete"}</button></div></article>
        <aside className="member-involvement"><p className="eyebrow">GET INVOLVED</p><h2>Your faith has a place here.</h2><p>Find encouragement, share what God is teaching you and take the next step with the GTO family.</p><Link to="/community" className="member-text-link">Meet the community <span aria-hidden="true">→</span></Link><Link to="/media" className="member-text-link">Explore GTO Media <span aria-hidden="true">→</span></Link></aside>
      </section>
      <section className="member-comments"><div><p className="eyebrow">SHARE THE WORD</p><h2>What is God showing you?</h2></div><form onSubmit={submitComment}><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Leave an encouragement for the community..." rows="4" /><button type="submit" className="member-primary">Post encouragement</button></form>{comments.length > 0 && <div className="comment-list">{comments.map((item) => <p key={item.id}><strong>{item.author}</strong>{item.text}</p>)}</div>}</section>
    </main>
  );
}

export default Member;
