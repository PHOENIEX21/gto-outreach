import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="member-page member-empty not-found-page">
      <p className="eyebrow">PAGE NOT FOUND</p>
      <h1>This page is <span>off the path.</span></h1>
      <p>
        The page you are looking for does not exist or may have moved.
        Let&apos;s get you back to the mission.
      </p>
      <div className="not-found-actions">
        <Link to="/" className="member-primary">Back to GTO home <span aria-hidden="true">→</span></Link>
        <Link to="/devotional" className="member-text-link">Read today's word <span aria-hidden="true">→</span></Link>
      </div>
    </main>
  );
}

export default NotFound;
