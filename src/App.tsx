import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import ClientNew from './pages/ClientNew';
import GPU from './pages/GPU';
import Logs from './pages/Logs';
import Reports from './pages/Reports';
import Credits from './pages/Credits';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/new" element={<ClientNew />} />
            <Route path="clients/:id/edit" element={<ClientDetail />} />
            <Route path="clients/:id/credits" element={<ClientDetail />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="credits" element={<Credits />} />
            <Route path="gpu" element={<GPU />} />
            <Route path="logs" element={<Logs />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
