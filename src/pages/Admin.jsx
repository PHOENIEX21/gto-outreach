import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../data/useAppData";

const emptyDraft = { title: "", reference: "", scripture: "", reflection: "", prayer: "" };
const emptyMediaDraft = { kind: "announcement", title: "", body: "", mediaUrl: "", file: null };

function Admin() {
  const { admin, totalMembers, activeMembers, activityLeaderboard, devotionals, mediaPosts, communityPosts, publishDevotional, publishMediaPost, deleteMediaComment, deleteMediaPost, deleteCommunityPost, updateMediaPost, signOutAdmin, backendConnected } = useAppData();
  const [draft, setDraft] = useState(emptyDraft);
  const [notice, setNotice] = useState("");
  const [mediaDraft, setMediaDraft] = useState(emptyMediaDraft);
  const [mediaNotice, setMediaNotice] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const totalLikes = devotionals.reduce((sum, item) => sum + item.likes, 0);
  const totalComments = devotionals.reduce((sum, item) => sum + item.comments, 0);
  const totalMediaLikes = mediaPosts.reduce((sum, item) => sum + (item.likes || 0), 0);
  const totalMediaComments = mediaPosts.reduce((sum, item) => sum + (item.comments || []).length, 0);
  const recentComments = mediaPosts.flatMap((post) => (post.comments || []).map((comment) => ({ ...comment, postId: post.id, postTitle: post.title }))).slice(0, 8);

  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const handlePublish = (event) => {
    event.preventDefault();
    if (!draft.title || !draft.reference || !draft.scripture || !draft.reflection || !draft.prayer) return;
    publishDevotional(draft);
    setDraft(emptyDraft);
    setNotice("Devotional published to the member space.");
  };
  const updateMediaDraft = (field, value) => setMediaDraft((current) => ({ ...current, [field]: value }));
  const handleMediaPublish = async (event) => {
    event.preventDefault();
    if (!mediaDraft.title || !mediaDraft.body || ((mediaDraft.kind === "video" || mediaDraft.kind === "image") && !mediaDraft.mediaUrl && !mediaDraft.file)) return;
    try {
      await publishMediaPost(mediaDraft);
      setMediaDraft(emptyMediaDraft);
      setMediaNotice("Your post is now live on the Media page.");
    } catch (publishError) {
      setMediaNotice(publishError.message || "Unable to publish this post.");
    }
  };
  const saveMediaEdit = async (event) => {
    event.preventDefault();
    if (!editingPost?.title.trim() || !editingPost?.body.trim()) return;
    await updateMediaPost(editingPost.id, editingPost);
    setEditingPost(null);
  };

  return (
    <main className="admin-page">
      <section className="admin-header"><div><p className="eyebrow">GTO ADMIN · {admin?.email}</p><h1>Steward the <span>message.</span></h1><p>Publish devotionals, understand engagement and keep the community moving.</p><span className={backendConnected ? "connection-status connected" : "connection-status"}>{backendConnected ? "Supabase connected" : "Local preview mode"}</span></div><div className="admin-header-actions"><Link to="/member" className="admin-link">View member space <span aria-hidden="true">→</span></Link><button type="button" className="text-button" onClick={signOutAdmin}>Sign out</button></div></section>
      <section className="admin-metrics"><div><span>Real members</span><strong>{totalMembers}</strong></div><div><span>Active members</span><strong>{activeMembers}</strong></div><div><span>Total likes</span><strong>{totalLikes + totalMediaLikes}</strong></div><div><span>Total comments</span><strong>{totalComments + totalMediaComments}</strong></div></section>
      <section className="admin-workspace"><form className="admin-form" onSubmit={handlePublish}><div className="admin-section-heading"><p className="eyebrow">PUBLISH A WORD</p><h2>Give the community something to carry.</h2></div><label>Title<input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="The title of the devotional" required /></label><label>Scripture reference<input value={draft.reference} onChange={(event) => updateDraft("reference", event.target.value)} placeholder="John 3:16" required /></label><label>Scripture<textarea value={draft.scripture} onChange={(event) => updateDraft("scripture", event.target.value)} placeholder="Write the scripture here..." rows="3" required /></label><label>Reflection<textarea value={draft.reflection} onChange={(event) => updateDraft("reflection", event.target.value)} placeholder="What should the reader take into their day?" rows="5" required /></label><label>Prayer<textarea value={draft.prayer} onChange={(event) => updateDraft("prayer", event.target.value)} placeholder="Close with a prayer..." rows="4" required /></label><button type="submit" className="admin-primary">Publish devotional <span aria-hidden="true">→</span></button>{notice && <p className="admin-notice">{notice}</p>}</form><aside className="admin-recent"><div className="admin-section-heading"><p className="eyebrow">CONTENT LIBRARY</p><h2>Recent devotionals</h2></div>{devotionals.map((item) => <article key={item.id} className="admin-devotional-row"><div><strong>{item.title}</strong><span>{item.reference} · Published {item.publishedAt}</span></div><b>{item.completions} reads</b></article>)}</aside></section>
      <form className="admin-media-form" onSubmit={handleMediaPublish}><div className="admin-section-heading"><p className="eyebrow">PUBLISH MEDIA</p><h2>Keep the community in the loop.</h2><p>Post an announcement, video or image whenever there is something new to share.</p></div><div className="admin-media-fields"><label>Post type<select value={mediaDraft.kind} onChange={(event) => updateMediaDraft("kind", event.target.value)}><option value="announcement">Announcement</option><option value="video">Video</option><option value="image">Image</option></select></label><label>Title<input value={mediaDraft.title} onChange={(event) => updateMediaDraft("title", event.target.value)} placeholder="What is new?" required /></label></div><label>Message<textarea value={mediaDraft.body} onChange={(event) => updateMediaDraft("body", event.target.value)} placeholder="Share the update with the community..." rows="4" required /></label>{mediaDraft.kind !== "announcement" && <><label>Upload {mediaDraft.kind}<input type="file" accept={mediaDraft.kind === "video" ? "video/*" : "image/*"} onChange={(event) => updateMediaDraft("file", event.target.files?.[0] || null)} /></label><label>Or paste a {mediaDraft.kind} URL<input type="url" value={mediaDraft.mediaUrl} onChange={(event) => updateMediaDraft("mediaUrl", event.target.value)} placeholder={mediaDraft.kind === "video" ? "https://.../video.mp4" : "https://.../image.jpg"} /></label></>}<button type="submit" className="admin-primary">Publish {mediaDraft.kind} <span aria-hidden="true">→</span></button>{mediaNotice && <p className="admin-notice">{mediaNotice}</p>}</form>
      <section className="admin-library-panel"><div className="admin-section-heading"><p className="eyebrow">MEDIA LIBRARY</p><h2>Manage published posts</h2><p>Correct or remove updates that are no longer relevant to the community.</p></div><div className="admin-library-list">{mediaPosts.length === 0 ? <p className="activity-empty">No media posts published yet.</p> : mediaPosts.map((post) => editingPost?.id === post.id ? <form className="admin-library-edit" key={post.id} onSubmit={saveMediaEdit}><input value={editingPost.title} onChange={(event) => setEditingPost({ ...editingPost, title: event.target.value })} aria-label="Edit post title" required /><textarea value={editingPost.body} onChange={(event) => setEditingPost({ ...editingPost, body: event.target.value })} aria-label="Edit post message" rows="3" required /><div><button type="submit" className="admin-primary">Save changes</button><button type="button" className="text-button" onClick={() => setEditingPost(null)}>Cancel</button></div></form> : <article className="admin-library-row" key={post.id}><div><span>{post.kind}</span><strong>{post.title}</strong><small>{new Date(post.publishedAt).toLocaleDateString()}</small></div><div className="admin-library-actions"><button type="button" className="text-button" onClick={() => setEditingPost({ id: post.id, title: post.title, body: post.body })}>Edit</button><button type="button" className="text-button danger-button" onClick={() => window.confirm("Remove this post from the community?") && deleteMediaPost(post.id)}>Remove</button></div></article>)}</div></section>
      <section className="admin-activity-panel"><div className="admin-section-heading"><p className="eyebrow">COMMUNITY PULSE</p><h2>Member activity</h2><p>Points reflect completed readings, saved words and encouragements.</p></div><div className="activity-list">{activityLeaderboard.length === 0 ? <p className="activity-empty">Member activity will appear here as people engage.</p> : activityLeaderboard.slice(0, 8).map((profile, index) => <article className="activity-row" key={profile.id}><span className="activity-rank">{String(index + 1).padStart(2, "0")}</span><div><strong>{profile.name}</strong><span>{profile.activity.label}</span></div><b>{profile.activity.points} pts · {profile.activity.grade}</b></article>)}</div></section>
      <section className="admin-moderation-panel"><div className="admin-section-heading"><p className="eyebrow">MODERATION</p><h2>Recent post comments</h2><p>Keep conversations helpful, welcoming and centered on the mission.</p></div><div className="moderation-list">{recentComments.length === 0 ? <p className="activity-empty">No media comments yet.</p> : recentComments.map((comment) => <article className="moderation-row" key={comment.id}><div><strong>{comment.author}</strong><span>On {comment.postTitle}</span><p>{comment.text}</p></div><button type="button" className="text-button" onClick={() => deleteMediaComment(comment.postId, comment.id)}>Remove</button></article>)}</div></section>
      <section className="admin-moderation-panel"><div className="admin-section-heading"><p className="eyebrow">COMMUNITY WALL</p><h2>Prayer and testimony posts</h2><p>Review the stories and requests being shared by the GTO family.</p></div><div className="moderation-list">{communityPosts.length === 0 ? <p className="activity-empty">No community posts yet.</p> : communityPosts.slice(0, 8).map((post) => <article className="moderation-row" key={post.id}><div><strong>{post.title}</strong><span>{post.kind} · {post.author}</span><p>{post.body}</p></div><button type="button" className="text-button" onClick={() => window.confirm("Remove this community post?") && deleteCommunityPost(post.id)}>Remove</button></article>)}</div></section>
    </main>
  );
}

export default Admin;
