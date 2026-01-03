import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Briefcase, Calendar } from 'lucide-react';
import { AdminService } from '../../../services/adminService';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  department: string;
  designation: string;
  phoneNumber: string;
  dateOfJoining: string;
  isRegistered: boolean;
}

export const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await AdminService.getAllEmployees();
      setEmployees(data as Employee[]);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading employees...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</div>
                    <div className="text-xs text-gray-500">ID: {emp.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 flex items-center gap-2">
                    <Mail size={14} className="text-gray-400"/> {emp.personalEmail}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <Phone size={14} className="text-gray-400"/> {emp.phoneNumber}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 flex items-center gap-2">
                    <Briefcase size={14} className="text-gray-400"/> {emp.designation}
                </div>
                <div className="text-xs text-gray-500 mt-1">{emp.department}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.isRegistered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {emp.isRegistered ? 'Active' : 'Pending Activation'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900">View</button>
              </td>
            </tr>
          ))}
          
          {employees.length === 0 && (
              <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No employees found. Create one to get started.
                  </td>
              </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};
