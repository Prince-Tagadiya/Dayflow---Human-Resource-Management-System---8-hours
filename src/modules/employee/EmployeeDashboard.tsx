import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, User, Clock, Calendar, CreditCard, Settings, HelpCircle, LogOut,
  Menu, Search, Bell, Plus, Sun, Thermometer, CheckCircle, PartyPopper, CalendarDays,
  ChevronDown, X, Trash2
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { AuthService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

import { EmployeeService } from '../../services/employeeService';
import type { EmployeeProfile, TimeOffRequest, AttendanceRecord } from '../../types';

import { ApplyLeave } from './ApplyLeave';
import { ProfilePage } from './ProfilePage';
import { PayrollPage } from '../payroll/PayrollPage';
import { AttendanceHistory } from './AttendanceHistory';

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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [clearedIds, setClearedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('clearedNotifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [activityClearTime, setActivityClearTime] = useState<string | null>(() => {
    return localStorage.getItem('activityClearTime');
  });
  const [balances, setBalances] = useState({
    casual: { taken: 0, total: 12 },
    sick: { taken: 0, total: 10 },
    privilege: { taken: 0, total: 20 },
    unpaid: { taken: 0, total: 0 }
  });

  // State for Check-In/Out Simulation
  const [status, setStatus] = useState<'clocked-in' | 'clocked-out'>('clocked-out');

  // Helper to get local ISO string for datetime-local
  const getLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const [checkInTime, setCheckInTime] = useState<string>(getLocalISOString(new Date()));
  const [checkOutTime, setCheckOutTime] = useState<string>(getLocalISOString(new Date()));
  const [isManualTime, setIsManualTime] = useState(false);
  const [displayTime, setDisplayTime] = useState<string>('---');

  // Keep simulation times synced with real-time unless manually edited
  useEffect(() => {
    if (isManualTime) return;

    const syncInterval = setInterval(() => {
      const now = new Date();
      if (status === 'clocked-out') {
        setCheckInTime(getLocalISOString(now));
      } else {
        setCheckOutTime(getLocalISOString(now));
      }
    }, 1000);

    return () => clearInterval(syncInterval);
  }, [isManualTime, status]);

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
            unsubscribeLeaves = EmployeeService.subscribeToLeaveRequests(p.id, (l: TimeOffRequest[]) => {
              // Determine notifications from status changes
              const newNotifications: any[] = [];
              l.forEach(req => {
                if (req.status !== 'pending' && req.reviewedAt && !clearedIds.includes(req.id)) {
                  newNotifications.push({
                    id: req.id,
                    title: `Leave ${req.status.charAt(0).toUpperCase() + req.status.slice(1)}`,
                    message: `Your ${req.type} leave request for ${req.startDate} has been ${req.status}.`,
                    time: req.reviewedAt,
                    type: req.status === 'approved' ? 'success' : 'error'
                  });
                }
              });
              setNotifications(newNotifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
              setRequests(l);
              EmployeeService.getLeaveBalances(p.id).then(setBalances);
            });

            // 3. Real-time Attendance
            unsubscribeAttendance = EmployeeService.subscribeToAttendance(p.id, (a: AttendanceRecord[]) => {
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
                  const latest = a[0];
                  if (latest && latest.checkOut) {
                    const date = new Date(latest.checkOut);
                    setDisplayTime(date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }));
                  }
                }
              } else {
                setStatus('clocked-out');
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
  }, [user, clearedIds]);

  // Update clock every minute for display when clocked out
  useEffect(() => {
    const timer = setInterval(() => {
      if (status === 'clocked-out') {
        const now = new Date();
        setDisplayTime(now.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }));
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [status]);

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login');
  };

  const handleClockIn = async () => {
    if (!profile) return;
    const date = new Date(checkInTime);
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
    const date = new Date(checkOutTime);

    try {
      await EmployeeService.clockOut(profile.id, date.toISOString());
      setStatus('clocked-out');
      setDisplayTime(date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }));

      // Find the checkIn for the session we just closed
      // Since it's real-time, it might not be in 'attendance' state yet or might be the first one
      const rec = await EmployeeService.getTodayAttendance(profile.id);
      let checkInVal = rec?.checkIn;

      if (checkInVal) {
        const start = new Date(checkInVal);
        const end = date;
        const diff = end.getTime() - start.getTime();
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);

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
            isLate
          }
        });
      }
    } catch (e) {
      console.error("Clock out failed", e);
    }
  };

  const clearNotifications = () => {
    const idsToClear = notifications.map(n => n.id);
    const newCleared = [...new Set([...clearedIds, ...idsToClear])];
    setClearedIds(newCleared);
    localStorage.setItem('clearedNotifications', JSON.stringify(newCleared));
    setShowNotifications(false);
  };

  const removeNotification = (id: string) => {
    const newCleared = [...new Set([...clearedIds, id])];
    setClearedIds(newCleared);
    localStorage.setItem('clearedNotifications', JSON.stringify(newCleared));
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
                className={`hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all shadow-sm ${status === 'clocked-in' ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-emerald-100'}`}
              >
                <Clock size={16} />
                Clock In
              </button>
              <button
                onClick={handleClockOut}
                disabled={status === 'clocked-out'}
                className={`hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all shadow-sm ${status === 'clocked-out' ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-rose-100'}`}
              >
                <LogOut size={16} />
                Clock Out
              </button>
            </div>

            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative flex size-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors">
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <button onClick={clearNotifications} className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:text-blue-700">Clear All</button>
                      )}
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? notifications.map((notif) => (
                      <div key={notif.id} className="relative p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                        <button onClick={() => removeNotification(notif.id)} className="absolute right-2 top-2 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                        <div className="flex gap-3">
                          <div className={`mt-0.5 size-2 rounded-full shrink-0 ${notif.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(notif.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-12 text-center">
                        <div className="mx-auto size-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
                          <Bell size={24} />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">All caught up!</p>
                        <p className="text-xs text-slate-400 mt-1">No new notifications.</p>
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
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold">
                    {getInitials()}
                  </div>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f6f6f8] p-4 sm:p-6 lg:p-8">
          {view === 'attendance' ? (
            <AttendanceHistory employeeId={profile?.id || ''} />
          ) : view === 'payroll' ? (
            <PayrollPage
              initialWage={profile?.ctc || 50000 * 12}
              allowEdit={false}
              employeeName={profile?.firstName ? `${profile.firstName} ${profile.lastName}` : (user?.displayName || 'Employee')}
              employeeId={profile?.companyCode || '---'}
              designation={profile?.designation}
              department={profile?.department}
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
                  {/* Attendance Card */}
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
                        <p className="font-mono text-xl font-bold tracking-tight text-slate-900">{displayTime}</p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Set Simulation {status === 'clocked-out' ? 'Check-In' : 'Check-Out'} Time
                          </label>
                          <input
                            type="datetime-local"
                            value={status === 'clocked-out' ? checkInTime : checkOutTime}
                            onChange={(e) => {
                              setIsManualTime(true);
                              status === 'clocked-out' ? setCheckInTime(e.target.value) : setCheckOutTime(e.target.value);
                            }}
                            className="block w-full sm:w-64 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg font-mono"
                          />
                          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide font-bold">
                            {status === 'clocked-out' ? "Select time and click 'Clock In' in the header" : "Select time and click 'Clock Out' in the header"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
                    <div className="mb-5 flex items-center justify-between border-b border-slate-50 pb-4">
                      <h3 className="text-base font-bold text-slate-900 font-display uppercase tracking-wide">Leave Balance</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {[
                        { title: 'Casual Leave', data: balances.casual, color: 'bg-blue-500', icon: <Sun size={20} /> },
                        { title: 'Sick Leave', data: balances.sick, color: 'bg-rose-500', icon: <Thermometer size={20} /> },
                        { title: 'Privilege Leave', data: balances.privilege, color: 'bg-emerald-500', icon: <CheckCircle size={20} /> },
                      ].map((leave, i) => (
                        <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 hover:shadow-md transition-shadow">
                          <div className="mb-3 flex items-center gap-2 text-slate-500">
                            <div className={`p-2 rounded-lg bg-white shadow-sm ring-1 ring-slate-200/50`}>{leave.icon}</div>
                            <span className="text-sm font-bold text-slate-700">{leave.title}</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900 tracking-tight">{leave.data.taken.toString().padStart(2, '0')}</span>
                            <span className="text-sm font-bold text-slate-400">/ {leave.data.total} days</span>
                          </div>
                          <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${leave.color} rounded-full transition-all duration-500`}
                              style={{ width: `${(leave.data.taken / leave.data.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                      <h3 className="text-base font-bold text-slate-900">Request Status</h3>
                      <button onClick={() => setView('apply-leave')} className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest">View History</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Type</th>
                            <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Dates</th>
                            <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                            <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {requests.slice(0, 5).map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-slate-900 font-bold capitalize">{req.type}</td>
                              <td className="px-6 py-4 text-slate-600 font-medium">{new Date(req.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} to {new Date(req.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider capitalize ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : req.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={req.adminComments || ''}>
                                {req.adminComments || '---'}
                              </td>
                            </tr>
                          ))}
                          {requests.length === 0 && (
                            <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-medium">No active requests found</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 lg:col-span-4">
                  <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
                    <div className="flex items-center gap-4">
                      {profile?.photoURL ? (
                        <img src={profile.photoURL} alt="Profile" className="size-16 rounded-full border-4 border-white shadow-lg object-cover bg-slate-100 ring-4 ring-blue-50" />
                      ) : (
                        <div className="flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-2xl font-bold shadow-lg ring-4 ring-blue-50">
                          {getInitials()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{profile?.firstName} {profile?.lastName}</h3>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">ID: {profile?.id || '---'}</p>
                        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 pt-5 text-center">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Department</p>
                        <p className="text-sm font-bold text-slate-700 mt-1">{profile?.department || '---'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Designation</p>
                        <p className="text-sm font-bold text-slate-700 mt-1">{profile?.designation || '---'}</p>
                      </div>
                    </div>
                    <button onClick={() => setView('profile')} className="w-full mt-2 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all active:scale-[0.98]">
                      View Full Profile
                    </button>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 shadow-xl text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform"><CalendarDays size={80} /></div>
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="rounded-xl bg-white/20 p-2 backdrop-blur-md"><PartyPopper size={24} /></div>
                      <div>
                        <h3 className="font-bold text-lg">Upcoming Holiday</h3>
                        <p className="text-sm text-blue-100 mt-1 font-medium italic">Makar Sankranti</p>
                        <div className="mt-4 flex items-center gap-2 text-sm font-bold bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                          <CalendarDays size={16} /> Jan 14, 2026
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
                    <div className="flex items-center justify-between mb-6">
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
                              acts.push({
                                time: r.appliedAt || r.startDate,
                                label: `Applied for ${r.type.charAt(0).toUpperCase() + r.type.slice(1)} Leave`,
                                color: 'bg-blue-500'
                              });
                              if (r.status !== 'pending' && r.reviewedAt) {
                                acts.push({
                                  time: r.reviewedAt,
                                  label: `Leave Request ${r.status === 'approved' ? 'Accepted' : 'Declined'}`,
                                  color: r.status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'
                                });
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
                                    <p className="text-sm font-bold text-slate-900 leading-none">
                                      {activity.label}
                                    </p>
                                    <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white">
              <div className="mx-auto bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mb-6 backdrop-blur-lg ring-4 ring-white/10">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold">Session Recorded!</h3>
              <p className="text-blue-100 text-sm mt-2 font-medium">
                {new Date(summaryModal.data.date).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Work Duration</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">{summaryModal.data.duration}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 text-center ring-1 ring-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Check In</p>
                  <p className="font-bold text-slate-900">
                    {new Date(summaryModal.data.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center ring-1 ring-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Check Out</p>
                  <p className="font-bold text-slate-900">
                    {new Date(summaryModal.data.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className={`py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest ${summaryModal.data.isLate ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-100' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'}`}>
                {summaryModal.data.isLate ? (
                  <>
                    <Clock size={16} />
                    <span>Late Arrival</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>On Time</span>
                  </>
                )}
              </div>

              <button
                onClick={() => setSummaryModal({ show: false, data: null })}
                className="w-full bg-slate-900 text-white rounded-2xl py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98]"
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
