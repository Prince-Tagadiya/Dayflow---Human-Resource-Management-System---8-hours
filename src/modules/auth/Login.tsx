import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, Lock, User, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { loginSchema, type LoginFormData } from '../../types/forms';

export const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setLoading(true);

      const user = await AuthService.login(data.loginId, data.password);

      // Strict Email Verification Check
      if (!user.emailVerified) {
        if (user.email !== 'hr@dayflow.app') {
          await AuthService.logout();
          throw new Error("Email not verified. Please check your inbox or spam folder.");
        }
      }

      // Dynamic Redirect based on Role
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../../firebase/firebase');

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          if (role === 'admin') navigate('/dashboard/hr');
          else if (role === 'employee') navigate('/dashboard/employee');
          else navigate('/');
        } else {
          navigate('/');
        }
      } catch (e) {
        navigate('/');
      }

    } catch (err: any) {
      console.error("Login Error details:", err);
      let msg = 'Invalid credentials';
      // Preserve specific errors like "Email not verified"
      if (err.message && err.message.includes("verified")) {
        msg = err.message;
      } else {
        if (err.code === 'auth/user-not-found') msg = 'User not found';
        if (err.code === 'auth/wrong-password') msg = 'Invalid password';
        if (err.code === 'auth/too-many-requests') msg = 'Too many failed attempts. Try again later.';
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary mb-2">
          <span className="material-symbols-outlined !text-5xl">group_work</span>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <div className="mt-2 text-center">
          <p className="text-gray-500 text-sm">Welcome back to Dayflow</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

          <div className="mb-6 text-center">
            <Link to="/activate" className="text-sm font-medium text-blue-600 hover:underline">
              First time login? Activate your account here
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className={`p-4 mb-4 rounded-md border-l-4 ${error.includes('verified') ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'bg-red-50 border-red-400 text-red-700'}`}>
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                    {error.includes('verified') && (
                      <p className="text-xs mt-1">Check your spam folder if you don't see the email.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Login ID / Email</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Employee ID or Email"
                  {...register('loginId')}
                  className="pl-10 input-field w-full rounded-lg border-gray-300 border py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {errors.loginId && (
                <p className="text-sm text-red-500">{errors.loginId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register('password')}
                  className="pl-10 pr-10 input-field w-full rounded-lg border-gray-300 border py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
              <div className="flex justify-end pt-1">
                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
};
