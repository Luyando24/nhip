import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Skull, 
  Pill, 
  AlertTriangle, 
  FileText, 
  LogOut, 
  Activity,
  User,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Shell: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['all'] },
    { name: 'Digital Lab', icon: Sparkles, path: '/lab', roles: ['clinician', 'ministry_admin', 'super_admin'] },
    { name: 'Record Death', icon: Skull, path: '/deaths/new', roles: ['clinician', 'facility_admin', 'super_admin'] },
    { name: 'Mortality Records', icon: Activity, path: '/deaths', roles: ['all'] },
    { name: 'Drug Inventory', icon: Pill, path: '/inventory', roles: ['pharmacist', 'facility_admin', 'ministry_admin', 'super_admin'] },
    { name: 'Health Alerts', icon: AlertTriangle, path: '/alerts', roles: ['facility_admin', 'provincial_officer', 'ministry_admin', 'super_admin'] },
    { name: 'Research & AI', icon: FileText, path: '/research', roles: ['ministry_admin', 'super_admin'] },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes('all') || (user && item.roles.includes(user.role))
  );

  return (
    <div className="flex h-screen bg-surface">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-surface-border transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Activity size={24} />
          </div>
          {isSidebarOpen && <span className="font-bold text-xl text-primary tracking-tight">ZNHIP</span>}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              <item.icon size={20} className={isSidebarOpen ? 'mr-3' : ''} />
              {isSidebarOpen && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-border">
          <div className={`p-4 rounded-xl bg-surface flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <User size={20} />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate text-sm">{user?.fullName}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role.replace('_', ' ')}</p>
              </div>
            )}
            {isSidebarOpen && (
              <button 
                onClick={handleLogout}
                className="p-1 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-surface-border px-8 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-surface rounded-lg">
            {isSidebarOpen ? <Menu size={20} /> : <X size={20} />}
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-primary/5 px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-sm font-medium text-primary">System Online</span>
            </div>
            {user?.facilityId && (
              <span className="text-sm font-medium text-slate-500">{user.facilityId}</span>
            )}
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Shell;
