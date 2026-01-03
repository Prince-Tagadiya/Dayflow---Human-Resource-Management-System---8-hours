import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';

const activateSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[0-9]/, "Must contain a number").regex(/[!@#$%^&*]/, "Must contain a special char"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ActivateFormData = z.infer<typeof activateSchema>;

export const Activate = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [fetchingName, setFetchingName] = useState(false);
  const [employeeName, setEmployeeName] = useState<{first: string, last: string} | null>(null);
  

  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ActivateFormData>({
    resolver: zodResolver(activateSchema),
    mode: "onChange"
  });

  const employeeIdValue = watch("employeeId");
  const passwordValue = watch("password") || "";

  // Live Password Validators
  const hasMinLength = passwordValue.length >= 8;
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSpecial = /[!@#$%^&*]/.test(passwordValue);

  // Auto-fetch name when Employee ID changes (Debounced ideally, using Blur here for simplicity/cost)
  const handleIdBlur = async () => {
      if (!employeeIdValue) return;
      setFetchingName(true);
      setError(null);
      try {
          const docRef = doc(db, 'employees', employeeIdValue);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.isRegistered) {
                  setError("This Request ID is already activated. Please Login.");
                  setEmployeeName(null);
              } else {
                  setEmployeeName({ first: data.firstName, last: data.lastName });
              }
          } else {
              setEmployeeName(null);
              setError("Invalid Employee ID. Please contact HR.");
          }
      } catch (err) {
          console.error(err);
      } finally {
          setFetchingName(false);
      }
  };

  const onSubmit = async (data: ActivateFormData) => {
    if (!employeeName) {
        setError("Please enter a valid Employee ID first.");
        return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      await sendEmailVerification(user);
      
      // 2. Claim Employee Doc
      const empRef = doc(db, 'employees', data.employeeId);
      await updateDoc(empRef, {
        isRegistered: true,
        uid: user.uid,
        email: data.email
      });
      
      // 3. Create User Doc
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: data.email,
        role: 'employee',
        employeeId: data.employeeId,
        displayName: `${employeeName.first} ${employeeName.last}`
      });
      
      setSuccess(true);
      await signOut(auth); 
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center border border-gray-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="material-symbols-outlined text-green-600 text-3xl">mark_email_read</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox!</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <strong>{watch('email')}</strong>.<br/>
            Please verify your email to complete the activation process.
          </p>
          <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-sm text-yellow-800 text-left">
            <div className="flex gap-2">
                <span className="material-symbols-outlined text-yellow-600 text-lg">info</span>
                <div>
                    <strong>Can't find it?</strong><br/>
                    Check your spam/junk folder. It may take a few minutes to arrive.
                </div>
            </div>
          </div>
          <Link to="/login" className="inline-block w-full py-3 px-4 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-md">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold text-gray-900">
            Activate Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Verify your identity and set up your secure access.
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
              <div className="col-span-1 sm:col-span-2">
                <label htmlFor="employeeId" className="block text-sm font-semibold text-gray-700 mb-1">
                  Employee ID
                </label>
                <div className="relative rounded-md shadow-sm">
                   <input
                    {...register('employeeId')}
                    type="text"
                    onBlur={handleIdBlur}
                    className="block w-full rounded-lg border-gray-300 border px-4 py-3 focus:border-primary focus:ring-primary sm:text-sm outline-none transition-all placeholder-gray-400 uppercase"
                    placeholder="Enter ID provided by HR (e.g. OIJODO20240001)"
                  />
                  {fetchingName && (
                      <div className="absolute right-3 top-3">
                          <span className="material-symbols-outlined animate-spin text-gray-400">sync</span>
                      </div>
                  )}
                </div>
                {errors.employeeId && <p className="text-xs text-red-500 mt-1">{errors.employeeId.message}</p>}
              </div>

              {/* Read-Only Name Fields */}
              <div className="sm:col-span-1">
                 <label className="block text-sm font-semibold text-gray-500 mb-1">First Name</label>
                 <input 
                    type="text" 
                    disabled 
                    value={employeeName?.first || ''}
                    className="block w-full rounded-lg border-gray-200 bg-gray-50 border px-4 py-3 text-gray-500 cursor-not-allowed"
                    placeholder="-"
                 />
              </div>
              <div className="sm:col-span-1">
                 <label className="block text-sm font-semibold text-gray-500 mb-1">Last Name</label>
                 <input 
                    type="text" 
                    disabled 
                    value={employeeName?.last || ''}
                    className="block w-full rounded-lg border-gray-200 bg-gray-50 border px-4 py-3 text-gray-500 cursor-not-allowed"
                    placeholder="-"
                 />
              </div>

              {/* Email Address */}
              <div className="col-span-1 sm:col-span-2">
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
                <p className="text-xs text-gray-500 mt-1">We'll send a confirmation link to this address.</p>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 pt-2 border-t border-gray-100 mt-4">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                  Create Password
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
                
                {/* Live Password Requirements */}
                <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Password strength:</p>
                    
                    <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[16px] ${hasMinLength ? 'text-green-600' : 'text-gray-300'}`}>
                            {hasMinLength ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={`text-xs ${hasMinLength ? 'text-gray-700' : 'text-gray-400'}`}>Minimum 8 characters</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[16px] ${hasSpecial ? 'text-green-600' : 'text-gray-300'}`}>
                             {hasSpecial ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={`text-xs ${hasSpecial ? 'text-gray-700' : 'text-gray-400'}`}>Special character (!@#$)</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[16px] ${hasNumber ? 'text-green-600' : 'text-gray-300'}`}>
                             {hasNumber ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={`text-xs ${hasNumber ? 'text-gray-700' : 'text-gray-400'}`}>At least one number</span>
                    </div>
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
                disabled={loading || !employeeName}
                className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Activating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
