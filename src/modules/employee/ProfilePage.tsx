import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Lock, Save, ChevronLeft, Camera, CheckCircle } from 'lucide-react';
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
        photoURL: '',
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                phone: profile.phone || '',
                address: profile.address || '',
                city: profile.city || '',
                state: profile.state || '',
                zipCode: profile.zipCode || '',
                dateOfBirth: profile.dateOfBirth || '',
                gender: profile.gender || 'male',
                department: profile.department || '',
                designation: profile.designation || '',
                photoURL: profile.photoURL || '',
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
        if (!profile?.id) return;

        setLoading(true);
        try {
            // Only send editable fields to the service
            const updateData = {
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                photoURL: formData.photoURL,
            };

            await EmployeeService.updateProfile(profile.id, updateData);
            onSave(updateData);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Failed to save profile:', error);
            alert('Failed to save profile changes. Please try again.');
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
        const fields = [formData.firstName, formData.lastName, formData.email, formData.phone, formData.department, formData.designation, formData.dateOfBirth, formData.address];
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
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
                            <p className="text-slate-500 mt-1">Manage your personal details and contact information.</p>
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
                    {/* Avatar with Photo URL Support */}
                    <div className="relative group">
                        {formData.photoURL ? (
                            <img
                                src={formData.photoURL}
                                alt="Profile"
                                className="size-32 rounded-full border-4 border-white shadow-lg object-cover bg-slate-100"
                            />
                        ) : (
                            <div className="size-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                                {getInitials()}
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{formData.firstName} {formData.lastName}</h2>
                                <p className="text-blue-600 font-medium">{formData.designation || 'Employee'}</p>
                                <p className="text-slate-500 text-sm mt-1 flex items-center justify-center sm:justify-start gap-1 font-mono font-bold">
                                    <Briefcase size={14} className="text-slate-400" />
                                    ID: {(() => {
                                        const id = profile?.companyCode || profile?.loginId || (profile as any)?.employeeId || profile?.id;
                                        // If ID only has company prefix (like 'OI'), generate a display ID
                                        if (id && id.length <= 3 && profile?.firstName && profile?.lastName) {
                                            const f2 = profile.firstName.substring(0, 2).toUpperCase();
                                            const l2 = profile.lastName.substring(0, 2).toUpperCase();
                                            const year = profile.dateOfJoining ? new Date(profile.dateOfJoining).getFullYear() : new Date().getFullYear();
                                            return `${id}${f2}${l2}${year}0001`;
                                        }
                                        return id || '---';
                                    })()}
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

                        {/* Personal Information (READ ONLY) */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm opacity-90">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <User size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <Lock size={12} /> Read Only
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-700">First Name</span>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        readOnly
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 h-11 px-4 outline-none cursor-not-allowed"
                                    />
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-700">Last Name</span>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        readOnly
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 h-11 px-4 outline-none cursor-not-allowed"
                                    />
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-700">Date of Birth</span>
                                    <input
                                        type="text"
                                        value={formData.dateOfBirth || '---'}
                                        readOnly
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 h-11 px-4 outline-none cursor-not-allowed"
                                    />
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-700">Gender</span>
                                    <input
                                        type="text"
                                        value={formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)}
                                        readOnly
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 h-11 px-4 outline-none cursor-not-allowed"
                                    />
                                </label>
                            </div>
                            <p className="mt-4 text-xs text-slate-400 italic">Contact HR if your personal information requires correction.</p>
                        </div>

                        {/* Contact Details (EDITABLE) */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <Mail size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Contact Details</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <label className="flex flex-col gap-2 opacity-90">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-700">Email Address</span>
                                            <Lock size={12} className="text-slate-400" />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                readOnly
                                                className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 h-11 pl-10 pr-4 outline-none cursor-not-allowed"
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
                                                className="w-full rounded-lg border border-blue-100 bg-white text-slate-900 h-11 pl-10 pr-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </label>
                                </div>

                                <label className="flex flex-col gap-2 opacity-90">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700">Profile Picture URL</span>
                                        <Lock size={12} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="url"
                                        name="photoURL"
                                        value={formData.photoURL}
                                        readOnly
                                        placeholder="https://example.com/photo.jpg"
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 h-11 px-4 outline-none cursor-not-allowed"
                                    />
                                    <span className="text-xs text-slate-400">Contact HR to update your profile photo.</span>
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-700">Address</span>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full address"
                                            className="w-full rounded-lg border border-blue-100 bg-white text-slate-900 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none h-24"
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
                                            className="w-full rounded-lg border border-blue-100 bg-white text-slate-900 h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-slate-700">State</span>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-blue-100 bg-white text-slate-900 h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-slate-700">Zip Code</span>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-blue-100 bg-white text-slate-900 h-11 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Employment Info (READ ONLY) */}
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-24 opacity-90">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                        <Briefcase size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Employment</h3>
                                </div>
                                <Lock size={14} className="text-slate-400" />
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Employee ID - Always Root Source */}
                                <div className="p-4 rounded-xl bg-slate-900 text-white shadow-lg ring-4 ring-slate-100 border border-slate-800">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Official Employee ID</p>
                                    <p className="font-mono text-lg font-bold tracking-tight">{(() => {
                                        const id = profile?.companyCode || profile?.loginId || (profile as any)?.employeeId || profile?.id;
                                        // If ID only has company prefix (like 'OI'), generate a display ID
                                        if (id && id.length <= 3 && profile?.firstName && profile?.lastName) {
                                            const f2 = profile.firstName.substring(0, 2).toUpperCase();
                                            const l2 = profile.lastName.substring(0, 2).toUpperCase();
                                            const year = profile.dateOfJoining ? new Date(profile.dateOfJoining).getFullYear() : new Date().getFullYear();
                                            return `${id}${f2}${l2}${year}0001`;
                                        }
                                        return id || '---';
                                    })()}</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</label>
                                        <p className="mt-1 text-sm font-bold text-slate-700">{formData.department || '---'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Title</label>
                                        <p className="mt-1 text-sm font-bold text-slate-700">{formData.designation || '---'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Joining Date</label>
                                        <p className="mt-1 text-sm font-bold text-slate-700">
                                            {profile?.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString(undefined, { dateStyle: 'long' }) : '---'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-rose-500">
                                    <Lock size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Employment data is locked</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end border-t border-slate-100 pt-8">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                        Discard Changes
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : saved ? (
                            <>
                                <CheckCircle size={18} />
                                Profile Updated!
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
