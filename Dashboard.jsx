import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext.jsx';
import { Alert, Empty, Badge, money } from '../components/ui.jsx';

function Bars({ title, data }) {
  const entries = Object.entries(data || {});
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <section className="panel">
      <h3>{title}</h3>
      {entries.length === 0 && <Empty text="Nothing to show yet." />}
      {entries.map(([k, v]) => (
        <div className="bar-row" key={k}>
          <span>{k}</span>
          <div className="bar"><i style={{ width: (v / max) * 100 + '%' }} /></div>
          <b>{v}</b>
        </div>
      ))}
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard').then((r) => setD(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  const download = async (type) => {
    try {
      const r = await api.get('/dashboard/report/' + type, { responseType: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(r.data);
      a.download = type + '-report.csv';
      a.click();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  if (error) return <Alert text={error} />;
  if (!d) return <p className="muted">Loading dashboard…</p>;

  const stats = [
    ['Clients', d.counts.clients],
    ['Service requests', d.counts.requests],
    ['Quotations', d.counts.quotations],
    ['Projects', d.counts.projects],
    ['Accepted quotation value', money(d.acceptedValue)],
  ];

  return (
    <>
      <div className="page-head"><h2>Dashboard</h2></div>
      <div className="stats">
        {stats.map(([label, value]) => (
          <div className="stat" key={label}>
            <b>{value}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="grid2">
        <Bars title="Requests by status" data={d.requestsByStatus} />
        <Bars title="Projects by status" data={d.projectsByStatus} />
        <Bars title="Quotations by status" data={d.quotationsByStatus} />
        <section className="panel">
          <h3>Recent service requests</h3>
          {d.recentRequests.length === 0 && <Empty text="No requests yet." />}
          {d.recentRequests.map((r) => (
            <div className="line" key={r._id}>
              <span>{r.title}<small>{r.client?.name}</small></span>
              <Badge value={r.status} />
            </div>
          ))}
        </section>
      </div>

      {user.role !== 'client' && (
        <section className="panel">
          <h3>Reports</h3>
          <p className="muted">Download the latest data as a CSV file.</p>
          <div className="actions">
            {['clients', 'requests', 'quotations', 'projects'].map((t) => (
              <button key={t} className="btn" onClick={() => download(t)}>Export {t}</button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
