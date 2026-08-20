import { Link } from "react-router-dom";
import { useAppData } from "../data/useAppData";
import { MediaPost } from "./Media";

function Announcements() {
  const { mediaPosts, member, addMediaComment, toggleMediaLike, recordShare, backendLoading } = useAppData();
  const announcements = mediaPosts.filter((post) => post.kind === "announcement");

  return (
    <main className="announcements-page">
      <section className="announcements-hero">
        <p className="eyebrow">GTO ANNOUNCEMENTS</p>
        <h1>Stay in the <span>know.</span></h1>
        <p>Important updates, gatherings and news from the Glad Tidings Outreach family.</p>
        {member && <Link to="/member" className="member-return-link">← Back to member space</Link>}
      </section>

      {backendLoading && <p className="content-loading" role="status">Loading the latest announcements...</p>}

      <section className="announcements-list" aria-live="polite">
        {announcements.length === 0 ? (
          <div className="announcements-empty">
            <span aria-hidden="true">✦</span>
            <h2>No announcements yet.</h2>
            <p>New updates from GTO will appear here when they are published.</p>
            <Link to="/media" className="member-primary">Explore GTO Media <span aria-hidden="true">→</span></Link>
          </div>
        ) : (
          announcements.map((announcement) => (
            <article className="announcement-item" key={announcement.id}>
              <div className="announcement-date">
                <span>{new Date(announcement.publishedAt).toLocaleDateString(undefined, { month: "short" })}</span>
                <strong>{new Date(announcement.publishedAt).getDate()}</strong>
              </div>
              <div className="announcement-copy">
                <MediaPost post={announcement} member={member} addMediaComment={addMediaComment} toggleMediaLike={toggleMediaLike} recordShare={recordShare} />
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default Announcements;
