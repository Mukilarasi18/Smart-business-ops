import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext.jsx';
import { Alert, Badge, Empty, Modal } from '../components/ui.jsx';

const STATUSES = ['Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'];

export default function Requests() {
  const { user } = useAuth();
  const staff = user.role !== 'client';
  const [list, setList] = useState([]);
  const [clients, setClients] = useState([]);
  const [f, setF] = useState({ q: '', status: '', priority: '' });
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/requests', { params: f }).then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, [f]);
  useEffect(() => { if (staff) api.get('/clients').then((r) => setClients(r.data)); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', form);
      setForm(null);
      setError('');
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const setStatus = async (id, status) => {
    try { await api.put('/requests/' + id, { status }); load(); } catch (err) { setError(errMsg(err)); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try { await api.delete('/requests/' + id); load(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <>
      <div className="page-head">
        <h2>Service requests</h2>
        <button className="btn primary" onClick={() => setForm({ client: '', title: '', description: '', priority: 'Medium' })}>New request</button>
      </div>
      <Alert text={error} />
      <div className="filters">
        <input placeholder="Search requests" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>
          <option value="">All priorities</option>
          {['Low', 'Medium', 'High'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Client</th><th>Priority</th><th>Status</th><th>Created</th>{user.role === 'admin' && <th></th>}</tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r._id}>
                <td>{r.title}<small>{r.description}</small></td>
                <td>{r.client?.name}</td>
                <td><Badge value={r.priority} /></td>
                <td>
                  {staff ? (
                    <select value={r.status} onChange={(e) => setStatus(r._id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  ) : <Badge value={r.status} />}
                </td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                {user.role === 'admin' && <td><button className="link danger" onClick={() => remove(r._id)}>Delete</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <Empty text="No service requests match your filters." />}
      </div>

      {form && (
        <Modal title="New service request" onClose={() => setForm(null)}>
          <form onSubmit={save}>
            {staff && (
              <label>Client
                <select required value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })}>
                  <option value="">Select a client</option>
                  {clients.map((c) => <option key={c._id} value={c._id}>{c.name}{c.company ? ' – ' + c.company : ''}</option>)}
                </select>
              </label>
            )}
            <label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label>Description<textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label>Priority
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {['Low', 'Medium', 'High'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <button className="btn primary">Submit request</button>
          </form>
        </Modal>
      )}
    </>
  );
}
