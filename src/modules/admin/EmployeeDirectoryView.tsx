import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import type { EmployeeProfile, AttendanceRecord } from '../../types';

interface EmployeeDirectoryViewProps {
    employees: EmployeeProfile[];
    attendance?: AttendanceRecord[]; // Optional for now to avoid breaking parent before update
    onAddEmployee: () => void;
    onEmployeeClick?: (employee: EmployeeProfile) => void;
}

export const EmployeeDirectoryView: React.FC<EmployeeDirectoryViewProps> = ({ employees, attendance = [], onAddEmployee, onEmployeeClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'present' | 'on_leave' | 'absent'>('all');

    // Helper to get status for an employee
    const getEmployeeStatus = (empId: string): 'present' | 'on_leave' | 'absent' => {
        if (!attendance.length) return 'absent'; // Default if no data
        const record = attendance.find(a => a.employeeId === empId);
        if (!record) return 'absent';

        if (record.status === 'present' || record.status === 'late' || record.status === 'half-day') return 'present';
        if (record.status === 'on-leave') return 'on_leave';
        return 'absent';
    };

    // Calculate stats content
    const stats = useMemo(() => {
        const statuses = employees.map(e => getEmployeeStatus(e.id));
        return {
            all: employees.length,
            present: statuses.filter(s => s === 'present').length,
            onLeave: statuses.filter(s => s === 'on_leave').length,
            absent: statuses.filter(s => s === 'absent').length
        };
    }, [employees, attendance]);

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    // Filter employees
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch =
            emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (emp.designation && emp.designation.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;

        if (activeTab === 'all') return true;

        const status = getEmployeeStatus(emp.id);
        if (activeTab === 'present') return status === 'present';
        if (activeTab === 'on_leave') return status === 'on_leave';
        if (activeTab === 'absent') return status === 'absent';

        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">All Employees</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your team members and permissions.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            className="w-full bg-white border border-slate-200 rounded-lg h-10 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all"
                            placeholder="Search employees..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={onAddEmployee}
                        className="flex items-center justify-center gap-2 px-4 h-10 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={20} />
                        <span>New Employee</span>
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-200">
                <div className="flex items-center gap-6 text-sm">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`font-medium pb-2.5 -mb-2.5 transition-colors ${activeTab === 'all' ? 'text-slate-900 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        All <span className="ml-1 text-slate-400 font-normal">{stats.all}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('present')}
                        className={`font-medium pb-2.5 -mb-2.5 transition-colors ${activeTab === 'present' ? 'text-slate-900 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Present <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">{stats.present}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('on_leave')}
                        className={`font-medium pb-2.5 -mb-2.5 transition-colors ${activeTab === 'on_leave' ? 'text-slate-900 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        On Leave <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">{stats.onLeave}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('absent')}
                        className={`font-medium pb-2.5 -mb-2.5 transition-colors ${activeTab === 'absent' ? 'text-slate-900 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Absent <span className="ml-1 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">{stats.absent}</span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEmployees.map((emp) => {
                    const status = getEmployeeStatus(emp.id);
                    // Determine styling based on status
                    let statusColor = 'bg-yellow-400 ring-4 ring-yellow-400/20'; // Absent/Default
                    let statusTitle = 'Absent';

                    if (status === 'present') {
                        statusColor = 'bg-green-500 ring-4 ring-green-500/20';
                        statusTitle = 'Present';
                    } else if (status === 'on_leave') {
                        statusColor = 'bg-purple-500 ring-4 ring-purple-500/20';
                        statusTitle = 'On Leave';
                    }

                    return (
                        <div
                            key={emp.id}
                            onClick={() => onEmployeeClick?.(emp)}
                            className="group relative bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center text-center hover:shadow-lg hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
                        >
                            {/* Status Indicator */}
                            <div className="absolute top-4 right-4" title={statusTitle}>
                                <span className={`flex h-3 w-3 rounded-full ${statusColor}`}></span>
                            </div>

                            {/* Avatar */}
                            <div className="mb-4">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 ring-4 ring-slate-50 flex items-center justify-center text-blue-700 text-2xl font-bold shadow-inner">
                                    {getInitials(emp.firstName, emp.lastName)}
                                </div>
                            </div>

                            {/* Info */}
                            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {emp.firstName} {emp.lastName}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mb-3">
                                {emp.designation || 'No Designation'}
                            </p>

                            {/* Department Badge */}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                {emp.department || 'General'}
                            </span>

                            {/* Additional Info / Actions */}
                            <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4 pt-2">
                            </div>
                        </div>
                    );
                })}

                {/* Empty State */}
                {filteredEmployees.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        No employees found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};
