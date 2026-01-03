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
import type { EmployeeProfile, TimeOffRequest, AttendanceRecord } from '../../types';

import { ApplyLeave } from './ApplyLeave';
import { ProfilePage } from './ProfilePage';
import { PayrollPage } from '../payroll/PayrollPage';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // View State for Navigation
  const [view, setView] = useState<'dashboard' | 'apply-leave' | 'profile' | 'payroll' | 'attendance'>('dashboard');

  // Data State
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [balances, setBalances] = useState({
    casual: { taken: 0, total: 12 },
    sick: { taken: 0, total: 10 },
    privilege: { taken: 0, total: 20 },
    unpaid: { taken: 0, total: 0 }
  });

  // State for Check-In/Out Simulation
  const [status, setStatus] = useState<'clocked-in' | 'clocked-out'>('clocked-out');

  // Robust Date Parsing Helper
  const safeParseDate = (date: any): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return isNaN(date.getTime()) ? null : date;
    if (typeof date === 'string') {
      const d = new Date(date);
      return isNaN(d.getTime()) ? null : d;
    }
    // Handle Firestore Timestamp objects
    if (date && typeof date.toDate === 'function') return date.toDate();
    return null;
  };

  // Helper to get local ISO string for datetime-local
  const getLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const [checkInTime, setCheckInTime] = useState<string>(getLocalISOString(new Date()));
  const [checkOutTime, setCheckOutTime] = useState<string>(getLocalISOString(new Date()));
  const [displayTime, setDisplayTime] = useState<string>('---'); // For the big display

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [clearedIds, setClearedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('clearedNotifications') || '[]');
    } catch {
      return [];
    }
  });

  const [activityClearTime, setActivityClearTime] = useState<string | null>(() => {
     return localStorage.getItem('activityClearTime');
  });

  // Summary Modal State
  const [summaryModal, setSummaryModal] = useState<{
    show: boolean;
    data: {
      date: string;
      checkIn: string;
      checkOut: string;
      duration: string;
      isLate: boolean;
    } | null;
  }>({ show: false, data: null });

  useEffect(() => {
    let unsubscribeLeaves: (() => void) | undefined;
    let unsubscribeAttendance: (() => void) | undefined;

    if (user?.uid) {
      const fetchEmployeeData = async () => {
        try {
          const p = await EmployeeService.getProfileByUid(user.uid);
          if (p) {
            setProfile(p);

            // 1. Static Balances
            const b = await EmployeeService.getLeaveBalances(p.id);
            setBalances(b);

            // 2. Real-time Leaves
            if ((EmployeeService as any).subscribeToLeaveRequests) {
              unsubscribeLeaves = (EmployeeService as any).subscribeToLeaveRequests(p.id, (l: TimeOffRequest[]) => {
                setRequests(l);
                // Also refresh balances whenever leaves change (real-time balance update)
                EmployeeService.getLeaveBalances(p.id).then(setBalances);
              });
            } else {
              const l = await EmployeeService.getLeaveRequests(p.id);
              setRequests(l);
            }

            // 3. Real-time Attendance
            unsubscribeAttendance = EmployeeService.subscribeToAttendance(p.id, (a) => {
              setAttendance(a);
              // Update status based on latest attendance
              if (a.length > 0) {
                // Find latest OPEN record (no checkOut)
                const openRecord = a.find(rec => !rec.checkOut);
                
                if (openRecord && openRecord.checkIn) {
                    setStatus('clocked-in');
                    const date = new Date(openRecord.checkIn);
                    setDisplayTime(date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }));
                } else {
                    setStatus('clocked-out');
                    // Use latest record for display
                    const latest = a[0]; // Already sorted by desc
                    if (latest && latest.checkOut) {
                      const date = new Date(latest.checkOut);
                      setDisplayTime(date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }));
                    }
                }
              }
            });
          }
        } catch (e) {
          console.error("Failed to load employee data", e);
        }
      };
      fetchEmployeeData();
    }
    return () => {
      if (unsubscribeLeaves) unsubscribeLeaves();
      if (unsubscribeAttendance) unsubscribeAttendance();
    };
  }, [user]);

  // Update clock every minute for display if not overriding
  useEffect(() => {
    const timer = setInterval(() => {
      if (status === 'clocked-out') {
        const now = new Date();
        setDisplayTime(now.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }));
      }
    }, 60000); // 1 minute
    return () => clearInterval(timer);
  }, [status]);

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login');
  };

  const handleClockIn = async () => {
    if (!profile) return;

    // Use selected date-time directly
    const date = safeParseDate(checkInTime) || new Date();

    try {
      await EmployeeService.clockIn(profile.id, date.toISOString());
      setStatus('clocked-in');
      setDisplayTime(date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }));
    } catch (e) {
      console.error("Clock in failed", e);
    }
  };

  const handleClockOut = async () => {
    if (!profile) return;

    // Use selected date-time directly
    const date = safeParseDate(checkOutTime) || new Date();
    const dateStr = date.toISOString().split('T')[0];

    try {
      await EmployeeService.clockOut(profile.id, date.toISOString());
      setStatus('clocked-out');
      setDisplayTime(date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }));

      // Prepare data for summary
      const todayRecord = attendance.find(r => r.date === dateStr);
      let checkInVal = todayRecord?.checkIn;

      // If not found in current state (edge case), try fetching
      if (!checkInVal) {
        const rec = await EmployeeService.getTodayAttendance(profile.id);
        if (rec) checkInVal = rec.checkIn;
      }

      const start = safeParseDate(checkInVal);
      const end = date;

      if (start && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diff = end.getTime() - start.getTime();
        const hours = Math.floor(Math.max(0, diff) / 3600000);
        const mins = Math.floor((Math.max(0, diff) % 3600000) / 60000);

        // Define Late Threshold (e.g., 9:15 AM)
        const shiftStart = new Date(start);
        shiftStart.setHours(9, 15, 0, 0);
        const isLate = start > shiftStart;

        setSummaryModal({
          show: true,
          data: {
            date: end.toISOString(),
            checkIn: start.toISOString(),
            checkOut: end.toISOString(),
            duration: `${hours}h ${mins}m`,
            isLate: isLate
          }
        });
      }
    } catch (e) {
      console.error("Clock out failed", e);
    }
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
            <button onClick={() => setView('profile')} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${view === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              <User size={20} />
              <span className="text-sm font-medium">Profile</span>
            </button>
            <button onClick={() => setView('attendance')} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${view === 'attendance' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Clock size={20} />
              <span className="text-sm font-medium">Attendance</span>
            </button>
            <button onClick={() => setView('apply-leave')} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${view === 'apply-leave' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Calendar size={20} />
              <span className="text-sm font-medium">Leaves</span>
            </button>
            <button onClick={() => setView('payroll')} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${view === 'payroll' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              <CreditCard size={20} />
              <span className="text-sm font-medium">Payroll</span>
            </button>
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
              {view !== 'dashboard' && (
                <>
                  <ChevronDown size={14} className="-rotate-90" />
                  <span className="font-semibold text-slate-900 capitalize">{view.replace('-', ' ')}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={handleClockIn}
                disabled={status === 'clocked-in'}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${status === 'clocked-in' ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-600/20'}`}
              >
                <Clock size={16} />
                <span className="hidden md:inline">Clock In</span>
                <span className="md:hidden">In</span>
              </button>
              <button
                onClick={handleClockOut}
                disabled={status === 'clocked-out'}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${status === 'clocked-out' ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 ring-1 ring-rose-600/20'}`}
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Clock Out</span>
                <span className="md:hidden">Out</span>
              </button>
            </div>
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex size-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
              >
                <Bell size={20} />
                {requests.filter(r => r.status !== 'pending' && !clearedIds.includes(r.id)).length > 0 && (
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center">
                    <span className="font-semibold text-sm text-slate-900">Notifications</span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const idsToClear = requests.filter(r => r.status !== 'pending').map(r => r.id);
                          const newCleared = [...new Set([...clearedIds, ...idsToClear])];
                          setClearedIds(newCleared);
                          localStorage.setItem('clearedNotifications', JSON.stringify(newCleared));
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                      >
                        Clear
                      </button>
                      <button onClick={() => setShowNotifications(false)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Close</button>
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {requests.filter(r => r.status !== 'pending' && !clearedIds.includes(r.id)).length > 0 ? (
                      requests
                        .filter(r => r.status !== 'pending' && !clearedIds.includes(r.id))
                        .sort((a, b) => new Date(b.reviewedAt || b.startDate).getTime() - new Date(a.reviewedAt || a.startDate).getTime())
                        .slice(0, 5)
                        .map(req => (
                          <div key={req.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 size-2 rounded-full shrink-0 ${req.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <div>
                                <p className="text-sm font-medium text-slate-900">Request {req.status === 'approved' ? 'Approved' : 'Rejected'}</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Your <span className="font-medium capitalize">{req.type}</span> leave for {new Date(req.startDate).toLocaleDateString()} was {req.status}.
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {req.reviewedAt
                                    ? new Date(req.reviewedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                    : 'Recently'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="px-4 py-8 text-center text-slate-500 text-sm">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-200 sm:pl-6">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-900">{profile?.firstName || user?.displayName || 'User'}</p>
                <p className="text-xs text-slate-500">{profile?.designation || 'Employee'}</p>
              </div>
              <button className="group relative size-9 overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-blue-500/20 shadow-sm border border-slate-200">
                <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold">
                  {getInitials()}
                </div>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f6f6f8] p-4 sm:p-6 lg:p-8">
          {view === 'attendance' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Attendance History</h2>
                <p className="text-sm text-slate-500 mt-1">View your check-in and check-out times.</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Check In</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Check Out</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {attendance.length > 0 ? attendance.map((record) => {
                      const checkIn = record.checkIn ? new Date(record.checkIn) : null;
                      const checkOut = record.checkOut ? new Date(record.checkOut) : null;
                      let duration = '---';
                      if (checkIn && checkOut) {
                        const diff = checkOut.getTime() - checkIn.getTime();
                        const hours = Math.floor(diff / 3600000);
                        const mins = Math.floor((diff % 3600000) / 60000);
                        duration = `${hours}h ${mins}m`;
                      }

                      // Determine Status Display
                      let statusLabel = record.status;
                      let statusColor = record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

                      if (checkIn) {
                        const shiftStart = new Date(checkIn);
                        shiftStart.setHours(9, 15, 0, 0); // 9:15 AM Threshold
                        if (checkIn > shiftStart) {
                          statusLabel = 'late';
                          statusColor = 'bg-amber-100 text-amber-800';
                        }
                      }

                      return (
                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {checkIn ? checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {checkOut ? checkOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                            {duration}
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No attendance records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : view === 'payroll' ? (
            <PayrollPage
              initialWage={50000 * 12}
              allowEdit={false}
              employeeName={profile?.firstName ? `${profile.firstName} ${profile.lastName}` : (user?.displayName || 'Employee')}
              employeeId={profile?.companyCode || '---'}
            />
          ) : view === 'profile' ? (
            <ProfilePage
              profile={profile}
              onBack={() => setView('dashboard')}
              onSave={(updatedProfile) => {
                if (profile) setProfile({ ...profile, ...updatedProfile as any });
              }}
            />
          ) : view === 'apply-leave' ? (
            <ApplyLeave
              profile={profile}
              balances={balances}
              onCancel={() => setView('dashboard')}
              onSuccess={() => {
                alert("Leave application submitted successfully!");
                if (user as any) {
                  if (profile?.id) {
                    // Force refresh handled by subscription
                  }
                }
                setView('dashboard');
              }}
            />
          ) : (
            <div className="w-full">
              <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Good Morning, {profile?.firstName || user?.displayName?.split(' ')[0] || 'Employee'} 👋</h1>
                  <p className="text-sm text-slate-500 mt-1">Here's what's happening today.</p>
                </div>
                <div className="mt-4 flex items-center gap-3 sm:mt-0">
                  <span className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-900/5">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button onClick={() => setView('apply-leave')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/30 transition-all hover:bg-blue-700">
                    <Plus size={20} />
                    Apply Leave
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 xl:gap-8">
                <div className="flex flex-col gap-6 lg:col-span-8">
                  <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Current Status</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`size-2.5 rounded-full ${status === 'clocked-in' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
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
                            type="datetime-local"
                            value={status === 'clocked-out' ? checkInTime : checkOutTime}
                            onChange={(e) => status === 'clocked-out' ? setCheckInTime(e.target.value) : setCheckOutTime(e.target.value)}
                            className="block w-full sm:w-60 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg font-mono"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            {status === 'clocked-out' ? "Select time and click 'Clock In' in the header" : "Select time and click 'Clock Out' in the header"}
                          </p>
                        </div>
                      </div>
                    </div>


                  </div>

                  <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-900">Leave Balance</h3>
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
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                      <h3 className="text-base font-semibold text-slate-900">Request Status</h3>
                      <button onClick={() => setView('apply-leave')} className="text-xs font-medium text-blue-600 hover:text-blue-700">View History</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-6 py-3 font-medium">Type</th>
                            <th className="px-6 py-3 font-medium">Dates</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {requests.slice(0, 5).map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-slate-900 font-medium capitalize">{req.type}</td>
                              <td className="px-6 py-4 text-slate-500">{req.startDate} to {req.endDate}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${req.status === 'approved' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {req.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {requests.length === 0 && (
                            <tr><td colSpan={3} className="p-6 text-center text-slate-500">No requests found</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 lg:col-span-4">
                  <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-2xl font-bold shadow-sm">
                        {getInitials()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{profile?.firstName} {profile?.lastName}</h3>
                        <p className="text-sm text-slate-500">ID: {profile?.id || '---'}</p>
                        <span className="mt-1 inline-flex items-center gap-1.5 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <span className="size-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 pt-4 text-center">
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Department</p>
                        <p className="text-sm font-semibold">{profile?.department || '---'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Designation</p>
                        <p className="text-sm font-semibold">{profile?.designation || '---'}</p>
                      </div>
                    </div>
                    <button onClick={() => setView('profile')} className="w-full rounded-lg bg-slate-100 py-2 text-sm font-medium hover:bg-slate-200 transition-colors">
                      View Full Profile
                    </button>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 shadow-md text-white">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-white/20 p-2"><PartyPopper size={24} /></div>
                      <div>
                        <h3 className="font-semibold">Upcoming Holiday</h3>
                        <p className="text-sm text-blue-100 mt-1">Makar Sankranti</p>
                        <div className="mt-3 flex items-center gap-2 text-sm font-medium">
                          <CalendarDays size={18} /> Jan 14, 2026
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
                    <div className="flex items-center justify-center sm:justify-between mb-6">
                        <h3 className="text-base font-semibold text-slate-900 font-display">Recent Activity</h3>
                        <button 
                            onClick={() => {
                                const now = new Date().toISOString();
                                setActivityClearTime(now);
                                localStorage.setItem('activityClearTime', now);
                            }}
                            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Clear Activity
                        </button>
                    </div>
                    <div className="flow-root max-h-[400px] overflow-y-auto pr-2">
                      <ul role="list" className="-mb-8">
                        {(() => {
                          const allActivities = [
                            ...attendance.flatMap(a => {
                              const arr = [];
                              // Robust date parsing for safety
                              const parseDate = (d: any) => d ? (typeof d.toDate === 'function' ? d.toDate() : new Date(d)) : null;

                              const inDate = parseDate(a.checkIn);
                              const outDate = parseDate(a.checkOut);

                              if (inDate) arr.push({ time: inDate.toISOString(), label: 'Clocked In', color: 'bg-emerald-500' });
                              if (outDate) {
                                let durationStr = '';
                                if (inDate) {
                                   const diff = outDate.getTime() - inDate.getTime();
                                   const hours = Math.floor(diff / 3600000);
                                   const mins = Math.floor((diff % 3600000) / 60000);
                                   durationStr = ` (${hours}h ${mins}m)`;
                                }
                                arr.push({ time: outDate.toISOString(), label: `Clocked Out${durationStr}`, color: 'bg-rose-500' });
                              }
                              return arr;
                            }),
                            ...requests.flatMap(r => {
                              const acts = [];
                              const parseDate = (d: any) => d ? (typeof d.toDate === 'function' ? d.toDate() : new Date(d)) : null;

                              const applied = parseDate(r.appliedAt || r.startDate);
                              if (applied) {
                                acts.push({
                                  time: applied.toISOString(),
                                  label: `Applied for ${r.type.charAt(0).toUpperCase() + r.type.slice(1)} Leave`,
                                  color: 'bg-blue-500'
                                });
                              }

                              if (r.status !== 'pending' && r.reviewedAt) {
                                const reviewed = parseDate(r.reviewedAt);
                                if (reviewed) {
                                  acts.push({
                                    time: reviewed.toISOString(),
                                    label: `Leave Request ${r.status === 'approved' ? 'Accepted' : 'Declined'}`,
                                    color: r.status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'
                                  });
                                }
                              }
                              return acts;
                            })
                          ]
                          .filter(act => !activityClearTime || new Date(act.time) > new Date(activityClearTime))
                          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                          .slice(0, 20);

                          const formatActivityTime = (dateStr: string) => {
                            const date = new Date(dateStr);
                            const now = new Date();
                            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                            const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                            const diffDays = Math.round((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
                            const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

                            if (diffDays === 0) return `Today, ${timePart}`;
                            if (diffDays === 1) return `Yesterday, ${timePart}`;

                            return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timePart}`;
                          };

                          return allActivities.map((activity, idx) => (
                            <li key={idx}>
                              <div className="relative pb-8">
                                {idx !== allActivities.length - 1 && (
                                  <span className="absolute left-1.5 top-1.5 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                                )}
                                <div className="relative flex items-start gap-3">
                                  <div className={`mt-1.5 size-3 rounded-full ${activity.color} ring-4 ring-white shadow-sm shrink-0`} />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900 leading-none">
                                      {activity.label}
                                    </p>
                                    <p className="mt-1.5 text-xs text-slate-500">
                                      {formatActivityTime(activity.time)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ));
                        })()}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Clock Out Summary Modal */}
      {summaryModal.show && summaryModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-600 p-6 text-center text-white">
              <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                <CheckCircle size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Session Recorded!</h3>
              <p className="text-blue-100">
                {new Date(summaryModal.data.checkOut).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Total Work Hours</span>
                <span className="text-xl font-bold text-slate-900">{summaryModal.data.duration}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Check In</p>
                  <p className="text-lg font-bold text-slate-900">
                    {new Date(summaryModal.data.checkIn).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Check Out</p>
                  <p className="text-lg font-bold text-slate-900">
                    {new Date(summaryModal.data.checkOut).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded-lg flex items-center justify-center gap-2 ${summaryModal.data.isLate ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {summaryModal.data.isLate ? (
                  <>
                    <Clock size={18} />
                    <span className="font-medium">Late Arrival</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span className="font-medium">On Time</span>
                  </>
                )}
              </div>

              <button
                onClick={() => setSummaryModal({ show: false, data: null })}
                className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors mt-2"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
