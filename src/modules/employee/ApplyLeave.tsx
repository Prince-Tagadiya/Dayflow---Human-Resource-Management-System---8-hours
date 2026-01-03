import React, { useState } from 'react';
import type { EmployeeProfile, TimeOffRequest } from '../../types';
import { EmployeeService } from '../../services/employeeService';
import { CheckCircle, Info, CloudUpload, AlertCircle, Calendar } from 'lucide-react';

interface ApplyLeaveProps {
  profile: EmployeeProfile | null;
  onCancel: () => void;
  onSuccess: () => void;
  balances: {
      casual: { taken: number; total: number };
      sick: { taken: number; total: number };
      privilege: { taken: number; total: number };
      unpaid: { taken: number; total: number };
  };
}

export const ApplyLeave: React.FC<ApplyLeaveProps> = ({ profile, onCancel, onSuccess, balances }) => {
  const [formData, setFormData] = useState({
    type: 'sick' as const,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const [loading, setLoading] = useState(false);

  // ... (rest of logic same) ...

  const getAvailable = (type: 'casual' | 'sick' | 'privilege') => {
      return balances[type].total - balances[type].taken;
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Apply for Leave</h1>
          <p className="text-sm text-slate-500 mt-1">Submit a new leave request for approval.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-8">
              {/* Employee Information (Same) */}
              
              {/* Leave Details */}
              <div className="space-y-6">
                <h3 className="text-base font-semibold text-slate-900">Leave Details</h3>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="leave-type" className="block text-sm font-medium text-slate-700">Leave Type</label>
                    <span className="text-xs text-emerald-600 font-medium">
                        {formData.type !== 'unpaid' 
                            ? `Available: ${getAvailable(formData.type as any)} Days` 
                            : 'Unlimited'}
                    </span>
                  </div>
                  {/* ... Select Input (Same) ... */}
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Reason / Remarks <span className="text-rose-500">*</span>
                  </label>
                  <textarea 
                    id="reason" 
                    rows={4}
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="Please provide a detailed reason for your leave request..."
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-none"
                  ></textarea>
                  <div className="mt-1 flex justify-end">
                    <span className="text-xs text-slate-400">{formData.reason.length} / 250 characters</span>
                  </div>
                </div>



                {/* Submit Actions */}
                <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button 
                    type="button"
                    onClick={onCancel}
                    className="inline-flex justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-1">
            {/* Balances */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Your Balances</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Casual Leave</span>
                    <span className="font-medium text-slate-900">{balances.casual.taken} / {balances.casual.total}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(balances.casual.taken / balances.casual.total) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Sick Leave</span>
                    <span className="font-medium text-slate-900">{balances.sick.taken} / {balances.sick.total}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(balances.sick.taken / balances.sick.total) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Privilege Leave</span>
                    <span className="font-medium text-slate-900">{balances.privilege.taken} / {balances.privilege.total}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(balances.privilege.taken / balances.privilege.total) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Reminder */}
            <div className="rounded-xl bg-indigo-50 p-5 border border-indigo-100">
              <div className="flex items-start gap-3">
                <Info className="text-indigo-600 mt-0.5" size={20} />
                <div>
                  <h4 className="text-sm font-semibold text-indigo-900">Policy Reminder</h4>
                  <p className="mt-1 text-sm text-indigo-700 leading-relaxed">
                    Sick leaves exceeding 2 consecutive days require a valid medical certificate. Please ensure your certificate is legible.
                  </p>
                </div>
              </div>
            </div>

            {/* Approval Chain */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Approval Chain</h3>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">SJ</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Sarah Jenkins</p>
                  <p className="text-xs text-slate-500">Engineering Manager</p>
                </div>
              </div>
              <div className="ml-5 h-6 w-0.5 bg-slate-200 my-1"></div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">HR Department</p>
                  <p className="text-xs text-slate-500">Final Verification</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
