import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Brain, FileSpreadsheet, BarChart2, TrendingUp } from 'lucide-react';

const ResearchLayout: React.FC = () => {
  const { user } = useAuthStore();

  const tabs = [
    { name: 'Research Portal', path: '/research/portal', icon: Brain, roles: ['research_partner', 'ministry_admin', 'super_admin'] },
    { name: 'Instruments', path: '/research/instruments', icon: FileSpreadsheet, roles: ['research_partner', 'ministry_admin', 'super_admin'] },
    { name: 'Analysis Workbench', path: '/research/analysis', icon: BarChart2, roles: ['research_partner', 'ministry_admin', 'super_admin'] },
    { name: 'Impact Dashboard', path: '/research/impact', icon: TrendingUp, roles: ['ministry_admin', 'super_admin'] },
  ];

  const filteredTabs = tabs.filter(tab => tab.roles.includes(user?.role || ''));

  return (
    <div className="space-y-6">
      <div className="bg-white border-b border-surface-border px-8 pt-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3 mb-6">
          <Brain className="text-primary" size={32} />
          Research & AI Operations
        </h1>
        <div className="flex space-x-8">
          {filteredTabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `pb-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`
              }
            >
              <tab.icon size={16} />
              {tab.name}
            </NavLink>
          ))}
        </div>
      </div>
      
      <div className="p-8 max-w-7xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default ResearchLayout;
