import React, { useState } from 'react';
import {
    Search, Download, Edit3, MoreVertical,
    Calendar as CalendarIcon, ChevronDown, Users,
    Clock, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import type { EmployeeProfile, AttendanceRecord } from '../../types';

interface AttendanceViewProps {
    employees: EmployeeProfile[];
    attendance: AttendanceRecord[];
    onUpdateStatus: (id: string, status: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ employees, attendance, onUpdateStatus }) => {
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    // Mock data for the chart since we don't have real historical data in this view yet
    const weeklyTrends = [40, 65, 50, 85, 30, 15, 20];
    const maxTrend = Math.max(...weeklyTrends);

    const toggleRow = (id: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    const toggleAll = () => {
        if (selectedRows.size === attendance.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(attendance.map(a => a.id)));
        }
    };

    const handleBulkEdit = () => {
        // Mock usage to satisfy linter
        if (selectedRows.size > 0) {
            // In a real app, this would open a modal
            const firstId = Array.from(selectedRows)[0];
            onUpdateStatus(firstId, 'present');
        }
    };

    const getEmployee = (id: string) => employees.find(e => e.id === id || e.uid === id);

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'present': return 'bg-emerald-100 text-emerald-700';
            case 'late': return 'bg-orange-100 text-orange-700';
            case 'on-leave': return 'bg-purple-100 text-purple-700';
            case 'absent': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {/* Total Staff */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Staff</p>
                            <div className="flex items-end gap-2 mt-1">
                                <h3 className="text-2xl font-bold text-gray-900">{employees.length}</h3>
                                <span className="text-emerald-600 text-xs font-semibold flex items-center mb-1">
                                    <ArrowUpRight size={12} className="mr-0.5" /> +2%
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Users size={20} />
                        </div>
                    </div>
                </div>

                {/* Present */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Present</p>
                            <div className="flex items-end gap-2 mt-1">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {attendance.filter(a => a.status === 'present').length}
                                </h3>
                                <span className="text-emerald-600 text-xs font-semibold flex items-center mb-1">
                                    <ArrowUpRight size={12} className="mr-0.5" /> +96%
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                </div>

                {/* Late */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Late</p>
                            <div className="flex items-end gap-2 mt-1">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {attendance.filter(a => a.status === 'late').length}
                                </h3>
                                <span className="text-red-500 text-xs font-semibold flex items-center mb-1">
                                    <ArrowDownRight size={12} className="mr-0.5" /> -10%
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <Clock size={20} />
                        </div>
                    </div>
                </div>

                {/* On Leave */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">On Leave</p>
                            <div className="flex items-end gap-2 mt-1">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {attendance.filter(a => a.status === 'on-leave').length}
                                </h3>
                                <span className="text-emerald-600 text-xs font-semibold flex items-center mb-1">
                                    <ArrowUpRight size={12} className="mr-0.5" /> +1%
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <AlertCircle size={20} />
                        </div>
                    </div>
                </div>

                {/* Weekly Trends Chart */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between md:col-span-2 lg:col-span-4 xl:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-gray-900">Weekly Trends</p>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+2.4%</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Last 7 Days</p>
                    <div className="flex items-end justify-between h-16 gap-1">
                        {weeklyTrends.map((val, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                <div
                                    className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors"
                                    style={{ height: `${(val / maxTrend) * 100}%`, opacity: 0.6 + (i / 10) }}
                                ></div>
                                <span className="text-[10px] text-gray-400">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full md:w-auto sm:items-center">
                    <div className="relative flex-1 max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="date"
                                className="w-full sm:w-auto h-10 pl-10 pr-4 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                            />
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <select className="w-full sm:w-auto h-10 pl-4 pr-10 border border-gray-200 rounded-lg text-sm text-gray-600 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                                <option>All Status</option>
                                <option>Present</option>
                                <option>Late</option>
                                <option>Absent</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto justify-end">
                    <button className="flex items-center gap-2 h-10 px-4 text-gray-600 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all">
                        <Download size={18} />
                        Export
                    </button>
                    <button
                        onClick={handleBulkEdit}
                        className="flex items-center gap-2 h-10 px-4 text-white bg-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                        <Edit3 size={18} />
                        Bulk Edit
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/30">
                                <th className="p-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        checked={selectedRows.size === attendance.length && attendance.length > 0}
                                        onChange={toggleAll}
                                    />
                                </th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Check-In</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Check-Out</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total Hrs</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {attendance.map((record) => {
                                const emp = getEmployee(record.employeeId);
                                const fullName = emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee';
                                const role = emp?.designation || 'Employee';
                                const isSelected = selectedRows.has(record.id);

                                return (
                                    <tr key={record.id} className={`group transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50/60'}`}>
                                        <td className="p-4 text-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => toggleRow(record.id)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm overflow-hidden border border-gray-200">
                                                    {getInitials(fullName)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{fullName}</p>
                                                    <p className="text-xs text-gray-500">{role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {record.date}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-gray-900">
                                            {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-gray-400">
                                            {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            8h 30m {/* Mock calc */}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)} border-transparent`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60`}></span>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {attendance.length === 0 && (
                        <div className="p-12 text-center text-gray-400 text-sm">No attendance records found.</div>
                    )}
                </div>

                {/* Pagination Status */}
                <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/30">
                    <span className="text-xs text-gray-500">Showing 1 to {attendance.length} of 450 results</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Previous</button>
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
