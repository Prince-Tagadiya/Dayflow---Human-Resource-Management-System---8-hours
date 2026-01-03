import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Building2, Edit, AlertTriangle, Clock, Save } from 'lucide-react';
import type { EmployeeProfile } from '../../types';
import { PayrollService } from '../../services/payrollService';
import { AdminService } from '../../services/adminService';

interface EmployeeDetailViewProps {
    employee: EmployeeProfile;
    onBack: () => void;
    onUpdate?: (employee: EmployeeProfile) => void;
}

type TabType = 'resume' | 'private' | 'salary' | 'admin' | 'security';

export const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({ employee, onBack, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<TabType>('salary');
    const [monthlyWage, setMonthlyWage] = useState(employee.ctc ? Math.round(employee.ctc / 12) : 50000);
    const [monthlyWageInput, setMonthlyWageInput] = useState(String(employee.ctc ? Math.round(employee.ctc / 12) : 50000));
    const [workingDays, setWorkingDays] = useState('5');
    const [breakTime, setBreakTime] = useState('45');
    const [isSaving, setIsSaving] = useState(false);

    // Handle wage input change - remove leading zeros
    const handleWageChange = (value: string) => {
        // Remove non-numeric characters and leading zeros
        const cleaned = value.replace(/[^0-9]/g, '').replace(/^0+/, '') || '0';
        setMonthlyWageInput(cleaned);
        setMonthlyWage(parseInt(cleaned) || 0);
    };

    // Save salary info to database
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await AdminService.updateEmployee(employee.id, {
                ctc: monthlyWage * 12
            });
            alert('Salary information saved successfully!');
            if (onUpdate) {
                onUpdate({ ...employee, ctc: monthlyWage * 12 });
            }
        } catch (error) {
            console.error('Error saving salary info:', error);
            alert('Failed to save salary information.');
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate salary breakdown
    const yearlyWage = monthlyWage * 12;
    const salaryDetails = PayrollService.calculateSalaryBreakdown(yearlyWage);

    const getInitials = () => {
        return `${employee.firstName?.charAt(0) || ''}${employee.lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const tabs: { id: TabType; label: string }[] = [
        { id: 'resume', label: 'Resume' },
        { id: 'private', label: 'Private Info' },
        { id: 'salary', label: 'Salary Info' },
        { id: 'admin', label: 'Admin Only' },
        { id: 'security', label: 'Security' },
    ];

    return (
        <div className="min-h-full">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <button onClick={onBack} className="hover:text-blue-600 flex items-center gap-1">
                    <ArrowLeft size={16} />
                    Employees
                </button>
                <span>/</span>
                <span className="font-medium text-slate-900">{employee.firstName} {employee.lastName}</span>
            </div>

            {/* Profile Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 text-2xl font-bold shadow-inner">
                                {getInitials()}
                            </div>
                            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white"></span>
                        </div>

                        {/* Info */}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{employee.firstName} {employee.lastName}</h1>
                            <p className="text-blue-600 font-medium">{employee.designation || 'No Designation'}</p>

                            <div className="flex flex-wrap items-center gap-6 mt-3 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <Mail size={16} className="text-slate-400" />
                                    {employee.email}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Phone size={16} className="text-slate-400" />
                                    +1 (555) 000-1234
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Building2 size={16} className="text-slate-400" />
                                    {employee.department || 'General'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <Edit size={16} />
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-6">
                <div className="flex gap-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                ? 'text-blue-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'salary' && (
                        <>
                            {/* Wage Configuration */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900">Wage Configuration</h2>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                                        Fixed Wage
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Monthly Wage */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Wage</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                            <input
                                                type="text"
                                                value={monthlyWageInput}
                                                onChange={(e) => handleWageChange(e.target.value)}
                                                className="w-full pl-8 pr-16 py-2.5 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/ Month</span>
                                        </div>
                                    </div>

                                    {/* Yearly Wage */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Yearly Wage</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                            <input
                                                type="number"
                                                value={yearlyWage}
                                                readOnly
                                                className="w-full pl-8 pr-16 py-2.5 border border-slate-200 rounded-lg text-slate-900 font-medium bg-slate-50"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/ Year</span>
                                        </div>
                                    </div>

                                    {/* Working Days */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Working days per week</label>
                                        <select
                                            value={workingDays}
                                            onChange={(e) => setWorkingDays(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                        >
                                            <option value="5">5 Days</option>
                                            <option value="6">6 Days</option>
                                        </select>
                                    </div>

                                    {/* Break Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Break Time</label>
                                        <input
                                            type="text"
                                            value={`${breakTime} mins`}
                                            onChange={(e) => setBreakTime(e.target.value.replace(/[^0-9]/g, ''))}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Salary Components */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100">
                                    <h2 className="text-lg font-bold text-slate-900">Salary Components</h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                <th className="px-6 py-3 text-left">Component</th>
                                                <th className="px-6 py-3 text-left">Amount</th>
                                                <th className="px-6 py-3 text-center">% of Wage</th>
                                                <th className="px-6 py-3 text-left">Calculation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">Basic Salary</td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={salaryDetails.basic.toFixed(0)}
                                                        readOnly
                                                        className="w-24 px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-900 bg-slate-50"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                                                        50 <span className="text-slate-400">%</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                                                        Auto (50% of Wage)
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">House Rent Allowance</td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={salaryDetails.hra.toFixed(0)}
                                                        readOnly
                                                        className="w-24 px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-900 bg-slate-50"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                                                        25 <span className="text-slate-400">%</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600">50% of Basic</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">Standard Allowance</td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={salaryDetails.standardAllowance}
                                                        readOnly
                                                        className="w-24 px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-900 bg-slate-50"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                                                        1 <span className="text-slate-400">%</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600">Fixed Amount</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">Performance Bonus</td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={salaryDetails.performanceBonus.toFixed(0)}
                                                        readOnly
                                                        className="w-24 px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-900 bg-slate-50"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                                                        8 <span className="text-slate-400">%</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600">Variable</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">Leave Travel Allowance</td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={salaryDetails.lta.toFixed(0)}
                                                        readOnly
                                                        className="w-24 px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-900 bg-slate-50"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                                                        8 <span className="text-slate-400">%</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600">8.33% of Basic</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">Fixed Allowance</td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={salaryDetails.fixedAllowance.toFixed(0)}
                                                        readOnly
                                                        className="w-24 px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-900 bg-slate-50"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                                                        - <span className="text-slate-400">%</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600">Balancing Figure</span>
                                                </td>
                                            </tr>

                                            {/* Deductions Header */}
                                            <tr className="bg-slate-50">
                                                <td colSpan={4} className="px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                    Deductions
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 text-sm font-medium text-red-600">Provident Fund (PF)</td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={salaryDetails.pf.toFixed(0)}
                                                        readOnly
                                                        className="w-24 px-3 py-1.5 border border-red-200 rounded text-sm text-red-600 bg-red-50"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 text-sm text-red-500">
                                                        12 <span className="text-red-400">%</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600">12% of Basic</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 text-sm font-medium text-red-600">Professional Tax</td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={salaryDetails.pt}
                                                        readOnly
                                                        className="w-24 px-3 py-1.5 border border-red-200 rounded text-sm text-red-600 bg-red-50"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm text-slate-400">-</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600">Fixed ₹200</span>
                                                </td>
                                            </tr>

                                            {/* Net Salary */}
                                            <tr className="bg-emerald-50 font-bold">
                                                <td className="px-6 py-4 text-sm text-emerald-700">Net Salary (Monthly)</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-lg text-emerald-700">₹{(salaryDetails.netSalary / 12).toFixed(0)}</span>
                                                </td>
                                                <td className="px-6 py-4"></td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-emerald-600">CTC - Deductions</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Save Button */}
                                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save size={18} />
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'resume' && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Resume & Documents</h2>
                            <p className="text-slate-500">Resume and document management coming soon.</p>
                        </div>
                    )}

                    {activeTab === 'private' && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Private Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-500">Employee ID</label>
                                    <p className="font-medium text-slate-900">{employee.companyCode || employee.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500">Date of Joining</label>
                                    <p className="font-medium text-slate-900">{employee.dateOfJoining || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500">Email</label>
                                    <p className="font-medium text-slate-900">{employee.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500">Login ID</label>
                                    <p className="font-medium text-slate-900">{employee.loginId || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'admin' && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Admin Only</h2>
                            <p className="text-slate-500">Admin-only settings and configurations.</p>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Security Settings</h2>
                            <p className="text-slate-500">Security and access management options.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Important Info */}
                    <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h3 className="font-bold text-amber-800 mb-2">Important</h3>
                                <p className="text-sm text-amber-700 leading-relaxed">
                                    The Salary Information tab allows users to define and manage all salary-related details for an employee,
                                    including wage type, working schedule, salary components, and benefits. Salary components should
                                    be calculated automatically based on the defined Wage.
                                </p>
                                <ul className="mt-4 space-y-2 text-sm text-amber-700">
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                                        <span><strong>Wage Type:</strong> Fixed wage.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                                        <span><strong>Salary Components:</strong> Section where users can define salary structure components.</span>
                                    </li>
                                </ul>

                                <div className="mt-4 pt-4 border-t border-amber-200">
                                    <h4 className="font-bold text-red-600 text-sm mb-2">RULES</h4>
                                    <ul className="space-y-1 text-xs text-amber-700">
                                        <li>• Components auto-update when wage amount changes.</li>
                                        <li>• The total of all components should not exceed the defined Wage.</li>
                                        <li>• PF is calculated as 12% of Basic Salary.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Salary Updates */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <h3 className="font-bold text-slate-900 mb-4">Recent Salary Updates</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <Clock size={16} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-900">
                                        Updated <strong>Basic Salary</strong> component
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">2h ago</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Clock size={16} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-900">
                                        Wage updated to <strong>₹{monthlyWage.toLocaleString()}/month</strong>
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">Yesterday</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
