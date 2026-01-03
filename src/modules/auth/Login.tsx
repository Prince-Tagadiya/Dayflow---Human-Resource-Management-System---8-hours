import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Lock, User } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { loginSchema, type LoginFormData } from '../../types/forms';
import { useAuth } from '../../auth/AuthContext';

export const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setLoading(true);
      await AuthService.login(data.loginId, data.password);
      // AuthContext will trigger state change, redirect logic should be in a generic AuthRedirect wrapper or useEffect, 
      // but simple redirect here works too if we wait a bit or let App.tsx handle it.
      // However, immediate navigation is better UX.
      // We'll rely on the RoleGuard or App routing, but let's push to root which redirects.
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Invalid credentials. Please check your Login ID and Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
            <User size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-500 text-sm">Welcome back to Dayflow</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Login ID / Email</label>
            <div className="relative">
              <input
                {...register('loginId')}
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. OIJODO2024001"
              />
              <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            {errors.loginId && <p className="text-xs text-red-500">{errors.loginId.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type="password"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your password"
              />
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>

        <div className="pt-2">
          <button
            type="button"
            onClick={async () => {
              const id = prompt("Enter Admin ID:", "admin");
              const pass = prompt("Enter Password:", "admin123");
              if (id && pass) {
                try {
                  await AuthService.register(id, pass);
                  alert("User created! You can now login.");
                } catch (e: any) {
                  alert("Failed: " + e.message);
                }
              }
            }}
            className="text-xs text-blue-500 hover:underline w-full text-center block"
          >
            (Dev Only) Create Account
          </button>
        </div>

        <div className="pt-4 text-center">
          <p className="text-xs text-gray-400">
            Authorized Personnel Only. <br />Contact HR for account access.
          </p>
        </div>
      </div>
    </div>
  );
};
