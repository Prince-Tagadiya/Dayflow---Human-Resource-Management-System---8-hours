import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { LogOut, Users, Clock, Calendar, Menu, TrendingUp, AlertCircle, CheckCircle, XCircle, Search, Filter, Settings, Banknote, Check, X, CalendarDays, FileText, ChevronDown } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { AdminService } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';
import { CreateEmployeeModal } from './CreateEmployeeModal';
import { AttendanceView } from './AttendanceView';
import { EmployeeDirectoryView } from './EmployeeDirectoryView';
import { PayrollPage } from '../payroll/PayrollPage';
import type { EmployeeProfile, AttendanceRecord, TimeOffRequest } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'leaves' | 'payroll'>('employees');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data State
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<TimeOffRequest[]>([]);

  // Payroll state
  const [selectedPayrollEmployee, setSelectedPayrollEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Computed Stats
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0
  });

  // Local state for admin notes on requests
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});

  // Fetch Data based on active tab and Stats
  useEffect(() => {
    fetchData();
    fetchStats();
  }, [activeTab]);

  const fetchStats = async () => {
    // Quick fetch for top cards (Optimized in real app to be single query)
    try {
      const allEmps = await AdminService.getAllEmployees();
      const allLeaves = await AdminService.getAllTimeOffRequests();
      const today = new Date().toISOString().split('T')[0];
      const todaysAttendance = await AdminService.getAllAttendance(today);

      setStats({
        totalEmployees: Array.isArray(allEmps) ? allEmps.length : 0,
        presentToday: Array.isArray(todaysAttendance) ? (todaysAttendance as AttendanceRecord[]).filter(a => a?.status === 'present').length : 0,
        pendingLeaves: Array.isArray(allLeaves) ? (allLeaves as TimeOffRequest[]).filter(l => l?.status === 'pending').length : 0
      });
    } catch (e) {
      console.error("Stats fetch error", e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'employees') {
        const data = await AdminService.getAllEmployees();
        setEmployees(data as EmployeeProfile[]);
        const today = new Date().toISOString().split('T')[0];
        const todayAtt = await AdminService.getAllAttendance(today);
        setAttendance(todayAtt as AttendanceRecord[]);
      } else if (activeTab === 'attendance') {
        const data = await AdminService.getAllAttendance();
        setAttendance(data as AttendanceRecord[]);
        // Ensure we have employees for name mapping
        if (employees.length === 0) {
          const emps = await AdminService.getAllEmployees();
          setEmployees(emps as EmployeeProfile[]);
        }
      } else if (activeTab === 'leaves') {
        const data = await AdminService.getAllTimeOffRequests();
        setLeaves(data as TimeOffRequest[]);
        if (employees.length === 0) {
          const emps = await AdminService.getAllEmployees();
          setEmployees(emps as EmployeeProfile[]);
        }
      } else if (activeTab === 'payroll') {
        await AdminService.getAllPayrollRecords();
        // setPayroll(data as PayrollRecord[]); <- Removed unused state
        // We need employees to show the list for Salary Structure updates
        if (employees.length === 0) {
          const emps = await AdminService.getAllEmployees();
          setEmployees(emps as EmployeeProfile[]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login');
  };

  const handleLeaveAction = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    try {
      await AdminService.updateTimeOffRequestStatus(requestId, status, user.uid, adminNotes[requestId]);
      setAdminNotes(prev => ({ ...prev, [requestId]: '' })); // Clear note after action
      fetchData(); // Refresh list
      fetchStats(); // Update stats
    } catch (e) {
      console.error("Action failed", e);
    }
  };

  const getEmployeeName = (empId: string) => {
    const emp = employees.find(e => e.id === empId || e.uid === empId);
    return emp ? `${emp.firstName} ${emp.lastName}` : empId;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans text-gray-900">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-30 w-72 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">D</div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Dayflow</span>
          </div>

          <nav className="space-y-1.5">
            <SidebarItem
              icon={<Users size={20} />}
              label="Employees"
              isActive={activeTab === 'employees'}
              onClick={() => setActiveTab('employees')}
            />
            <SidebarItem
              icon={<Clock size={20} />}
              label="Attendance"
              isActive={activeTab === 'attendance'}
              onClick={() => setActiveTab('attendance')}
            />
            <SidebarItem
              icon={<Calendar size={20} />}
              label="Leave Requests"
              isActive={activeTab === 'leaves'}
              onClick={() => setActiveTab('leaves')}
              badge={stats.pendingLeaves > 0 ? stats.pendingLeaves : undefined}
            />
            <SidebarItem
              icon={<Banknote size={20} />}
              label="Payroll"
              isActive={activeTab === 'payroll'}
              onClick={() => setActiveTab('payroll')}
            />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-md">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 bg-white border border-red-100 hover:bg-red-50 rounded-lg font-medium text-sm transition-all shadow-sm">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 md:hidden flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600">
              <Menu size={24} />
            </button>
            <span className="font-bold text-gray-900">Dayflow</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Header & Stats */}
            {/* Header - Hidden for Employees tab as it has its own internal header */}
            {activeTab !== 'employees' && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight capitalize">{activeTab}</h1>
                  <p className="text-gray-500 mt-1 text-sm font-medium">Overview of your organization's {activeTab}.</p>
                </div>
                {/* Add Employee Button Moved to EmployeeDirectoryView */}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title={activeTab === 'leaves' ? "Pending Requests" : "Total Employees"}
                value={activeTab === 'leaves' ? leaves.filter(l => l.status === 'pending').length : stats.totalEmployees}
                icon={activeTab === 'leaves' ? <CalendarDays size={24} className="text-amber-600" /> : <Users size={24} className="text-blue-600" />}
                bg={activeTab === 'leaves' ? "bg-amber-50" : "bg-blue-50"}
                trend={activeTab === 'leaves' ? `${leaves.filter(l => l.status === 'pending').length} pending` : "+2 this month"}
                urgent={activeTab === 'leaves' ? true : false}
              />
              <StatsCard
                title={activeTab === 'leaves' ? "Approved This Month" : "Present Today"}
                value={activeTab === 'leaves' ? leaves.filter(l => l.status === 'approved').length : stats.presentToday}
                icon={activeTab === 'leaves' ? <CheckCircle size={24} className="text-green-600" /> : <CheckCircle size={24} className="text-green-600" />}
                bg="bg-green-50"
                trend={activeTab === 'leaves' ? "Approved" : "85% Attendance"}
              />
              <StatsCard
                title={activeTab === 'leaves' ? "Rejected This Month" : "Pending Requests"}
                value={activeTab === 'leaves' ? leaves.filter(l => l.status === 'rejected').length : stats.pendingLeaves}
                icon={activeTab === 'leaves' ? <XCircle size={24} className="text-red-600" /> : <AlertCircle size={24} className="text-amber-600" />}
                bg={activeTab === 'leaves' ? "bg-red-50" : "bg-amber-50"}
                trend={activeTab === 'leaves' ? "Rejected" : "Needs Attention"}
                urgent={activeTab !== 'leaves' && stats.pendingLeaves > 0}
              />
            </div>

            {/* Content Section */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-400 font-medium">Loading data...</p>
              </div>
            ) : (
              <>
                {/* EMPLOYEES TAB - New Directory View */}
                {activeTab === 'employees' ? (
                  <EmployeeDirectoryView
                    employees={employees}
                    attendance={attendance}
                    onAddEmployee={() => setShowCreateModal(true)}
                  />
                ) : activeTab === 'attendance' ? (
                  /* ATTENDANCE TAB - Full Width Custom View */
                  <AttendanceView
                    employees={employees}
                    attendance={attendance}
                    onUpdateStatus={(id: string, status: string) => console.log('Update status', id, status)}
                  />
                ) : activeTab === 'leaves' ? (
                  // LEAVES VIEW (Cards)
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-900">Recent Requests</h2>
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View History</button>
                    </div>

                    {leaves.length > 0 ? leaves.map((req) => {
                      const emp = employees.find(e => e.id === req.employeeId) || {
                        firstName: 'Unknown', lastName: 'Employee', designation: 'N/A', department: 'N/A', id: req.employeeId, isActive: false, email: '', uid: '', loginId: '', dateOfJoining: ''
                      };
                      const fullName = `${emp.firstName} ${emp.lastName}`;
                      const initials = getInitials(emp.firstName, emp.lastName);
                      const isPending = req.status === 'pending';

                      const typeStyles: Record<string, string> = {
                        sick: 'bg-red-50 text-red-600',
                        casual: 'bg-blue-50 text-blue-600',
                        earned: 'bg-purple-50 text-purple-600',
                        unpaid: 'bg-gray-100 text-gray-600'
                      };

                      const typeLabel: Record<string, string> = {
                        sick: 'Medical', casual: 'Casual', earned: 'Privilege', unpaid: 'Unpaid'
                      };

                      return (
                        <div key={req.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-6 hover:shadow-md transition-all">
                          <div className="flex items-start gap-4 min-w-[200px]">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-white flex items-center justify-center font-bold text-lg shadow-md">
                              {initials}
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-gray-900">{fullName}</h3>
                              <p className="text-sm text-blue-600 font-medium">{emp.designation}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{emp.department}</p>
                            </div>
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${typeStyles[req.type] || 'bg-gray-100'}`}>
                                {typeLabel[req.type] || req.type} Leave
                              </span>
                              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                <Clock size={14} />
                                <span>{Math.ceil((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days</span>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">
                                {new Date(req.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                {' — '}
                                {new Date(req.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </h4>
                            </div>
                          </div>
                          <div className="flex-1 lg:max-w-md border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6 pt-4 lg:pt-0">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reason</h5>
                            <p className="text-sm text-gray-600 leading-relaxed">{req.reason}</p>
                          </div>
                          <div className="flex flex-col gap-3 min-w-[200px] border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6 pt-4 lg:pt-0 justify-center">
                            {isPending ? (
                              <>
                                <input
                                  type="text"
                                  placeholder="Add a note (optional)..."
                                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                  value={adminNotes[req.id] || ''}
                                  onChange={(e) => setAdminNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                                />
                                <button onClick={() => handleLeaveAction(req.id, 'approved')} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm shadow-blue-600/20">
                                  <Check size={16} /> Approve
                                </button>
                                <button onClick={() => handleLeaveAction(req.id, 'rejected')} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
                                  <X size={16} /> Reject
                                </button>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full">
                                {req.status === 'approved' && <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg"><CheckCircle size={20} /> Approved</div>}
                                {req.status === 'rejected' && <div className="flex items-center gap-2 text-red-600 font-bold bg-red-50 px-4 py-2 rounded-lg"><XCircle size={20} /> Rejected</div>}
                                {req.adminComments && <p className="text-xs text-gray-500 mt-2 text-center italic">"{req.adminComments}"</p>}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="p-12 text-center bg-white rounded-xl border border-gray-200"><p className="text-gray-500">No leave requests found.</p></div>
                    )}
                  </div>
                ) : (
                  /* OTHER TABS - Standard Layout */
                  <div className="space-y-6">

                    {/* Standard Table Container */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      {/* Generic Filter Bar */}
                      <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/30">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <Filter size={16} />
                          Filter
                        </button>
                      </div>


                      {/* PAYROLL TABLE */}
                      {activeTab === 'payroll' && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                              <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Designation</th>
                                <th className="px-6 py-4">Salary Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {Array.isArray(employees) && employees.length > 0 ? employees.map((emp) => (
                                <tr key={emp?.id || Math.random()} className="hover:bg-gray-50/80 transition-colors">
                                  <td className="px-6 py-4 font-medium text-gray-900">{emp?.firstName || 'Unknown'} {emp?.lastName || ''}</td>
                                  <td className="px-6 py-4 text-sm text-gray-600">{emp?.designation || '-'}</td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                      Not Configured
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                      onClick={() => emp?.firstName && alert(`Manage salary for ${emp.firstName}`)}
                                    >
                                      <Settings size={14} />
                                      Manage
                                    </button>
                                  </td>
                                </tr>
                              )) : (
                                <tr><td colSpan={4} className="p-12 text-center text-gray-500">No employees found.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'payroll' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {selectedPayrollEmployee ? (
                   <div className="p-6">
                      <button 
                        onClick={() => setSelectedPayrollEmployee(null)}
                        className="mb-4 text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
                      >
                         &larr; Back to Employee List
                      </button>
                      <PayrollPage 
                        allowEdit={true}
                        initialWage={selectedPayrollEmployee.ctc || 600000}
                        employeeName={`${selectedPayrollEmployee.firstName} ${selectedPayrollEmployee.lastName}`}
                        employeeId={selectedPayrollEmployee.companyCode || selectedPayrollEmployee.id}
                        onSave={async (details) => {
                            try {
                                const empId = selectedPayrollEmployee.id;
                                // Save CTC to Employee Profile
                                await AdminService.updateEmployee(empId, { ctc: details.ctc });
                                // Optionally save full breakdown to salaryStructures if needed, but CTC is enough for calculation
                                alert("Salary configuration saved successfully!");
                                setSelectedPayrollEmployee({ ...selectedPayrollEmployee, ctc: details.ctc }); // Optimistic update
                                fetchData(); // Refresh all data
                            } catch (e) {
                                console.error(e);
                                alert("Failed to save salary details.");
                            }
                        }}
                      />
                   </div>
                ) : (
                  <div className="p-6">
                     <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Payroll Management</h2>
                         <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input 
                              type="text" 
                              placeholder="Search employees..." 
                              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                            />
                          </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-y border-gray-100">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                             {employees.map(emp => (
                                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                                   <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center gap-3">
                                          <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                             {emp.firstName?.[0]}{emp.lastName?.[0]}
                                          </div>
                                          <div>
                                              <p className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                                              <p className="text-xs text-gray-500">{emp.email}</p>
                                          </div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.department}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.designation}</td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                      <StatusBadge status={emp.isActive ? 'Active' : 'Inactive'} />
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-right">
                                      <button 
                                        onClick={() => setSelectedPayrollEmployee(emp)}
                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors hover:bg-blue-100"
                                      >
                                        Manage Salary
                                      </button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                        </table>
                      </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>


      {/* Modals */}
      {showCreateModal && (
        <CreateEmployeeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchData();
            fetchStats();
          }}
        />
      )}
    </div>
  );
};

// --- Sub Components ---

const SidebarItem: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, badge?: number }> = ({ icon, label, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
  >
    <div className="flex items-center gap-3">
      <span className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}>{icon}</span>
      <span>{label}</span>
    </div>
    {badge ? (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
        {badge}
      </span>
    ) : null}
  </button>
);

const StatsCard: React.FC<{ title: string, value: number, icon: React.ReactNode, bg: string, trend: string, urgent?: boolean }> = ({ title, value, icon, bg, trend, urgent }) => (
  <div className={`bg-white p-6 rounded-2xl border ${urgent ? 'border-red-200 shadow-red-100' : 'border-gray-100'} shadow-sm hover:shadow-md transition-shadow`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${bg}`}>
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2 text-xs font-medium">
      <span className={urgent ? 'text-red-600' : 'text-green-600'}>
        {urgent ? <AlertCircle size={14} className="inline mr-1" /> : <TrendingUp size={14} className="inline mr-1" />}
        {trend}
      </span>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  // Defensive check
  const safeStatus = (status || 'unknown').toLowerCase();

  let styles = "bg-gray-100 text-gray-700";
  if (['present', 'approved', 'active'].includes(safeStatus)) styles = "bg-green-100 text-green-700 border border-green-200";
  if (['absent', 'rejected', 'inactive'].includes(safeStatus)) styles = "bg-red-100 text-red-700 border border-red-200";
  if (['pending', 'half-day'].includes(safeStatus)) styles = "bg-amber-100 text-amber-700 border border-amber-200";

  return (
    <span className={`capitalize inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles}`}>
      {status || 'Unknown'}
    </span>
  );
};
