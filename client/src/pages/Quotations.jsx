import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext.jsx';
import { Alert, Badge, Empty, Modal, money } from '../components/ui.jsx';

const blank = { client: '', request: '', status: 'Draft', notes: '', items: [{ description: '', qty: 1, price: 0 }] };

export default function Quotations() {
  const { user } = useAuth();
  const staff = user.role !== 'client';
  const [list, setList] = useState([]);
  const [clients, setClients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [f, setF] = useState({ q: '', status: '' });
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/quotations', { params: f }).then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, [f]);
  useEffect(() => {
    if (staff) {
      api.get('/clients').then((r) => setClients(r.data));
      api.get('/requests').then((r) => setRequests(r.data));
    }
  }, []);

  const setItem = (i, k, v) => setForm({ ...form, items: form.items.map((it, n) => (n === i ? { ...it, [k]: v } : it)) });
  const total = form ? form.items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0) : 0;

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.post('/quotations', form);
      setForm(null);
      setError('');
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const act = async (fn) => {
    try { await fn(); load(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <>
      <div className="page-head">
        <h2>Quotations</h2>
        {staff && <button className="btn primary" onClick={() => setForm(blank)}>New quotation</button>}
      </div>
      <Alert text={error} />
      <div className="filters">
        <input placeholder="Search by quotation number" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        {staff && (
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            <option value="">All statuses</option>
            {['Draft', 'Sent', 'Accepted', 'Rejected'].map((s) => <option key={s}>{s}</option>)}
          </select>
        )}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Number</th><th>Client</th><th>Request</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map((q) => (
              <tr key={q._id}>
                <td>{q.number}</td>
                <td>{q.client?.name}</td>
                <td>{q.request?.title || '—'}</td>
                <td>{money(q.total)}</td>
                <td><Badge value={q.status} /></td>
                <td className="actions">
                  {staff && q.status === 'Draft' && (
                    <button className="link" onClick={() => act(() => api.put('/quotations/' + q._id, { status: 'Sent' }))}>Send to client</button>
                  )}
                  {!staff && q.status === 'Sent' && (
                    <>
                      <button className="link" onClick={() => act(() => api.put(`/quotations/${q._id}/respond`, { status: 'Accepted' }))}>Accept</button>
                      <button className="link danger" onClick={() => act(() => api.put(`/quotations/${q._id}/respond`, { status: 'Rejected' }))}>Reject</button>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <button className="link danger" onClick={() => window.confirm('Delete this quotation?') && act(() => api.delete('/quotations/' + q._id))}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <Empty text="No quotations yet." />}
      </div>

      {form && (
        <Modal title="New quotation" onClose={() => setForm(null)}>
          <form onSubmit={save}>
            <label>Client
              <select required value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value, request: '' })}>
                <option value="">Select a client</option>
                {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </label>
            <label>Linked service request (optional)
              <select value={form.request} onChange={(e) => setForm({ ...form, request: e.target.value })}>
                <option value="">None</option>
                {requests.filter((r) => r.client?._id === form.client).map((r) => <option key={r._id} value={r._id}>{r.title}</option>)}
              </select>
            </label>
            <div className="items">
              {form.items.map((it, i) => (
                <div className="item-row" key={i}>
                  <input placeholder="Item description" required value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} />
                  <input type="number" min="1" value={it.qty} onChange={(e) => setItem(i, 'qty', e.target.value)} aria-label="Quantity" />
                  <input type="number" min="0" value={it.price} onChange={(e) => setItem(i, 'price', e.target.value)} aria-label="Price" />
                  {form.items.length > 1 && <button type="button" className="icon-btn" onClick={() => setForm({ ...form, items: form.items.filter((_, n) => n !== i) })}>×</button>}
                </div>
              ))}
              <button type="button" className="link" onClick={() => setForm({ ...form, items: [...form.items, { description: '', qty: 1, price: 0 }] })}>Add item</button>
            </div>
            <p className="total">Total: <b>{money(total)}</b></p>
            <label>Notes<textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
            <label>Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Draft</option><option>Sent</option>
              </select>
            </label>
            <button className="btn primary">Save quotation</button>
          </form>
        </Modal>
      )}
    </>
  );
}
