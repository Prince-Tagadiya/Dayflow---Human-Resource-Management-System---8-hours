import React, { useState, useEffect } from 'react';
import { Download, History, TrendingUp, MinusCircle, Wallet, CheckCircle } from 'lucide-react';
import type { EmployeeSalaryDetails } from '../../types';
import { PayrollService } from '../../services/payrollService';

interface PayrollPageProps {
  initialWage?: number;
  allowEdit?: boolean;
  employeeName?: string;
  employeeId?: string;
  onSave?: (details: EmployeeSalaryDetails) => void;
}

export const PayrollPage: React.FC<PayrollPageProps> = ({ 
  initialWage = 600000, // Default Annual CTC or Monthly? Provided example seems Monthly (50,000). Let's assume input is Monthly Wage.
  allowEdit = false, 
  employeeName = "Alex Morgan", 
  employeeId = "EMP-001",
  onSave 
}) => {
  // Input should be Monthly Wage based on example (50,000)
  const [wage, setWage] = useState<number>(initialWage / 12); // Assuming initialWage passed might be annual, but let's stick to Monthly input for simplicity if not specified. Actually example says Wage = 50,000 which looks like monthly salary.
  
  // State for calculation
  const [details, setDetails] = useState<EmployeeSalaryDetails | null>(null);

  useEffect(() => {
    // Recalculate whenever wage changes
    const calculated = PayrollService.calculateSalaryBreakdown(wage);
    setDetails({ ...calculated, employeeId });
  }, [wage, employeeId]);

  const handleWageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 0) {
      setWage(val);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!details) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll Overview</h1>
          <p className="text-slate-500">Manage and view salary structure and payslips.</p>
        </div>
        <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
                <History size={18} />
                <span>History View</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download size={18} />
                <span>Download Salary Slip</span>
            </button>
        </div>
      </div>

      {/* Wage Configuration */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Wage Configuration</h2>
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">Fixed Wage</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Monthly Wage</label>
                <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input 
                        type="number"
                        value={wage}
                        onChange={handleWageChange}
                        disabled={!allowEdit}
                        className={`w-full pl-7 pr-16 py-2.5 border rounded-lg outline-none transition-all font-medium ${allowEdit ? 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">/ Month</span>
                </div>
            </div>
            
            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Yearly Wage</label>
                <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input 
                        type="number"
                        value={wage * 12}
                        readOnly
                        className="w-full pl-7 pr-16 py-2.5 border border-slate-100 bg-slate-50 text-slate-500 rounded-lg outline-none font-medium cursor-default"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">/ Year</span>
                </div>
            </div>

            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Working days per week</label>
                <div className="mt-2">
                    <select 
                        disabled={!allowEdit}
                        className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all font-medium appearance-none bg-white ${allowEdit ? 'border-slate-300 focus:ring-2 focus:ring-blue-500' : 'border-slate-100 bg-slate-50 text-slate-500 pointer-events-none'}`}
                        defaultValue="5 Days"
                    >
                        <option>5 Days</option>
                        <option>6 Days</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Break Time</label>
                <div className="mt-2">
                    <input 
                        type="text"
                        defaultValue="45 mins"
                        disabled={!allowEdit}
                        className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all font-medium ${allowEdit ? 'border-slate-300 focus:ring-2 focus:ring-blue-500' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
                    />
                </div>
            </div>
        </div>
        
        {allowEdit && onSave && (
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                <button 
                    onClick={() => onSave(details)}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-sm shadow-emerald-200"
                >
                    Save Changes
                </button>
            </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gross Pay */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Gross Pay</p>
                    <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(details.ctc)}</h3>
                    <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
                        <TrendingUp size={14} />
                        Monthly Gross
                    </p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Wallet size={24} />
                </div>
            </div>
        </div>

        {/* Total Deductions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
             <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Deductions</p>
                    <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(details.pf + details.pt)}</h3>
                    <p className="text-xs font-medium text-slate-500 mt-2">Includes PF & Tax</p>
                </div>
                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
                    <MinusCircle size={24} />
                </div>
            </div>
        </div>

        {/* Net Pay */}
        <div className="bg-blue-600 p-6 rounded-xl border border-blue-500 shadow-lg text-white relative overflow-hidden">
             <div className="flex items-start justify-between z-10 relative">
                <div>
                    <p className="text-sm font-medium text-blue-100 mb-1">Net Pay</p>
                    <h3 className="text-3xl font-bold text-white">{formatCurrency(details.netSalary)}</h3>
                    <p className="text-xs font-medium text-blue-200 mt-2">Disbursed on 1st of every month</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Wallet size={24} className="text-white" />
                </div>
            </div>
            {/* Decoration */}
            <div className="absolute -bottom-6 -right-6 text-white/10">
                <Wallet size={120} />
            </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
                <h3 className="text-lg font-bold text-slate-900">Detailed Breakdown</h3>
                <p className="text-sm text-slate-500">Salary structure for {employeeName} ({employeeId})</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {/* Earnings */}
            <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <h4 className="font-semibold text-slate-700 uppercase tracking-wide text-sm">Earnings</h4>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50 dashed last:border-0">
                        <span className="text-slate-600">Basic Salary</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(details.basic)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50 dashed last:border-0">
                        <span className="text-slate-600">House Rent Allowance (HRA)</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(details.hra)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50 dashed last:border-0">
                        <span className="text-slate-600">Standard Allowance</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(details.standardAllowance)}</span>
                    </div>
                     <div className="flex justify-between items-center py-2 border-b border-slate-50 dashed last:border-0">
                        <span className="text-slate-600">Performance Bonus</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(details.performanceBonus)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50 dashed last:border-0">
                        <span className="text-slate-600">Leave Travel Allowance (LTA)</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(details.lta)}</span>
                    </div>
                     <div className="flex justify-between items-center py-2 border-b border-slate-50 dashed last:border-0">
                        <span className="text-slate-600">Fixed Allowance</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(details.fixedAllowance)}</span>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total Earnings</span>
                    <span className="font-bold text-slate-900 text-lg">{formatCurrency(details.ctc)}</span>
                </div>
            </div>

            {/* Deductions */}
            <div className="p-6 bg-slate-50/30">
                <div className="flex items-center gap-2 mb-6">
                     <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    <h4 className="font-semibold text-slate-700 uppercase tracking-wide text-sm">Deductions</h4>
                </div>
                
                 <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dashed last:border-0">
                        <span className="text-slate-600">Provident Fund (PF)</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(details.pf)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dashed last:border-0">
                        <span className="text-slate-600">Professional Tax (PT)</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(details.pt)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dashed last:border-0">
                        <span className="text-slate-600 text-sm italic">Income Tax (TDS) - *Estimated</span>
                        <span className="font-semibold text-slate-400">---</span>
                    </div>
                </div>

                 <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total Deductions</span>
                    <span className="font-bold text-slate-900 text-lg">{formatCurrency(details.pf + details.pt)}</span>
                </div>
            </div>
        </div>
      </div>
      
       {/* Payment History / Processed Message */}
       <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
            <div className="p-2 bg-green-100 text-green-700 rounded-full">
                <CheckCircle size={20} />
            </div>
            <div>
                <p className="font-semibold text-slate-900">Salary Processed</p>
                <p className="text-sm text-slate-500">Last salary was credited on 1st {new Date().toLocaleString('default', { month: 'long' })} via Direct Deposit.</p>
            </div>
            <div className="ml-auto text-right">
                <p className="text-xs text-slate-500 uppercase font-semibold">Net Salary Payable</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(details.netSalary)}</p>
            </div>
       </div>

    </div>
  );
};
