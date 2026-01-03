import React, { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { BootstrapMakeAdmin } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { seedDatabase } from '../../utils/seedData';

export const SetupAdmin: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ email: string; password: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSetup = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await BootstrapMakeAdmin.createMasterAdmin();
            setResult(res);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        setLoading(true);
        setError(null);
        try {
            const count = await seedDatabase();
            alert(`Successfully seeded ${count} documents!`);
        } catch (err: any) {
            console.error(err);
            setError("Seeding failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6 text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Initial Setup</h1>
                
                {!result ? (
                    <>
                         <p className="text-gray-500">
                            This will create the Master Admin account for <b>Odoo HRMS</b>.
                            <br/><span className="text-xs text-amber-600">Only run this once during installation.</span>
                        </p>
                        
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <button 
                            onClick={handleSetup}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Create Master Admin"}
                        </button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Development Tools</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleSeed}
                            disabled={loading}
                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-3 rounded-lg transition-colors flex items-center justify-center border border-indigo-200"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Seed Fake Database Data"}
                        </button>
                    </>
                ) : (
                    <div className="bg-green-50 p-6 rounded-xl border border-green-100 space-y-4">
                        <h3 className="text-green-800 font-bold text-lg">Admin Created!</h3>
                        <div className="text-left space-y-2">
                            <div>
                                <label className="text-xs font-bold text-green-700 uppercase">Login ID / Email</label>
                                <div className="font-mono text-gray-900 bg-white px-2 py-1 rounded border border-green-200">
                                    {result.email}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-green-700 uppercase">Password</label>
                                <div className="font-mono text-gray-900 bg-white px-2 py-1 rounded border border-green-200">
                                    {result.password}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg"
                        >
                            Go to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
