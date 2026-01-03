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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your details below to activate your account. You will receive verification instructions via email.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Employee ID */}
              <div>
                <label htmlFor="employeeId" className="block text-sm font-semibold text-gray-700 mb-1">
                  Employee ID
                </label>
                <div className="relative rounded-md shadow-sm">
                   <input
                    {...register('employeeId')}
                    type="text"
                    className="block w-full rounded-lg border-gray-300 border px-4 py-3 focus:border-primary focus:ring-primary sm:text-sm outline-none transition-all placeholder-gray-400"
                    placeholder="e.g. EMP-00123"
                  />
                </div>
                {errors.employeeId && <p className="text-xs text-red-500 mt-1">{errors.employeeId.message}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    {...register('email')}
                    type="email"
                    className="block w-full rounded-lg border-gray-300 border px-4 py-3 focus:border-primary focus:ring-primary sm:text-sm outline-none transition-all placeholder-gray-400"
                    placeholder="name@company.com"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
            </div>

            {/* Note: Access Role section skipped as requested */}

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 pt-2">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    {...register('password')}
                    type="password"
                    className="block w-full rounded-lg border-gray-300 border px-4 py-3 focus:border-primary focus:ring-primary sm:text-sm outline-none transition-all placeholder-gray-900 tracking-widest"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                
                {/* Password Requirements Hint */}
                <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-primary mb-1">Password requirements:</p>
                    <ul className="text-xs text-gray-500 list-disc pl-4 space-y-0.5">
                        <li>Minimum 8 characters</li>
                        <li>At least one special character (!@#$)</li>
                        <li>At least one number</li>
                    </ul>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className="block w-full rounded-lg border-gray-300 border px-4 py-3 focus:border-primary focus:ring-primary sm:text-sm outline-none transition-all placeholder-gray-900 tracking-widest"
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
                <p className="text-xs text-gray-400 mt-2">Both passwords must match.</p>
              </div>
            </div>

            {/* Email Verification Info Box */}
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-100 flex gap-3 items-start mt-6">
              <div className="flex-shrink-0">
                <span className="material-symbols-outlined text-primary">mail</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Email verification is required</h3>
                <div className="mt-1 text-sm text-gray-600">
                  <p>
                    A confirmation link will be sent to the email address provided. The account will remain inactive until the email is verified by you.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
              <Link 
                to="/login"
                className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
