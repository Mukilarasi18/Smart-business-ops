import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext.jsx';

function Bell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const load = () => api.get('/notifications').then((r) => setItems(r.data)).catch(() => {});

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const unread = items.filter((n) => !n.read).length;
  const markAll = async () => {
    await api.put('/notifications/read-all');
    load();
  };

  return (
    <div className="bell">
      <button className="btn ghost" onClick={() => setOpen(!open)}>
        Notifications {unread > 0 && <span className="count">{unread}</span>}
      </button>
      {open && (
        <div className="bell-panel">
          <div className="bell-head">
            <strong>Notifications</strong>
            {unread > 0 && <button className="link" onClick={markAll}>Mark all as read</button>}
          </div>
          {items.length === 0 && <p className="muted pad">You're all caught up.</p>}
          {items.map((n) => (
            <div key={n._id} className={'note' + (n.read ? '' : ' unread')}>
              {n.message}
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const links = [
    ['/', 'Dashboard'],
    ['/clients', user.role === 'client' ? 'My profile' : 'Clients'],
    ['/requests', 'Service requests'],
    ['/quotations', 'Quotations'],
    ['/projects', 'Projects'],
  ];
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">Smart Business<br />Operations</div>
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="top">
          <div className="who">
            {user.name} <span className="role">{user.role}</span>
          </div>
          <div className="top-actions">
            <Bell />
            <button className="btn ghost" onClick={logout}>Log out</button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
