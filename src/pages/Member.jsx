import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../data/useAppData";

function Member() {
  const { member, devotionals, mediaPosts, communityPosts, engagement, readingProgress, readingHistory, readingStreak, devotionalComments, memberActivity, memberBadges, memberNotifications, unreadNotifications, markNotificationRead, markAllNotificationsRead, toggleLike, markComplete, addComment, signOutMember, updateMemberProfile } = useAppData();
  const [comment, setComment] = useState("");
  const [profileName, setProfileName] = useState(member?.name || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const featured = devotionals[0];
  const firstName = member?.name.trim().split(/\s+/)[0] || "friend";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

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

  const isLiked = engagement.liked.includes(featured?.id);
  const isComplete = engagement.completed.includes(featured?.id);
  const comments = devotionalComments.filter((item) => item.devotionalId === featured?.id);
  const savedDevotionals = devotionals.filter((item) => engagement.liked.includes(item.id));
  const completedDevotionals = devotionals.filter((item) => engagement.completed.includes(item.id));
  const journeyItems = [
    ...communityPosts.filter((post) => post.userId === member.id).map((post) => ({ id: `community-${post.id}`, label: post.kind === "prayer" ? "Shared a prayer request" : "Shared a testimony", detail: post.title, date: post.createdAt, link: `/community-wall#community-${post.id}` })),
    ...mediaPosts.flatMap((post) => (post.comments || []).filter((comment) => comment.userId === member.id).map((comment) => ({ id: `media-comment-${comment.id}`, label: "Encouraged the community", detail: post.title, date: comment.createdAt, link: `/media#media-${post.id}` }))),
    ...devotionalComments.filter((comment) => comment.userId === member.id).map((comment) => ({ id: `devotional-comment-${comment.id}`, label: "Reflected on the Word", detail: comment.text, date: comment.createdAt, link: `/devotional?id=${comment.devotionalId}` })),
    ...completedDevotionals.map((item) => ({ id: `completed-${item.id}`, label: "Completed a devotional", detail: item.title, date: item.publishedAt, link: `/devotional?id=${item.id}` })),
  ].sort((first, second) => new Date(second.date) - new Date(first.date)).slice(0, 6);

  const submitComment = (event) => {
    event.preventDefault();
    addComment(featured?.id, comment);
    setComment("");
  };

  const selectAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      setProfileError("Choose an image smaller than 2 MB.");
      event.target.value = "";
      return;
    }
    setProfileError("");
    setAvatarFile(file);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setSavingProfile(true);
    try {
      const result = await updateMemberProfile({ name: profileName, file: avatarFile });
      if (!result.success) {
        setProfileError(result.error);
        return;
      }
      setAvatarFile(null);
      setProfileMessage("Your profile was updated.");
    } catch (error) {
      setProfileError(error.message || "Unable to update your profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <main className="member-page">
      <section className="member-dashboard-header">
        <div className="member-heading-content"><div className="member-avatar member-avatar-large">{member.avatarUrl ? <img src={member.avatarUrl} alt={`${member.name}'s profile`} /> : <span>{member.name.slice(0, 1).toUpperCase()}</span>}</div><div className="member-heading-copy"><p className="eyebrow">YOUR GTO SPACE</p><h1>{greeting}, <span>{firstName}.</span></h1><p>Small steps in the Word become a life of bold faith.</p></div></div>
        <button type="button" className="dashboard-signout" onClick={signOutMember}>Sign out</button>
      </section>
      <nav className="dashboard-quick-actions" aria-label="Member quick actions"><span>Quick actions</span><Link to="/devotional">Today&apos;s word</Link><Link to="/community-wall">Community wall</Link><Link to="/media">GTO media</Link><Link to="/">Home</Link></nav>
      <section className="member-welcome-panel"><div><p className="eyebrow">WHAT&apos;S HAPPENING WITH YOU</p><h2>{greeting}, {firstName}.</h2><p>{memberActivity.engagements ? `You have made ${memberActivity.engagements} meaningful step${memberActivity.engagements === 1 ? "" : "s"} in the GTO family.` : "Your next step is waiting in today&apos;s word."}</p></div><div className="member-welcome-stats"><span><strong>{memberActivity.shares}</strong> shares</span><span><strong>{unreadNotifications}</strong> new notice{unreadNotifications === 1 ? "" : "s"}</span></div></section>
      <section className="member-daily-panel"><div><p className="eyebrow">DAILY RHYTHM</p><h2>Keep showing up.</h2><p>{readingStreak ? `You have read for ${readingStreak} consecutive day${readingStreak === 1 ? "" : "s"}.` : "Open today&apos;s word to begin your reading rhythm."}</p></div><div className="member-streak"><strong>🔥 {readingStreak}</strong><span>day streak</span></div><div className="member-history"><span className="member-reading-label">RECENTLY READ</span>{readingHistory.length === 0 ? <p>Nothing in your reading history yet.</p> : readingHistory.slice(0, 3).map((item) => <Link key={item.id} to={`/devotional?id=${item.id}`}><span>{item.title}</span><small>{item.reading.progress}% read</small></Link>)}</div></section>
      <section className="member-notifications-panel"><div className="member-section-heading"><div><p className="eyebrow">YOUR NOTIFICATIONS</p><h2>Stay connected.</h2></div>{unreadNotifications > 0 && <button type="button" className="text-button" onClick={markAllNotificationsRead}>Mark all read</button>}</div>{memberNotifications.length === 0 ? <p className="member-notifications-empty">Updates, replies and encouragement will appear here.</p> : <div className="member-notification-list">{memberNotifications.slice(0, 8).map((notification) => <Link key={notification.id} to={notification.link || "/member"} className={notification.read ? "member-notification" : "member-notification unread"} onClick={() => markNotificationRead(notification.id)}><span className="member-notification-icon" aria-hidden="true">{notification.type === "support" ? "♥" : notification.type === "reply" ? "✎" : notification.type === "like" ? "♡" : "✦"}</span><span><strong>{notification.title}</strong><small>{notification.body}</small><time dateTime={notification.createdAt}>{new Date(notification.createdAt).toLocaleDateString()}</time></span></Link>)}</div>}</section>
      <section className="member-profile-panel"><div><p className="eyebrow">YOUR PROFILE</p><h2>Make it yours.</h2><p>Update your display name and profile photo for the GTO family.</p></div><form onSubmit={saveProfile}><label>Display name<input value={profileName} onChange={(event) => setProfileName(event.target.value)} maxLength="80" required /></label><label>Profile photo<input type="file" accept="image/*" onChange={selectAvatar} /></label><button type="submit" className="member-primary" disabled={savingProfile}>{savingProfile ? "Saving..." : "Save profile"}</button>{profileMessage && <small className="form-alert success" role="status">{profileMessage}</small>}{profileError && <small className="form-alert error" role="alert">{profileError}</small>}</form></section>
      <section className="member-metrics"><div><strong>{memberActivity.points}</strong><span>Activity points</span></div><div><strong>{memberActivity.grade}</strong><span>Growth grade</span></div><div><strong>{engagement.completed.length}</strong><span>Words completed</span></div><div><strong>{memberActivity.engagements}</strong><span>Total engagements</span></div></section>
      <section className="member-reading-panel"><div className="member-section-heading"><div><p className="eyebrow">YOUR READING PATH</p><h2>Keep going with the Word.</h2></div><Link to="/devotional" className="member-text-link">Today&apos;s word →</Link></div><div className="member-reading-grid"><div><span className="member-reading-label">SAVED FOR LATER</span>{savedDevotionals.length === 0 ? <p className="member-reading-empty">Save a devotional and it will stay here for you.</p> : savedDevotionals.slice(0, 3).map((item) => <Link key={item.id} to={`/devotional?id=${item.id}`} className="member-reading-item"><strong>{item.title}</strong><small>{item.reference}</small>{readingProgress[item.id]?.progress > 0 && <span className="member-reading-progress"><span style={{ width: `${readingProgress[item.id].progress}%` }} /></span>}</Link>)}</div><div><span className="member-reading-label">COMPLETED</span>{completedDevotionals.length === 0 ? <p className="member-reading-empty">Your completed readings will appear here.</p> : completedDevotionals.slice(0, 3).map((item) => <Link key={item.id} to={`/devotional?id=${item.id}`} className="member-reading-item completed"><strong>{item.title}</strong><small>{item.reference} · Completed</small></Link>)}</div></div></section>
      <section className="member-journey-panel"><div className="member-section-heading"><div><p className="eyebrow">YOUR JOURNEY</p><h2>What you&apos;ve shared with GTO.</h2></div><span className="member-journey-count">{journeyItems.length} recent</span></div>{journeyItems.length === 0 ? <p className="member-reading-empty">Your prayers, reflections, and encouragements will gather here as you participate.</p> : <div className="member-journey-list">{journeyItems.map((item) => <Link key={item.id} to={item.link} className="member-journey-item"><span className="member-journey-dot" aria-hidden="true" /><span><strong>{item.label}</strong><small>{item.detail}</small></span><time dateTime={item.date}>{new Date(item.date).toLocaleDateString()}</time></Link>)}</div>}</section>
      <section className="member-badges"><div><p className="eyebrow">YOUR MILESTONES</p><h2>Small steps worth celebrating.</h2></div><div className="badge-list">{memberBadges.length === 0 ? <p className="badge-empty">Your first badge is waiting in today&apos;s word.</p> : memberBadges.map((badge) => <article className="member-badge" key={badge.name}><span>{badge.icon}</span><div><strong>{badge.name}</strong><small>{badge.detail}</small></div></article>)}</div></section>
      <section className="member-content-grid">
        <article className="member-devotional-card"><div className="member-card-top"><span>✦ FEATURED WORD</span><span>{featured?.reference || "—"}</span></div><h2>{featured?.title || "The next word is on its way."}</h2><p className="member-scripture">{featured ? <span>&quot;{featured.scripture}&quot;</span> : "GTO devotionals will appear here as soon as they are published."}</p><p className="member-reflection">{featured?.reflection || ""}</p>{featured && <div className="member-card-actions"><button type="button" className={isLiked ? "member-action active" : "member-action"} onClick={() => toggleLike(featured.id)}>♡ {isLiked ? "Saved" : "Save word"}</button><button type="button" className={isComplete ? "member-action active" : "member-action"} onClick={() => markComplete(featured.id)}>{isComplete ? "Completed" : "Mark complete"}</button></div>}</article>
        <aside className="member-involvement"><p className="eyebrow">GET INVOLVED</p><h2>Your faith has a place here.</h2><p>Find encouragement, share what God is teaching you and take the next step with the GTO family.</p><Link to="/community" className="member-text-link">Meet the community <span aria-hidden="true">→</span></Link><Link to="/media" className="member-text-link">Explore GTO Media <span aria-hidden="true">→</span></Link></aside>
      </section>
      {featured && <section className="member-comments"><div><p className="eyebrow">SHARE THE WORD</p><h2>What is God showing you?</h2></div><form onSubmit={submitComment}><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Leave an encouragement for the community..." rows="4" /><button type="submit" className="member-primary">Post encouragement</button></form>{comments.length > 0 && <div className="comment-list">{comments.map((item) => <p key={item.id}><strong>{item.author}</strong>{item.text}</p>)}</div>}</section>}
    </main>
  );
}

export default Member;
