import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { LogOut, Users, UserPlus, FileText, Settings, Menu } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { CreateEmployeeModal } from './CreateEmployeeModal';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-30 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
            <span className="text-xl font-bold text-gray-900">Dayflow HR</span>
          </div>

          <nav className="flex-1 space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium">
              <Users size={20} />
              Employees
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
              <FileText size={20} />
              Payroll
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
              <Settings size={20} />
              Settings
            </a>
          </nav>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
                AH
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin HR</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm transition-colors">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Mobile */}
        <header className="bg-white border-b border-gray-200 p-4 md:hidden flex items-center justify-between">
             <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600">
                    <Menu size={24} />
                </button>
                <span className="font-bold text-gray-900">Dayflow</span>
             </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
                <p className="text-gray-500 mt-1">Manage onboarding, roles, and profiles.</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
              >
                <UserPlus size={20} />
                Create Employee
              </button>
            </div>

            {/* Empty State or Table Placeholder */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Users size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No Employees Found</h3>
              <p className="text-gray-500 mt-1 max-w-sm mx-auto">Start by adding your first employee to the system. They will receive their credentials immediately.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateEmployeeModal 
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
                // Refresh list
                console.log("Employee list should refresh");
            }}
        />
      )}
    </div>
  );
};
