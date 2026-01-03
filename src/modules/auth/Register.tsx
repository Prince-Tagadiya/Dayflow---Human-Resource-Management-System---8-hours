import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';

const registerSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[0-9]/, "Must contain a number").regex(/[!@#$%^&*]/, "Must contain a special char"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Verify Employee ID Exists and is un-claimed
      const empRef = doc(db, 'employees', data.employeeId);
      const empSnap = await getDoc(empRef);
      
      if (!empSnap.exists()) {
        throw new Error("Invalid Employee ID. Please contact HR.");
      }
      
      const empData = empSnap.data();
      
      if (empData.isRegistered) {
        throw new Error("This Employee ID is already registered. Please login.");
      }
      
      // Optional: Verify email matches what HR put in? 
      // The requirement says "email verification required", suggesting user owns it.
      // But user also said "hr enters details, user enters email".
      // Let's assume user can use their own email, but we should probably match it if strict.
      // For now, allow any valid email but link it to this ID.
      
      // 2. Create Auth User
      // We use the USER provided email here for Auth, but we map it to the Employee ID.
      // Wait, your previous strict rule was "Login ID must be email".
      // If we create with `data.email`, they login with email.
      // If we create with `ID@dayflow.app`, they login with ID.
      // User request: "Users can register using: Employee ID, Email, Password".
      // This implies they can login with either? Or that the registration asks for these.
      // Let's stick to the secure ID-based system email for consistency OR switch to email login.
      // "email verification is required" implies real email.
      // HYBRID APPROACH:
      // We use the Real Email for Auth.
      // But we store 'employeeId' in the user doc so we can look them up.
      
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      await sendEmailVerification(user);
      
      // 3. Update Employee Doc (Claim it)
      await updateDoc(empRef, {
        isRegistered: true,
        uid: user.uid,
        email: data.email // confirmed email they registered with
      });
      
      // 4. Create User Doc (Role Mapping)
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: data.email,
        role: 'employee',
        employeeId: data.employeeId,
        displayName: `${empData.firstName} ${empData.lastName}`
      });
      
      setSuccess(true);
      await signOut(auth); // Force them to login again
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-green-600 text-3xl">mark_email_read</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            We have sent a verification email to your address. Please verify your email before logging in.
          </p>
          <Link to="/login" className="inline-block w-full py-3 px-4 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary mb-2">
            <span className="material-symbols-outlined !text-5xl">group_work</span>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Activate Employee Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the Employee ID provided by HR to set up your access.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                Employee ID
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                 <input
                  {...register('employeeId')}
                  type="text"
                  className="input-field uppercase"
                  placeholder="e.g. OIJODO20240001"
                />
              </div>
              {errors.employeeId && <p className="error-text">{errors.employeeId.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Official / Personal Email
              </label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Create Password
              </label>
              <div className="mt-1">
                <input
                  {...register('password')}
                  type="password"
                  className="input-field"
                />
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  {...register('confirmPassword')}
                  type="password"
                  className="input-field"
                />
              </div>
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Activating...' : 'Activate Account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already activated?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
               <Link to="/login" className="font-medium text-primary hover:text-blue-500">
                 Sign in to your account
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
