import React from 'react';

export const AttendanceRecords: React.FC = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <span className="material-symbols-outlined text-3xl">calendar_month</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Attendance Records</h3>
            <p className="text-gray-500 mt-1">Attendance tracking module is coming soon.</p>
        </div>
    )
}
