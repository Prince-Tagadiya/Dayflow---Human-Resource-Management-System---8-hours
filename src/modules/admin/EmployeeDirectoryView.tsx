import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import type { EmployeeProfile } from '../../types';

interface EmployeeDirectoryViewProps {
    employees: EmployeeProfile[];
    onAddEmployee: () => void;
}

export const EmployeeDirectoryView: React.FC<EmployeeDirectoryViewProps> = ({ employees, onAddEmployee }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock calculations for stats - in a real app these typically come from backend or computed from full list
    const stats = {
        all: employees.length,
        present: employees.filter(e => e.isActive).length, // simplified proxy
        onLeave: 0,
        absent: 0
    };

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

        return matchesSearch;
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
                    <button className="font-medium text-slate-900 border-b-2 border-blue-600 pb-2.5 -mb-2.5 transition-colors">
                        All <span className="ml-1 text-slate-400 font-normal">{stats.all}</span>
                    </button>
                    <button className="font-medium text-slate-500 hover:text-slate-700 pb-2.5 -mb-2.5 transition-colors">
                        Present <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">{stats.present}</span>
                    </button>
                    <button className="font-medium text-slate-500 hover:text-slate-700 pb-2.5 -mb-2.5 transition-colors">
                        On Leave <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">{stats.onLeave}</span>
                    </button>
                    <button className="font-medium text-slate-500 hover:text-slate-700 pb-2.5 -mb-2.5 transition-colors">
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
                {filteredEmployees.map((emp) => (
                    <div key={emp.id} className="group relative bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center text-center hover:shadow-lg hover:border-blue-500/30 transition-all duration-300 cursor-pointer">
                        {/* Status Indicator (Mocked based on Active/Inactive for now) */}
                        <div className="absolute top-4 right-4" title={emp.isActive ? "Active" : "Inactive"}>
                            <span className={`flex h-3 w-3 rounded-full ${emp.isActive ? 'bg-green-500' : 'bg-gray-300'} ring-4 ${emp.isActive ? 'ring-green-500/20' : 'ring-gray-300/20'}`}></span>
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
                ))}

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
