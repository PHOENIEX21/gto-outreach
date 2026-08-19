import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppData } from "../data/useAppData";

function Join() {
  const navigate = useNavigate();
  const { member, joinCommunity, signInMember } = useAppData();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [returningEmail, setReturningEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) return;
    try {
      await joinCommunity(form);
      navigate("/member");
    } catch (joinError) {
      setError(joinError.message || "Unable to create your member account.");
    }
  };

  const signIn = async (event) => {
    event.preventDefault();
    if (await signInMember(returningEmail, loginPassword)) navigate("/member");
    else setLoginError("No member profile was found for that email or password.");
  };

  if (member) {
    return (
      <main className="member-page">
        <section className="member-welcome">
          <p className="eyebrow">YOU ARE PART OF THE FAMILY</p>
          <h1>Welcome back, <span>{member.name}.</span></h1>
          <p>Your GTO member space is ready with devotionals, progress and ways to stay involved.</p>
          <Link to="/member" className="member-primary">Open my member space <span aria-hidden="true">→</span></Link>
        </section>
      </main>
    );
  }

  return (
    <main className="join-page">
      <section className="join-intro">
        <p className="eyebrow">JOIN GTO</p>
        <h1>Believe.<br /><span>Belong. Become.</span></h1>
        <p>Join a growing family of believers committed to following Jesus, growing together and building God&apos;s Kingdom.</p>
      </section>
      <div className="join-form">
        <form onSubmit={handleSubmit}>
          <div className="form-heading"><span>01</span><h2>Make room for growth.</h2><p>Start your GTO journey with two simple details.</p></div>
          <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" required /></label>
          <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required /></label>
          <label>Password<input type="password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" required /></label>
          <button type="submit" className="member-primary">Join the community <span aria-hidden="true">→</span></button>
          <small>By joining, you create a secure member account.</small>
          {error && <small className="admin-error">{error}</small>}
        </form>
        <div className="returning-member">
          <p>Already joined on this browser?</p>
          <form onSubmit={signIn}>
            <input type="email" value={returningEmail} onChange={(event) => setReturningEmail(event.target.value)} placeholder="Your member email" required />
            <input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="Password" required />
            <button type="submit" className="text-button">Open member space →</button>
          </form>
          {loginError && <small className="admin-error">{loginError}</small>}
        </div>
      </div>
    </main>
  );
}

export default Join;
