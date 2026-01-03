import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2, CheckCircle, Copy } from 'lucide-react';
import { createEmployeeSchema, type CreateEmployeeFormData } from '../../types/forms';
import { AdminService } from '../../services/adminService';

interface CreateEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({ onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      yearOfJoining: new Date().getFullYear(),
      companyCode: 'OI'
    }
  });

  const [loading, setLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ loginId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: CreateEmployeeFormData) => {
    try {
      setLoading(true);
      setError(null);
      const creds = await AdminService.createEmployee(data);
      setCreatedCredentials(creds);
      // Don't close immediately, show credentials
    } catch (err: any) {
      setError(err.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create New Employee</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {createdCredentials ? (
            <div className="space-y-6 text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Employee Created Successfully!</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Please share these credentials with the employee securely. The password is temporary and must be changed on first login.
              </p>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 max-w-md mx-auto space-y-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Login ID</label>
                  <div className="flex items-center justify-between mt-1">
                    <code className="text-lg font-mono font-bold text-gray-900">{createdCredentials.loginId}</code>
                    <button onClick={() => copyToClipboard(createdCredentials.loginId)} className="text-blue-600 hover:text-blue-700 p-1">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Temp Password removed - User sets password during activation */}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <input {...register('firstName')} placeholder="e.g. John" className="input-field" />
                  {errors.firstName && <p className="error-text">{errors.firstName.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <input {...register('lastName')} placeholder="e.g. Doe" className="input-field" />
                  {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input {...register('email')} type="email" placeholder="john.doe@odoo.com" className="input-field" />
                  {errors.email && <p className="error-text">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input {...register('phoneNumber')} placeholder="+91 98765 43210" className="input-field" />
                  {errors.phoneNumber && <p className="error-text">{errors.phoneNumber.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <input {...register('department')} placeholder="e.g. Engineering" className="input-field" />
                  {errors.department && <p className="error-text">{errors.department.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Designation</label>
                  <input {...register('designation')} placeholder="e.g. Senior Developer" className="input-field" />
                  {errors.designation && <p className="error-text">{errors.designation.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Year of Joining</label>
                  <input {...register('yearOfJoining', { valueAsNumber: true })} type="number" className="input-field" />
                  {errors.yearOfJoining && <p className="error-text">{errors.yearOfJoining.message}</p>}
                  <input {...register('companyCode')} type="hidden" />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  Create Employee
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
