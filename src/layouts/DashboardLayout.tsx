import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

const DashboardLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/jobs', label: 'Jobs' },
    { path: '/clients', label: 'Clients' },
    { path: '/credits', label: 'Credits' },
    { path: '/gpu', label: 'GPU Resources' },
    { path: '/logs', label: 'Logs' },
    { path: '/reports', label: 'Reports' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white border-r border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-semibold text-white">Batch Admin</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Administration Dashboard</p>
        </div>
        
        {/* User info */}
        {user && (
          <div className="p-4 border-b border-gray-800">
            <p className="text-sm text-gray-300">{user.name}</p>
            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
          </div>
        )}
        
        <nav className="mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white border-l-4 border-blue-500'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-800"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 px-8 py-8 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

