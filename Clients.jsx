import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext.jsx';
import { Alert, Empty, Modal } from '../components/ui.jsx';

const blank = { name: '', email: '', phone: '', company: '', address: '', notes: '' };

export default function Clients() {
  const { user } = useAuth();
  const staff = user.role !== 'client';
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/clients', { params: { q } }).then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, [q]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      form._id ? await api.put('/clients/' + form._id, form) : await api.post('/clients', form);
      setForm(null);
      setError('');
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    try { await api.delete('/clients/' + id); load(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <>
      <div className="page-head">
        <h2>{staff ? 'Clients' : 'My profile'}</h2>
        {staff && <button className="btn primary" onClick={() => setForm(blank)}>Add client</button>}
      </div>
      <Alert text={error} />
      {staff && (
        <div className="filters">
          <input placeholder="Search by name, email, company or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Address</th>{staff && <th></th>}</tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td><td>{c.company}</td><td>{c.email}</td><td>{c.phone}</td><td>{c.address}</td>
                {staff && (
                  <td className="actions">
                    <button className="link" onClick={() => setForm(c)}>Edit</button>
                    {user.role === 'admin' && <button className="link danger" onClick={() => remove(c._id)}>Delete</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <Empty text="No clients found. Add your first client to get started." />}
      </div>

      {form && (
        <Modal title={form._id ? 'Edit client' : 'Add client'} onClose={() => setForm(null)}>
          <form onSubmit={save}>
            <label>Name<input required value={form.name} onChange={set('name')} /></label>
            <div className="row2">
              <label>Email<input type="email" value={form.email || ''} onChange={set('email')} /></label>
              <label>Phone<input value={form.phone || ''} onChange={set('phone')} /></label>
            </div>
            <label>Company<input value={form.company || ''} onChange={set('company')} /></label>
            <label>Address<input value={form.address || ''} onChange={set('address')} /></label>
            <label>Notes<textarea rows="3" value={form.notes || ''} onChange={set('notes')} /></label>
            <button className="btn primary">Save client</button>
          </form>
        </Modal>
      )}
    </>
  );
}
