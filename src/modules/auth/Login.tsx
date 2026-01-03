import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
      const user = await AuthService.login(data.loginId, data.password);
      
      // 2. Strict Email Verification Check
      if (!user.emailVerified) {
          // Exception: The master admin (hr@dayflow.app) might not be verified if created manually
          if (user.email !== 'hr@dayflow.app') {
             await AuthService.logout();
             throw new Error("Email not verified. Please check your inbox or spam folder.");
          }
      }

      // Dynamic Redirect based on Role
      // We need to know if they are Admin or Employee to send them to the right route.
      // Since Claims might delay, let's peek at Firestore quickly.
      
      try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('../../firebase/firebase');
          
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
              const role = userDoc.data().role;
              console.log("Login Redirect: Found role", role);
              
              if (role === 'admin') {
                  navigate('/dashboard/hr');
              } else if (role === 'employee') {
                  navigate('/dashboard/employee');
              } else {
                  console.warn("Unknown role, going to root");
                  navigate('/');
              }
          } else {
               // Fallback
               navigate('/');
          }
      } catch (e) {
          console.error("Redirect logic error", e);
          navigate('/');
      }

    } catch (err: any) {
      console.error("Login Error details:", err);
      // Firebase auth errors are specific
      let msg = 'Invalid credentials';
      if (err.code === 'auth/user-not-found') msg = 'User not found';
      if (err.code === 'auth/wrong-password') msg = 'Invalid password';
      if (err.code === 'auth/network-request-failed') msg = 'Network error - Check your connection';
      
      setError(msg);
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

        <div className="mb-6 text-center">
            <Link to="/activate" className="text-sm font-medium text-blue-600 hover:underline">
              First time login? Activate your account here
            </Link>
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

        <div className="pt-4 text-center">
            <p className="text-xs text-gray-400">
                Authorized Personnel Only. <br/>Contact HR for account access.
            </p>
        </div>
      </div>
    </div>
  );
};
