import React, { useState } from 'react';
import type { EmployeeProfile, TimeOffRequest } from '../../types';
import { EmployeeService } from '../../services/employeeService';
import { CheckCircle, Info, CloudUpload, AlertCircle, Calendar } from 'lucide-react';

interface ApplyLeaveProps {
  profile: EmployeeProfile | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ApplyLeave: React.FC<ApplyLeaveProps> = ({ profile, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'sick' as const,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const [loading, setLoading] = useState(false);

  const calculateDays = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include start date
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateDaysValue = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      await EmployeeService.applyLeave({
        employeeId: profile.id,
        type: formData.type as any,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        // appliedAt handled by service
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Failed to submit leave request');
    } finally {
      setLoading(false);
    }
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
              {/* Employee Information */}
              <div className="mb-8 border-b border-slate-100 pb-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Employee Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Full Name</label>
                    <input 
                      readOnly 
                      type="text" 
                      value={profile ? `${profile.firstName} ${profile.lastName}` : '---'}
                      className="block w-full rounded-md border-slate-200 bg-slate-50 text-slate-500 shadow-sm focus:border-slate-300 focus:ring-0 sm:text-sm cursor-not-allowed" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Employee ID</label>
                    <input 
                      readOnly 
                      type="text" 
                      value={profile ? profile.id : '---'}
                      className="block w-full rounded-md border-slate-200 bg-slate-50 text-slate-500 shadow-sm focus:border-slate-300 focus:ring-0 sm:text-sm cursor-not-allowed" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Department</label>
                    <input 
                      readOnly 
                      type="text" 
                      value={profile ? profile.department : '---'}
                      className="block w-full rounded-md border-slate-200 bg-slate-50 text-slate-500 shadow-sm focus:border-slate-300 focus:ring-0 sm:text-sm cursor-not-allowed" 
                    />
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="space-y-6">
                <h3 className="text-base font-semibold text-slate-900">Leave Details</h3>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="leave-type" className="block text-sm font-medium text-slate-700">Leave Type</label>
                    <span className="text-xs text-emerald-600 font-medium">Available: 8 Days (Sick Leave)</span>
                  </div>
                  <select 
                    id="leave-type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="casual">Casual Leave (Paid)</option>
                    <option value="sick">Sick Leave (Paid)</option>
                    <option value="privilege">Privilege Leave (Paid)</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                  <p className="mt-1.5 text-xs text-slate-500">Selecting 'Sick Leave' requires a medical certificate upload.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 items-start">
                  <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        id="start-date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-10"
                      />
                      <Calendar className="absolute left-3 top-2 text-slate-400" size={18} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        id="end-date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-10"
                      />
                      <Calendar className="absolute left-3 top-2 text-slate-400" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Days</label>
                    <input 
                      readOnly 
                      type="text" 
                      value={`${calculateDaysValue} Days`}
                      className="block w-full rounded-md border-slate-200 bg-slate-50 text-slate-900 font-semibold shadow-sm focus:ring-0 sm:text-sm text-center" 
                    />
                  </div>
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

                {/* Upload Section */}
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-3 rounded-full bg-blue-50 p-2">
                      <CloudUpload className="text-blue-600" size={24} />
                    </div>
                    <h4 className="text-sm font-medium text-slate-900">Upload Medical Certificate</h4>
                    <p className="mt-1 text-xs text-slate-500">Required for Sick Leave. Max file size: 5MB.</p>
                    <label htmlFor="file-upload" className="mt-4 cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50 transition-all">
                      <span>Select File</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                    <p className="mt-2 text-xs text-slate-400">Supported formats: PDF, JPG, PNG</p>
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
                    <span className="font-medium text-slate-900">4 / 12</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Sick Leave</span>
                    <span className="font-medium text-slate-900">8 / 10</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Privilege Leave</span>
                    <span className="font-medium text-slate-900">15 / 20</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
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
