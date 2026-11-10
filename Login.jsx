import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { errMsg } from '../api';
import { Alert } from '../components/ui.jsx';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={submit}>
        <h1>Log in</h1>
        <p className="muted">Manage clients, requests, quotations and projects in one place.</p>
        <Alert text={error} />
        <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <button className="btn primary" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="muted">New client? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
