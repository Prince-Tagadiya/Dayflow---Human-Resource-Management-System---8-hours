import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, User, Clock, Calendar, CreditCard, Settings, HelpCircle, LogOut,
  Menu, Search, Bell, Plus, Sun, Thermometer, CheckCircle, PartyPopper, CalendarDays,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { AuthService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

import { EmployeeService } from '../../services/employeeService';
import type { EmployeeProfile, TimeOffRequest } from '../../types';

import { ApplyLeave } from './ApplyLeave';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // View State for Navigation
  const [view, setView] = useState<'dashboard' | 'apply-leave'>('dashboard');

  // Data State
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [balances, setBalances] = useState({
    casual: { taken: 0, total: 12 },
    sick: { taken: 0, total: 10 },
    privilege: { taken: 0, total: 20 },
    unpaid: { taken: 0, total: 0 }
  });
  // const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]); // Future use

  // State for Check-In/Out Simulation
  const [status, setStatus] = useState<'clocked-in' | 'clocked-out'>('clocked-out');
  const [checkInTime, setCheckInTime] = useState<string>('09:00'); // Default simulated time
  const [checkOutTime, setCheckOutTime] = useState<string>('18:00'); // Default simulated time
  const [displayTime, setDisplayTime] = useState<string>('09:00'); // For the big display

  useEffect(() => {
    let unsubscribe: () => void;
    if (user?.uid) {
      const fetchEmployeeData = async () => {
        try {
          // Try fetching by UID since we might not have employeeId in the user context directly
          const p = await EmployeeService.getProfileByUid(user.uid);

          if (p) {
            setProfile(p);
            // 1. Static Balances
            const b = await EmployeeService.getLeaveBalances(p.id);
            setBalances(b);
            // 2. Real-time Leaves
            unsubscribe = EmployeeService.subscribeToLeaveRequests(p.id, (l) => {
              setRequests(l);
              // Also refresh balances whenever leaves change (real-time balance update)
              EmployeeService.getLeaveBalances(p.id).then(setBalances);
            });
          }
        } catch (e) {
          console.error("Failed to load employee data", e);
        }
      };
      fetchEmployeeData();
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // Update clock every minute for display if not overriding
  useEffect(() => {
    const timer = setInterval(() => {
      if (status === 'clocked-out') {
        const now = new Date();
        setDisplayTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login');
  };

  const handleClockIn = () => {
    // SIMULATION: Use the edited time
    setStatus('clocked-in');

    // Convert 24h input to 12h display format for the big clock
    const [hours, minutes] = checkInTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    setDisplayTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
  };

  const handleClockOut = () => {
    setStatus('clocked-out');
    // SIMULATION: Use the edited check-out time
    const [hours, minutes] = checkOutTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    setDisplayTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
  };

  const getInitials = () => {
    const fName = profile?.firstName?.trim();
    const lName = profile?.lastName?.trim();
    if (fName && lName) {
      return `${fName[0]}${lName[0]}`.toUpperCase();
    }
    const dName = user?.displayName?.trim();
    if (dName) {
      const names = dName.split(/\s+/);
      if (names.length >= 2) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      return names[0][0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex h-screen w-full bg-[#f6f6f8] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-30 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col h-screen`}>
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100">
          <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            D
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Dayflow</h1>
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-6">
          <nav className="flex flex-col gap-1">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Menu</p>
            <button onClick={() => setView('dashboard')} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${view === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              <LayoutDashboard size={20} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors group">
              <User size={20} className="group-hover:text-blue-600 transition-colors" />
              <span className="text-sm font-medium group-hover:text-slate-900">Profile</span>
            </a>
            <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors group">
              <Clock size={20} className="group-hover:text-blue-600 transition-colors" />
              <span className="text-sm font-medium group-hover:text-slate-900">Attendance</span>
            </a>
            <button onClick={() => setView('apply-leave')} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${view === 'apply-leave' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Calendar size={20} className={view === 'apply-leave' ? '' : "group-hover:text-blue-600 transition-colors"} />
              <span className="text-sm font-medium">Leaves</span>
            </button>
            <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors group">
              <CreditCard size={20} className="group-hover:text-blue-600 transition-colors" />
              <span className="text-sm font-medium group-hover:text-slate-900">Payroll</span>
            </a>
          </nav>

          <nav className="flex flex-col gap-1">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">System</p>
            <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors group">
              <Settings size={20} className="group-hover:text-blue-600 transition-colors" />
              <span className="text-sm font-medium group-hover:text-slate-900">Settings</span>
            </a>
            <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors group">
              <HelpCircle size={20} className="group-hover:text-blue-600 transition-colors" />
              <span className="text-sm font-medium group-hover:text-slate-900">Help Center</span>
            </a>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-rose-600 hover:bg-rose-50 transition-colors">
                <LogOut size={20} />
                <span className="text-sm font-medium">Log Out</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex h-full flex-1 flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100">
              <Menu size={24} />
            </button>
            <span className="text-lg font-bold text-slate-900">Dayflow</span>
          </div>

          <div className="hidden lg:block">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="cursor-pointer hover:text-slate-800" onClick={() => setView('dashboard')}>Dashboard</span>
              {view === 'apply-leave' && (
                <>
                  <ChevronDown size={14} className="-rotate-90" />
                  <span className="font-semibold text-slate-900">Apply Leave</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search..."
                type="text"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="relative flex size-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors">
                <Bell size={20} />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </button>
            </div>

            {/* User Dropdown */}
            <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-200 sm:pl-6">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">{profile?.firstName || user?.displayName || 'User'}</p>
                <p className="text-xs text-slate-500">{profile?.designation || 'Employee'}</p>
              </div>
              <button className="group relative size-9 overflow-hidden rounded-full bg-slate-200 ring-2 ring-transparent transition-all hover:ring-blue-500/20">
                <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                  {getInitials()}
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-[#f6f6f8] p-4 sm:p-6 lg:p-8">
          {view === 'apply-leave' ? (
            <ApplyLeave
              profile={profile}
              balances={balances}
              onCancel={() => setView('dashboard')}
              onSuccess={() => {
                alert("Leave application submitted successfully!");
                // Refresh Data
                if (user as any) {
                  // Use profile.id if available
                  if (profile?.id) {
                    EmployeeService.getLeaveRequests(profile.id).then(setRequests);
                    EmployeeService.getLeaveBalances(profile.id).then(setBalances);
                  }
                }
                setView('dashboard');
              }}
            />
          ) : (
            <div className="w-full">
              {/* Page Heading */}
              <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Good Morning, {profile?.firstName || user?.displayName?.split(' ')[0] || 'Employee'} 👋</h1>
                  <p className="text-sm text-slate-500 mt-1">Here's what's happening with you today.</p>
                </div>
                <div className="mt-4 flex items-center gap-3 sm:mt-0">
                  <span className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-900/5">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button onClick={() => setView('apply-leave')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/30 transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <Plus size={20} />
                    Apply Leave
                  </button>
                </div>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 xl:gap-8">
                {/* Left Column (Main Data) */}
                <div className="flex flex-col gap-6 lg:col-span-8">

                  {/* Attendance Section - Full Width */}
                  <div className="flex flex-col gap-6">

                    {/* Clock In/Out Card */}
                    <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500">Current Status</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="relative flex size-2.5">
                              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${status === 'clocked-in' ? 'bg-emerald-400' : 'bg-slate-400'} opacity-75`}></span>
                              <span className={`relative inline-flex size-2.5 rounded-full ${status === 'clocked-in' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                            </span>
                            <span className="text-lg font-bold text-slate-900 capitalize">{status.replace('-', ' ')}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Shift: 09:00 - 18:00</p>
                          <p className="font-mono text-xl font-bold tracking-tight text-slate-900">
                            {displayTime}
                          </p>
                        </div>
                      </div>

                      {/* EDITABLE TIME SIMULATION SECTION */}
                      <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                          <div className="flex flex-col gap-1 w-full sm:w-auto">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              {status === 'clocked-out' ? 'Set Simulation Check-In Time' : 'Set Simulation Check-Out Time'}
                            </label>
                            <input
                              type="time"
                              value={status === 'clocked-out' ? checkInTime : checkOutTime}
                              onChange={(e) => status === 'clocked-out' ? setCheckInTime(e.target.value) : setCheckOutTime(e.target.value)}
                              className="block w-full sm:w-40 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg font-mono"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              {status === 'clocked-out' ? "Select time and click 'Clock In'" : "Select time and click 'Clock Out'"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={handleClockIn}
                          disabled={status === 'clocked-in'}
                          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${status === 'clocked-in' ? 'bg-emerald-50 text-emerald-600 opacity-50 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        >
                          Clock In
                        </button>
                        <button
                          onClick={handleClockOut}
                          disabled={status === 'clocked-out'}
                          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${status === 'clocked-out' ? 'bg-rose-50 text-rose-600 opacity-50 cursor-not-allowed' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                        >
                          Clock Out
                        </button>
                      </div>
                    </div>

                  </div> {/* Closes Attendance Section - Full Width */}

                  {/* Leave Balances */}
                  <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-900">Leave Balance</h3>
                      <a className="text-sm font-medium text-blue-600 hover:text-blue-700" href="#">View Details</a>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {[
                        { title: 'Casual Leave', data: balances.casual, color: 'bg-blue-500', icon: <Sun size={20} /> },
                        { title: 'Sick Leave', data: balances.sick, color: 'bg-rose-500', icon: <Thermometer size={20} /> },
                        { title: 'Privilege Leave', data: balances.privilege, color: 'bg-emerald-500', icon: <CheckCircle size={20} /> },
                      ].map((leave, i) => (
                        <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                          <div className="mb-2 flex items-center gap-2 text-slate-500">
                            {leave.icon}
                            <span className="text-sm font-medium">{leave.title}</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900">{leave.data.taken.toString().padStart(2, '0')}</span>
                            <span className="text-sm text-slate-500">/ {leave.data.total} days</span>
                          </div>
                          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200">
                            <div className={`h-1.5 rounded-full ${leave.color}`} style={{ width: `${(leave.data.taken / leave.data.total) * 100}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Request Status Table */}
                  <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                      <h3 className="text-base font-semibold text-slate-900">Request Status</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-6 py-3 font-medium">Request Type</th>
                            <th className="px-6 py-3 font-medium">Dates</th>
                            <th className="px-6 py-3 font-medium">Applied On</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {requests.length > 0 ? requests.slice(0, 5).map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-slate-900 font-medium capitalize">{req.type} Leave</td>
                              <td className="px-6 py-4 text-slate-500">{req.startDate} to {req.endDate}</td>
                              <td className="px-6 py-4 text-slate-500">
                                {req.appliedAt ? new Date(req.appliedAt).toLocaleDateString() : (req.startDate ? new Date(req.startDate).toLocaleDateString() : 'N/A')}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${req.status === 'approved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                    req.status === 'rejected' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                      'bg-amber-50 text-amber-700 ring-amber-600/20'
                                  }`}>
                                  {req.status === 'approved' ? 'Accepted' : req.status === 'rejected' ? 'Declined' : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan={4} className="p-6 text-center text-slate-500">No requests found</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-center">
                      <button className="text-xs font-medium text-blue-600 hover:text-blue-700">View All History</button>
                    </div>
                  </div>
                </div>

                {/* Right Column (Sidebar Widgets) */}
                <div className="flex flex-col gap-6 lg:col-span-4">
                  {/* Profile Summary Card */}
                  <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-2xl font-bold shadow-sm">
                        {getInitials()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : (user?.displayName || 'User')}
                        </h3>
                        <p className="text-sm text-slate-500">ID: {profile?.companyCode || '---'}</p>
                        <span className="mt-1 inline-flex items-center gap-1.5 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <span className="size-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 pt-4">
                      <div className="text-center px-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Department</p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-900">{profile?.department || '---'}</p>
                      </div>
                      <div className="text-center px-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Designation</p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-900">{profile?.designation || '---'}</p>
                      </div>
                    </div>
                    <button className="w-full rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 transition-colors">
                      View Full Profile
                    </button>
                  </div>

                  {/* Alerts / Holidays */}
                  <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 shadow-md text-white">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                        <PartyPopper className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Upcoming Holiday</h3>
                        <p className="mt-1 text-sm text-blue-100">Makar Sankranti</p>
                        <div className="mt-3 flex items-center gap-2 text-sm font-medium">
                          <CalendarDays size={18} />
                          Jan 14, 2026 - Jan 15, 2026
                        </div>
                      </div>
                    </div>
                  </div>


                  {/* Activity Timeline REMOVED */}
                </div>

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

