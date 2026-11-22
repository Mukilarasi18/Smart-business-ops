import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Clients from './pages/Clients.jsx';
import Requests from './pages/Requests.jsx';
import Quotations from './pages/Quotations.jsx';
import Projects from './pages/Projects.jsx';

function Private({ children }) {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/" element={<Private><Dashboard /></Private>} />
      <Route path="/clients" element={<Private><Clients /></Private>} />
      <Route path="/requests" element={<Private><Requests /></Private>} />
      <Route path="/quotations" element={<Private><Quotations /></Private>} />
      <Route path="/projects" element={<Private><Projects /></Private>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
