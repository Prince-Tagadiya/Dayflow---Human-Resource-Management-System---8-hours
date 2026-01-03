import React, { useState, useEffect } from 'react';
import { Download, History, TrendingUp, MinusCircle, Wallet, CheckCircle } from 'lucide-react';
import type { EmployeeSalaryDetails } from '../../types';
import { PayrollService } from '../../services/payrollService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PayrollPageProps {
  initialWage?: number;
  allowEdit?: boolean;
  employeeName?: string;
  employeeId?: string;
  designation?: string;
  department?: string;
  onSave?: (details: EmployeeSalaryDetails) => void;
}

export const PayrollPage: React.FC<PayrollPageProps> = ({ 
  initialWage = 600000, 
  allowEdit = false, 
  employeeName = "Alex Morgan", 
  employeeId = "EMP-001",
  designation,
  department,
  onSave 
}) => {
  const [wage, setWage] = useState<number>(initialWage / 12);
  const [details, setDetails] = useState<EmployeeSalaryDetails | null>(null);
  const slipRef = React.useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
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

  const downloadSalarySlip = async () => {
    if (!details || !slipRef.current) return;
    
    try {
      setIsGeneratingPdf(true);
      const canvas = await html2canvas(slipRef.current, { 
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Salary_Slip_${employeeName.replace(/\s+/g, '_')}_${new Date().toLocaleString('default', { month: 'short' })}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!details) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20 relative">
      {/* Hidden Salary Slip Template for PDF Generation */}
      <div className="absolute left-[-9999px] top-0">
        <div ref={slipRef} className="w-[800px] p-12 bg-white text-slate-900 font-sans">
            {/* Header */}
            <div className="text-center border-b-2 border-slate-100 pb-6 mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Dayflow Technologies</h1>
                <p className="text-slate-500">Salary Slip for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                <div className="text-xs text-slate-400 mt-1">123 Tech Park, Innovation Drive, Silicon Valley, CA</div>
            </div>

            {/* Employee Info */}
            <div className="grid grid-cols-2 gap-8 bg-slate-50 p-6 rounded-lg mb-8">
                <div>
                     <div className="flex justify-between mb-3">
                        <span className="text-slate-500 font-medium">Employee Name</span>
                        <span className="font-bold text-slate-900">{employeeName}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Employee ID</span>
                        <span className="font-bold text-slate-900">{employeeId}</span>
                     </div>
                </div>
                <div>
                     <div className="flex justify-between mb-3">
                        <span className="text-slate-500 font-medium">Designation</span>
                        <span className="font-bold text-slate-900">{designation || '-'}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Department</span>
                        <span className="font-bold text-slate-900">{department || '-'}</span>
                     </div>
                </div>
            </div>

            {/* Tables */}
            <div className="flex gap-8 mb-8">
                {/* Earnings */}
                <div className="flex-1">
                    <h3 className="text-emerald-600 font-bold uppercase text-sm border-b border-slate-200 pb-2 mb-4">Earnings</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span>Basic Salary</span> <span className="font-mono font-medium">{formatCurrency(details.basic)}</span></div>
                        <div className="flex justify-between text-sm"><span>House Rent Allow.</span> <span className="font-mono font-medium">{formatCurrency(details.hra)}</span></div>
                        <div className="flex justify-between text-sm"><span>Standard Allow.</span> <span className="font-mono font-medium">{formatCurrency(details.standardAllowance)}</span></div>
                        <div className="flex justify-between text-sm"><span>Performance Bonus</span> <span className="font-mono font-medium">{formatCurrency(details.performanceBonus)}</span></div>
                        <div className="flex justify-between text-sm"><span>Leave Travel Allow.</span> <span className="font-mono font-medium">{formatCurrency(details.lta)}</span></div>
                        <div className="flex justify-between text-sm"><span>Fixed Allowance</span> <span className="font-mono font-medium">{formatCurrency(details.fixedAllowance)}</span></div>
                        <div className="flex justify-between text-sm pt-3 border-t border-slate-100 font-bold mt-2">
                             <span>Gross Earnings</span> 
                             <span className="font-mono">{formatCurrency(details.ctc)}</span>
                        </div>
                    </div>
                </div>

                {/* Deductions */}
                <div className="flex-1">
                    <h3 className="text-rose-600 font-bold uppercase text-sm border-b border-slate-200 pb-2 mb-4">Deductions</h3>
                     <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span>Provident Fund</span> <span className="font-mono font-medium">{formatCurrency(details.pf)}</span></div>
                        <div className="flex justify-between text-sm"><span>Professional Tax</span> <span className="font-mono font-medium">{formatCurrency(details.pt)}</span></div>
                         <div className="flex justify-between text-sm pt-3 border-t border-slate-100 font-bold mt-2">
                             <span>Total Deductions</span> 
                             <span className="font-mono">{formatCurrency(details.pf + details.pt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Net Pay */}
            <div className="bg-slate-900 text-white p-6 rounded-lg flex justify-between items-center mb-12">
                <div>
                     <p className="text-slate-300 text-sm font-medium uppercase tracking-wider">Net Salary Payable</p>
                     <p className="text-xs text-slate-400 mt-1">In Words: {details.netSalary} Rupees Only</p>
                </div>
                <div className="text-3xl font-bold">{formatCurrency(details.netSalary)}</div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 border-t border-dashed border-slate-200 pt-6">
                <p className="mb-1">This is a system generated salary slip and does not require a physical signature.</p>
                <p>© {new Date().getFullYear()} Dayflow Technologies. All rights reserved.</p>
            </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll Overview</h1>
          <p className="text-slate-500">Manage and view salary structure and payslips.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={downloadSalarySlip}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGeneratingPdf ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Download size={18} />}
                <span>{isGeneratingPdf ? 'Generating...' : 'Download Salary Slip'}</span>
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
