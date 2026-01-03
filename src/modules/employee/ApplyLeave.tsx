import React, { useState } from 'react';
import type { EmployeeProfile, TimeOffRequest } from '../../types';
import { EmployeeService } from '../../services/employeeService';
import {
  CheckCircle,
  Info,
  AlertCircle,
  Calendar,
  Send,
  Umbrella,
  ThermometerSun,
  Briefcase
} from 'lucide-react';

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
      await EmployeeService.applyLeave(profile.id, {
        type: formData.type as any,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const getAvailable = (type: 'casual' | 'sick' | 'privilege') => {
      return balances[type].total - balances[type].taken;
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Page Heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Apply Leave</h2>
        <p className="text-slate-500">Submit your leave request and track your remaining balance.</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Left Column: Form & Stats */}
        <div className="flex flex-col gap-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Casual Leave Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-start gap-1">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mb-2">
                <Umbrella size={24} />
              </div>
              <span className="text-sm font-medium text-slate-500">Casual Leave</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{getAvailable('casual')}</span>
                <span className="text-sm text-slate-500">days left</span>
              </div>
            </div>

            {/* Sick Leave Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-start gap-1">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg mb-2">
                <ThermometerSun size={24} />
              </div>
              <span className="text-sm font-medium text-slate-500">Sick Leave</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{getAvailable('sick')}</span>
                <span className="text-sm text-slate-500">days left</span>
              </div>
            </div>

            {/* Privilege Leave Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-start gap-1">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mb-2">
                <Briefcase size={24} />
              </div>
              <span className="text-sm font-medium text-slate-500">Privilege Leave</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{getAvailable('privilege')}</span>
                <span className="text-sm text-slate-500">days left</span>
              </div>
            </div>

          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-900">New Request</h3>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Draft</span>
            </div>

            <div className="p-6 space-y-6">
              {/* Leave Type Selector - Radio Style */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Select Leave Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {['casual', 'sick', 'privilege', 'unpaid'].map((type) => (
                    <label key={type} className="cursor-pointer relative">
                      <input
                        type="radio"
                        name="leave_type"
                        value={type}
                        checked={formData.type === type}
                        onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                        className="peer sr-only"
                      />
                      <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 peer-checked:border-blue-600 peer-checked:bg-blue-50/50 peer-checked:ring-1 peer-checked:ring-blue-600 transition-all h-full">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-slate-900 capitalize peer-checked:text-blue-600">
                            {type} Leave
                          </span>
                          <span className="text-xs text-slate-500">
                            {type === 'casual' && 'For personal matters'}
                            {type === 'sick' && 'Medical reasons'}
                            {type === 'privilege' && 'Earned leaves'}
                            {type === 'unpaid' && 'Loss of pay'}
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 text-blue-600 opacity-0 peer-checked:opacity-100 transition-opacity">
                        <CheckCircle size={18} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Picker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar size={18} />
                    </div>
                    <input
                       id="start-date"
                       type="date"
                       value={formData.startDate}
                       onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                       className="pl-10 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar size={18} />
                    </div>
                    <input
                       id="end-date"
                       type="date"
                       value={formData.endDate}
                       onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                       className="pl-10 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                    />
                  </div>
                </div>
              </div>

              {/* Duration Notice */}
              <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <Info className="text-blue-600 shrink-0" size={20} />
                <p>You are requesting <span className="font-bold text-slate-900">{calculateDaysValue} days</span> of leave.</p>
              </div>

              {/* Reason */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1.5">Reason / Remarks</label>
                <textarea
                  id="reason"
                  rows={4}
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 resize-none"
                  placeholder="Please describe the reason for your leave..."
                ></textarea>
                  <div className="mt-1 flex justify-end">
                    <span className="text-xs text-slate-400">{formData.reason.length} / 250 characters</span>
                  </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4 border-t border-slate-200 gap-3">
                 <button 
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
                  {!loading && <Send size={18} />}
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
