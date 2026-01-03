import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, Bell, HelpCircle } from 'lucide-react';
import { EmployeeService } from '../../services/employeeService';
import type { AttendanceRecord } from '../../types';

interface AttendanceHistoryProps {
    employeeId: string;
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ employeeId }) => {
    // Navigate by Month
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch Date
    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            try {
                const data = await EmployeeService.getAttendanceByMonth(employeeId, currentDate);
                setAttendance(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [employeeId, currentDate]);

    // Handlers
    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            const [y, m] = e.target.value.split('-');
            setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, 1));
        }
    };

    // Helper to format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getDayName = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
    };

    const formatTime = (isoString?: string | null) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // Calculate Work Hours
    const calculateWorkHours = (start?: string | null, end?: string | null) => {
        if (!start || !end) return { hours: '--:--', isExtra: false };

        const s = new Date(start).getTime();
        const e = new Date(end).getTime();
        const diffMs = e - s;
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);

        const formatted = `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}`;

        return {
            hours: formatted,
            isExtra: diffHrs > 9
        };
    };

    // Calculate Stats
    const stats = useMemo(() => {
        const present = attendance.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half-day').length;
        const leaves = attendance.filter(a => a.status === 'on-leave' || a.status === 'absent').length;
        return { present, leaves, total: present + leaves };
    }, [attendance]);

    return (
        <div className="flex flex-col h-full bg-[#f6f6f8]">
            <div className="p-6 lg:p-8 space-y-6">
                {/* Top Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-slate-900">Attendance</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search"
                                className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                            <HelpCircle size={20} />
                        </button>
                    </div>
                </div>

                {/* Stats Bar & Navigation */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border border-slate-200 rounded-lg p-1 bg-white">
                            <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-50 rounded"><ChevronLeft size={18} className="text-slate-500" /></button>
                            <button onClick={handleNextMonth} className="p-1 hover:bg-slate-50 rounded"><ChevronRight size={18} className="text-slate-500" /></button>
                        </div>

                        <div className="relative">
                            <input
                                type="month"
                                value={`${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`}
                                onChange={handleDateChange}
                                className="pl-4 pr-8 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-white cursor-pointer"
                            />
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div className="flex-1 md:flex-none flex flex-col items-center justify-center px-6 py-2 bg-slate-50 rounded-lg border border-slate-100 min-w-[120px]">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Present Days</span>
                            <span className="text-xl font-bold text-emerald-500">{stats.present}</span>
                        </div>
                        <div className="flex-1 md:flex-none flex flex-col items-center justify-center px-6 py-2 bg-slate-50 rounded-lg border border-slate-100 min-w-[120px]">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Leaves Taken</span>
                            <span className="text-xl font-bold text-orange-500">{stats.leaves}</span>
                        </div>
                        <div className="flex-1 md:flex-none flex flex-col items-center justify-center px-6 py-2 bg-slate-50 rounded-lg border border-slate-100 min-w-[120px]">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Days</span>
                            <span className="text-xl font-bold text-blue-500">{stats.total}</span>
                        </div>
                    </div>
                </div>

                {/* Attendance History Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Attendance History</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Buffer Period
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Check In</th>
                                    <th className="px-6 py-4">Check Out</th>
                                    <th className="px-6 py-4">Work Hours</th>
                                    <th className="px-6 py-4">Extra Hours</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-slate-400">Loading records...</td></tr>
                                ) : attendance.length > 0 ? attendance.map((record) => {
                                    const work = calculateWorkHours(record.checkIn, record.checkOut);
                                    const extra = work.isExtra ? '01:00' : '--:--';

                                    // Row styling based on status
                                    const isLeave = record.status === 'on-leave' || record.status === 'absent';
                                    const rowClass = isLeave ? 'bg-orange-50/30' : 'hover:bg-slate-50/80';

                                    return (
                                        <tr key={record.id} className={`${rowClass} transition-colors`}>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-900">{formatDate(record.date)}</div>
                                                <div className="text-xs text-slate-500">{getDayName(record.date)}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                                {record.status === 'on-leave' ? (
                                                    <span className="text-orange-500 font-bold">On Leave</span>
                                                ) : (
                                                    formatTime(record.checkIn)
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                                {record.status === 'on-leave' ? '-' : formatTime(record.checkOut)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {record.status === 'on-leave' ? (
                                                    <span className="text-slate-400">00:00</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        {work.hours}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${work.isExtra ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'text-slate-400'}`}>
                                                    {extra}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No attendance records found for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-sm">
                        <span className="text-slate-500">Showing {attendance.length} entries</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 text-slate-600 font-medium">Previous</button>
                            <button className="px-3 py-1 border border-blue-500 bg-blue-600 rounded text-white font-medium">1</button>
                            <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 text-slate-600 font-medium">2</button>
                            <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 text-slate-600 font-medium">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
