import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext.jsx';
import { Alert, Badge, Empty, Modal } from '../components/ui.jsx';

const STATUSES = ['Not Started', 'In Progress', 'On Hold', 'Completed'];
const blank = { name: '', client: '', description: '', status: 'Not Started', progress: 0, startDate: '', dueDate: '' };
const day = (d) => (d ? String(d).slice(0, 10) : '');

export default function Projects() {
  const { user } = useAuth();
  const staff = user.role !== 'client';
  const [list, setList] = useState([]);
  const [clients, setClients] = useState([]);
  const [f, setF] = useState({ q: '', status: '' });
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/projects', { params: f }).then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, [f]);
  useEffect(() => { if (staff) api.get('/clients').then((r) => setClients(r.data)); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const edit = (p) => setForm({ ...p, client: p.client?._id || '', quotation: p.quotation?._id || '', startDate: day(p.startDate), dueDate: day(p.dueDate) });

  const save = async (e) => {
    e.preventDefault();
    const body = { ...form, startDate: form.startDate || null, dueDate: form.dueDate || null, progress: Number(form.progress) };
    try {
      form._id ? await api.put('/projects/' + form._id, body) : await api.post('/projects', body);
      setForm(null);
      setError('');
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try { await api.delete('/projects/' + id); load(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <>
      <div className="page-head">
        <h2>Projects</h2>
        {staff && <button className="btn primary" onClick={() => setForm(blank)}>New project</button>}
      </div>
      <Alert text={error} />
      <div className="filters">
        <input placeholder="Search projects" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Progress</th><th>Due date</th>{staff && <th></th>}</tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p._id}>
                <td>{p.name}<small>{p.quotation?.number && 'From ' + p.quotation.number}</small></td>
                <td>{p.client?.name}</td>
                <td><Badge value={p.status} /></td>
                <td><div className="bar"><i style={{ width: p.progress + '%' }} /></div><small>{p.progress}%</small></td>
                <td>{day(p.dueDate) || '—'}</td>
                {staff && (
                  <td className="actions">
                    <button className="link" onClick={() => edit(p)}>Edit</button>
                    {user.role === 'admin' && <button className="link danger" onClick={() => remove(p._id)}>Delete</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <Empty text="No projects yet. Accepted quotations create projects automatically." />}
      </div>

      {form && (
        <Modal title={form._id ? 'Edit project' : 'New project'} onClose={() => setForm(null)}>
          <form onSubmit={save}>
            <label>Project name<input required value={form.name} onChange={set('name')} /></label>
            <label>Client
              <select required value={form.client} onChange={set('client')}>
                <option value="">Select a client</option>
                {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </label>
            <label>Description<textarea rows="2" value={form.description || ''} onChange={set('description')} /></label>
            <div className="row2">
              <label>Status
                <select value={form.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
              </label>
              <label>Progress (%)<input type="number" min="0" max="100" value={form.progress} onChange={set('progress')} /></label>
            </div>
            <div className="row2">
              <label>Start date<input type="date" value={form.startDate} onChange={set('startDate')} /></label>
              <label>Due date<input type="date" value={form.dueDate} onChange={set('dueDate')} /></label>
            </div>
            <button className="btn primary">Save project</button>
          </form>
        </Modal>
      )}
    </>
  );
}
