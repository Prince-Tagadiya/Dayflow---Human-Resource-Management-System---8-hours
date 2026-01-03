import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Lock, Save, ChevronLeft } from 'lucide-react';
import type { EmployeeProfile } from '../../types';
import { EmployeeService } from '../../services/employeeService';

interface ProfilePageProps {
    profile: EmployeeProfile | null;
    onBack: () => void;
    onSave: (updatedProfile: Partial<EmployeeProfile>) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onBack, onSave }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        dateOfBirth: '',
        gender: 'male',
        department: '',
        designation: '',
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                phone: (profile as any).phone || '',
                address: (profile as any).address || '',
                city: (profile as any).city || '',
                state: (profile as any).state || '',
                zipCode: (profile as any).zipCode || '',
                dateOfBirth: (profile as any).dateOfBirth || '',
                gender: (profile as any).gender || 'male',
                department: profile.department || '',
                designation: profile.designation || '',
            });
        }
    }, [profile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSaved(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulate save - in real app this would call an update service
            await new Promise(resolve => setTimeout(resolve, 800));
            onSave(formData);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = () => {
        if (formData.firstName && formData.lastName) {
            return `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase();
        }
        return 'U';
    };

    // Calculate profile completion
    const calculateCompletion = () => {
        const fields = [formData.firstName, formData.lastName, formData.email, formData.phone, formData.department, formData.designation, formData.dateOfBirth];
        const filled = fields.filter(f => f && f.trim() !== '').length;
        return Math.round((filled / fields.length) * 100);
    };

    const completion = calculateCompletion();

    return (
        <div className="mx-auto max-w-5xl pb-20">
            {/* Page Heading */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Profile</h1>
                            <p className="text-slate-500 mt-1">Manage your personal details, contact information, and employment data.</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <span className="size-1.5 rounded-full bg-emerald-500"></span>
                        Active Employee
                    </span>
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                    {/* Avatar - Initials Only, No Edit */}
                    <div className="relative">
                        <div className="size-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                            {getInitials()}
                        </div>
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{formData.firstName} {formData.lastName}</h2>
                                <p className="text-blue-600 font-medium">{formData.designation || 'Employee'}</p>
                                <p className="text-slate-400 text-sm mt-1 flex items-center justify-center sm:justify-start gap-1">
                                    <Briefcase size={14} />
                                    {profile?.companyCode || profile?.id || '---'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Profile Completion Bar */}
                        <div className="mt-6">
                            <div className="flex justify-between text-xs font-medium mb-1.5">
                                <span className="text-slate-500">Profile Completion</span>
                                <span className="text-blue-600">{completion}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                                    style={{ width: `${completion}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Forms */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        
                        {/* Personal Information */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <User size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-700">First Name</span>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    />
                                </label>
                                
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-700">Last Name</span>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    />
                                </label>
                                
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-700">Date of Birth</span>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </label>
                                
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-700">Gender</span>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="na">Prefer not to say</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <Mail size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Contact Details</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-slate-700">Email Address</span>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-11 pl-10 pr-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </label>
                                    
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-slate-700">Phone Number</span>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-11 pl-10 pr-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </label>
                                </div>
                                
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-700">Address</span>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full address"
                                            className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none h-24"
                                        />
                                    </div>
                                </label>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-slate-700">City</span>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </label>
                                    
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-slate-700">State</span>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </label>
                                    
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-slate-700">Zip Code</span>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Employment Info */}
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-24">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                    <Briefcase size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Employment Data</h3>
                            </div>
                            
                            <div className="flex flex-col gap-6">
                                {/* Employee ID - Read Only */}
                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee ID</span>
                                        <Lock size={14} className="text-slate-400" />
                                    </div>
                                    <div className="text-slate-900 font-mono font-medium">{profile?.companyCode || profile?.id || '---'}</div>
                                </div>
                                
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-700">Department</span>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Human Resources">Human Resources</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Operations">Operations</option>
                                    </select>
                                </label>
                                
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-700">Job Title</span>
                                    <select
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    >
                                        <option value="">Select Job Title</option>
                                        <option value="Junior Developer">Junior Developer</option>
                                        <option value="Senior Developer">Senior Developer</option>
                                        <option value="Team Lead">Team Lead</option>
                                        <option value="Engineering Manager">Engineering Manager</option>
                                        <option value="HR Manager">HR Manager</option>
                                        <option value="Sales Executive">Sales Executive</option>
                                    </select>
                                </label>
                                
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-700">Start Date</span>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                        <input
                                            type="date"
                                            value={profile?.dateOfJoining?.split('T')[0] || ''}
                                            readOnly
                                            className="w-full rounded-lg border border-slate-200 bg-slate-100 text-slate-600 h-11 pl-10 pr-4 cursor-not-allowed"
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400">Start date cannot be changed</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button - Fixed at bottom on mobile */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : saved ? (
                            <>
                                <Save size={18} />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
