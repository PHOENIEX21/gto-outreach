import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppData } from "../data/useAppData";

function PasswordReset() {
  const navigate = useNavigate();
  const { updatePassword } = useAppData();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setSaving(true);
    const result = await updatePassword(password);
    setSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    navigate("/admin-login", { replace: true });
  };

  return (
    <main className="join-page admin-login-page">
      <section className="join-intro">
        <p className="eyebrow">GTO STEWARDSHIP</p>
        <h1>Choose a new <span>password.</span></h1>
        <p>Set a new secure password for your GTO staff account, then return to sign in.</p>
      </section>
      <form className="join-form" onSubmit={submit}>
        <div className="form-heading"><span>SECURE ACCOUNT</span><h2>Update your password.</h2><p>Your new password must be at least 8 characters long.</p></div>
        <label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required /></label>
        <label>Confirm password<input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" required /></label>
        <button type="submit" className="member-primary" disabled={saving}>{saving ? "Saving..." : "Save new password"} <span aria-hidden="true">→</span></button>
        {error && <p className="admin-error">{error}</p>}
        <Link to="/admin-login" className="admin-back-link">Return to sign in</Link>
      </form>
    </main>
  );
}

export default PasswordReset;
