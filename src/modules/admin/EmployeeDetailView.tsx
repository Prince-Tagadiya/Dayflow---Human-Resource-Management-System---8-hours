import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Building2, Edit, AlertTriangle, Clock, Save, User, MapPin, Calendar, Lock } from 'lucide-react';
import type { EmployeeProfile } from '../../types';
import { PayrollService } from '../../services/payrollService';
import { AdminService } from '../../services/adminService';

interface EmployeeDetailViewProps {
    employee: EmployeeProfile;
    onBack: () => void;
    onUpdate?: (employee: EmployeeProfile) => void;
}

type TabType = 'resume' | 'private' | 'salary';

export const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({ employee, onBack, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<TabType>('salary');
    const [monthlyWage, setMonthlyWage] = useState(employee.ctc ? Math.round(employee.ctc / 12) : 50000);
    const [monthlyWageInput, setMonthlyWageInput] = useState(String(employee.ctc ? Math.round(employee.ctc / 12) : 50000));
    const [workingDays, setWorkingDays] = useState('5');
    const [breakTime, setBreakTime] = useState('45');
    const [isSaving, setIsSaving] = useState(false);

    // Private Info Form State
    const [privateInfo, setPrivateInfo] = useState({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        dateOfBirth: '',
        gender: 'Male',
        email: employee.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        department: employee.department || '',
        jobTitle: employee.jobTitle || '',
        startDate: employee.dateOfJoining || new Date().toISOString().split('T')[0]
    });

    // Calculate profile completion
    const calculateProfileCompletion = () => {
        const fields = Object.values(privateInfo);
        const filledFields = fields.filter(f => f && f.trim() !== '').length;
        return Math.round((filledFields / fields.length) * 100);
    };

    // Handle private info change
    const handlePrivateInfoChange = (field: string, value: string) => {
        setPrivateInfo(prev => ({ ...prev, [field]: value }));
    };

    // Save private info
    const handleSavePrivateInfo = async () => {
        setIsSaving(true);
        try {
            await AdminService.updateEmployee(employee.id, {
                firstName: privateInfo.firstName,
                lastName: privateInfo.lastName,
                email: privateInfo.email,
                department: privateInfo.department,
                jobTitle: privateInfo.jobTitle
            });
            alert('Private information saved successfully!');
            if (onUpdate) {
                onUpdate({
                    ...employee,
                    firstName: privateInfo.firstName,
                    lastName: privateInfo.lastName,
                    email: privateInfo.email,
                    department: privateInfo.department,
                    jobTitle: privateInfo.jobTitle
                });
            }
        } catch (error) {
            console.error('Error saving private info:', error);
            alert('Failed to save private information.');
        } finally {
            setIsSaving(false);
        }
    };

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
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">Basic Salary</div>
                                                    <div className="text-xs text-slate-500 mt-1">Define Basic salary from company cost compute it based on monthly Wages</div>
                                                </td>
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
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">House Rent Allowance</div>
                                                    <div className="text-xs text-slate-500 mt-1">HRA provided to employees 50% of the basic salary</div>
                                                </td>
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
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">Standard Allowance</div>
                                                    <div className="text-xs text-slate-500 mt-1">A standard allowance is a predetermined, fixed amount of ₹4167 provided to employee</div>
                                                </td>
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
                                                        - <span className="text-slate-400">%</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600">Fixed ₹4167</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">Performance Bonus</div>
                                                    <div className="text-xs text-slate-500 mt-1">Variable amount paid during payroll. The value defined by the company and calculated as a % of the basic salary</div>
                                                </td>
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
                                                        8.33 <span className="text-slate-400">%</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600">8.33% of Basic</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">Leave Travel Allowance</div>
                                                    <div className="text-xs text-slate-500 mt-1">LTA is paid by the company to employees to cover their travel expenses. and calculated as a % of the basic salary</div>
                                                </td>
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
                                                        8.33 <span className="text-slate-400">%</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600">8.33% of Basic</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">Fixed Allowance</div>
                                                    <div className="text-xs text-slate-500 mt-1">Balancing figure calculated as: Wage - (Basic + HRA + Standard + Performance + LTA)</div>
                                                </td>
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
                                                    <span className="text-sm text-slate-600">Wage - All Components</span>
                                                </td>
                                            </tr>

                                            {/* Deductions Header */}
                                            <tr className="bg-slate-50">
                                                <td colSpan={4} className="px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                    Deductions
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-red-600">Provident Fund (PF)</div>
                                                    <div className="text-xs text-slate-500 mt-1">PF is calculated based on the basic salary (12% employee contribution)</div>
                                                </td>
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
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-red-600">Professional Tax</div>
                                                    <div className="text-xs text-slate-500 mt-1">Professional Tax deducted from the Gross salary</div>
                                                </td>
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
                        <div className="lg:col-span-3 space-y-6">
                            {/* Profile Header with Completion */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {getInitials()}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-slate-900">{privateInfo.firstName} {privateInfo.lastName}</h2>
                                        <p className="text-blue-600 font-medium">{privateInfo.jobTitle || 'No Title'}</p>
                                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                            <Building2 size={14} />
                                            {employee.companyCode || employee.id}
                                        </p>
                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-500">Profile Completion</span>
                                                <span className="text-slate-700 font-medium">{calculateProfileCompletion()}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${calculateProfileCompletion()}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column - Personal & Contact */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Personal Information */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <User size={20} className="text-blue-600" />
                                            <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1.5">First Name</label>
                                                <input
                                                    type="text"
                                                    value={privateInfo.firstName}
                                                    onChange={(e) => handlePrivateInfoChange('firstName', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    placeholder="Enter first name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={privateInfo.lastName}
                                                    onChange={(e) => handlePrivateInfoChange('lastName', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    placeholder="Enter last name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Date of Birth</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={privateInfo.dateOfBirth}
                                                        onChange={(e) => handlePrivateInfoChange('dateOfBirth', e.target.value)}
                                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Gender</label>
                                                <select
                                                    value={privateInfo.gender}
                                                    onChange={(e) => handlePrivateInfoChange('gender', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Details */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Mail size={20} className="text-blue-600" />
                                            <h3 className="text-lg font-bold text-slate-900">Contact Details</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Email Address</label>
                                                <div className="relative">
                                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        value={privateInfo.email}
                                                        onChange={(e) => handlePrivateInfoChange('email', e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                        placeholder="email@example.com"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Phone Number</label>
                                                <div className="relative">
                                                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="tel"
                                                        value={privateInfo.phone}
                                                        onChange={(e) => handlePrivateInfoChange('phone', e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Address</label>
                                                <div className="relative">
                                                    <MapPin size={18} className="absolute left-3 top-3 text-slate-400" />
                                                    <textarea
                                                        value={privateInfo.address}
                                                        onChange={(e) => handlePrivateInfoChange('address', e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                                        rows={2}
                                                        placeholder="Enter your full address"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1.5">City</label>
                                                <input
                                                    type="text"
                                                    value={privateInfo.city}
                                                    onChange={(e) => handlePrivateInfoChange('city', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    placeholder="City"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1.5">State</label>
                                                <input
                                                    type="text"
                                                    value={privateInfo.state}
                                                    onChange={(e) => handlePrivateInfoChange('state', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    placeholder="State"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Zip Code</label>
                                                <input
                                                    type="text"
                                                    value={privateInfo.zipCode}
                                                    onChange={(e) => handlePrivateInfoChange('zipCode', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    placeholder="Zip Code"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Employment Data */}
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Building2 size={20} className="text-orange-500" />
                                            <h3 className="text-lg font-bold text-slate-900">Employment Data</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1.5 flex items-center justify-between">
                                                    <span>EMPLOYEE ID</span>
                                                    <Lock size={14} className="text-slate-400" />
                                                </label>
                                                <input
                                                    type="text"
                                                    value={employee.companyCode || employee.id}
                                                    readOnly
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 bg-slate-50 cursor-not-allowed"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Department</label>
                                                <select
                                                    value={privateInfo.department}
                                                    onChange={(e) => handlePrivateInfoChange('department', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                                >
                                                    <option value="">Select Department</option>
                                                    <option value="Engineering">Engineering</option>
                                                    <option value="Design">Design</option>
                                                    <option value="Marketing">Marketing</option>
                                                    <option value="Sales">Sales</option>
                                                    <option value="HR">Human Resources</option>
                                                    <option value="Finance">Finance</option>
                                                    <option value="Operations">Operations</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Job Title</label>
                                                <select
                                                    value={privateInfo.jobTitle}
                                                    onChange={(e) => handlePrivateInfoChange('jobTitle', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                                >
                                                    <option value="">Select Job Title</option>
                                                    <option value="Software Engineer">Software Engineer</option>
                                                    <option value="Senior Developer">Senior Developer</option>
                                                    <option value="Lead Developer">Lead Developer</option>
                                                    <option value="UI/UX Designer">UI/UX Designer</option>
                                                    <option value="Product Manager">Product Manager</option>
                                                    <option value="HR Manager">HR Manager</option>
                                                    <option value="Marketing Specialist">Marketing Specialist</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Start Date</label>
                                                <div className="relative">
                                                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="date"
                                                        value={privateInfo.startDate}
                                                        readOnly
                                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 bg-slate-50 cursor-not-allowed"
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1">Start date cannot be changed</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={onBack}
                                    className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSavePrivateInfo}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save size={18} />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
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

                </div>
            </div>
        </div>
    );
};
