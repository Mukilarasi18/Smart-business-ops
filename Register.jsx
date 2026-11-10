import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { errMsg } from '../api';
import { Alert } from '../components/ui.jsx';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', company: '', staffCode: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={submit}>
        <h1>Create your account</h1>
        <Alert text={error} />
        <label>Full name<input required value={form.name} onChange={set('name')} /></label>
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Password<input type="password" required minLength={6} value={form.password} onChange={set('password')} /></label>
        <div className="row2">
          <label>Phone<input value={form.phone} onChange={set('phone')} /></label>
          <label>Company<input value={form.company} onChange={set('company')} /></label>
        </div>
        <label>Staff code (staff only)<input value={form.staffCode} onChange={set('staffCode')} placeholder="Leave empty if you are a client" /></label>
        <button className="btn primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
