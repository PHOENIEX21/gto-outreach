import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppData } from "../data/useAppData";

function AdminLogin() {
  const navigate = useNavigate();
  const { admin, signInAdmin, sendPasswordRecovery } = useAppData();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");

  if (admin) {
    navigate("/admin", { replace: true });
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();
    const result = await signInAdmin(form.email, form.password);
    if (result?.success) navigate("/admin");
    else setError(result?.error || "That admin sign-in did not match. Check the credentials and try again.");
  };

  const requestRecovery = async (event) => {
    event.preventDefault();
    setError("");
    setRecoveryMessage("");
    if (!recoveryEmail.trim()) {
      setError("Enter the email address for the account you want to recover.");
      return;
    }
    const result = await sendPasswordRecovery(recoveryEmail);
    if (result.success) setRecoveryMessage("If that email belongs to a GTO admin account, a reset link is on its way. Check Spam/Junk too; delivery can take a few minutes.");
    else setError(result.error);
  };

  return (
    <main className="join-page admin-login-page">
      <section className="join-intro">
        <p className="eyebrow">GTO STEWARDSHIP</p>
        <h1>Lead the <span>message.</span></h1>
        <p>Admin access is reserved for the people entrusted to publish and steward GTO content.</p>
      </section>
      <form className="join-form" onSubmit={submit}>
        <div className="form-heading"><span>ADMIN</span><h2>Sign in to continue.</h2><p>Use your secure GTO staff account to publish and steward community content.</p></div>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="admin@gtooutreach.org" required /></label>
        <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter admin password" required /></label>
        <button type="submit" className="member-primary">Open admin dashboard <span aria-hidden="true">→</span></button>
        {error && <p className="admin-error">{error}</p>}
        {recoveryMessage && <p className="admin-notice">{recoveryMessage}</p>}
        <div className="admin-recovery">
          <p>Forgot your password?</p>
          <input type="email" value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} placeholder="Enter your account email" aria-label="Recovery email" />
          <button type="button" className="text-button" onClick={requestRecovery}>Send reset link</button>
        </div>
        <Link to="/" className="admin-back-link">Back to GTO home</Link>
      </form>
    </main>
  );
}

export default AdminLogin;
