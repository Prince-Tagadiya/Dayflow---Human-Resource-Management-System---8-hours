import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, runTransaction, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import type { CreateEmployeeFormData } from '../types/forms';
import { db } from '../firebase/firebase';

// Helper to generate correct ID format
const generateLoginId = async (firstName: string, lastName: string, year: number) => {
    const companyCode = 'OI'; // Odoo India
    const f2 = firstName.substring(0, 2).toUpperCase();
    const l2 = lastName.substring(0, 2).toUpperCase();
    const prefix = `${companyCode}${f2}${l2}${year}`;

    // ATOMIC Transaction to ensure unique Serial Number
    // Uses a counter document in Firestore
    const loginId = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'counters', `employee_serial_${year}`);
        const counterDoc = await transaction.get(counterRef);

        let currentSerial = 1;
        if (counterDoc.exists()) {
            currentSerial = counterDoc.data().current + 1;
        }

        transaction.set(counterRef, { current: currentSerial }, { merge: true });

        // Pad with zeros to 4 digits (e.g. 0001)
        const serialStr = currentSerial.toString().padStart(4, '0');
        return `${prefix}${serialStr}`;
    });

    return loginId;
};

export const AdminService = {
    createEmployee: async (data: CreateEmployeeFormData) => {
        // 1. Generate the Custom ID first
        const loginId = await generateLoginId(data.firstName, data.lastName, data.yearOfJoining);

        // 2. Generate Random Temp Password
        const tempPassword = Math.random().toString(36).slice(-8) + "1!"; // Ensuring complexity if needed

        // 3. Create User in Firebase Auth WITHOUT logging out current Admin
        // TRICK: Initialize a "secondary" Firebase App instance just for this action
        const firebaseConfig = {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        };

        const secondaryAppName = `secondaryApp-${Date.now()}`;
        const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
        const secondaryAuth = getAuth(secondaryApp);

        // CRITICAL FIX: Create Auth User with SYSTEM EMAIL (LoginID@dayflow.app)
        // This allows the user to login with their ID (e.g. OIJODO2024001) which maps to this email.
        const systemEmail = `${loginId}@dayflow.app`;

        try {
            // Create the user on the secondary app
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, systemEmail, tempPassword);
            const newUser = userCredential.user;

            console.log("Created Auth User:", newUser.uid);

            // 4. Create Firestore Profile (Using main DB connection which has Admin privileges)

            // Store explicit role 'employee' here since we can't set customClaims easily without Admin SDK

            // Employee Profile
            await setDoc(doc(db, 'employees', loginId), {
                id: loginId,
                uid: newUser.uid,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                department: data.department,
                designation: data.designation,
                yearOfJoining: data.yearOfJoining,
                phoneNumber: data.phoneNumber,
                companyCode: data.companyCode,
                dateOfJoining: new Date().toISOString(),
                isActive: true,
                role: 'employee',
                isFirstLogin: true // Flag to force password change
            });

            // User Mapping (Critical for RoleGuard)
            await setDoc(doc(db, 'users', newUser.uid), {
                uid: newUser.uid,
                email: data.email,
                role: 'employee',
                employeeId: loginId,
                displayName: `${data.firstName} ${data.lastName}`
            });

            // 5. Cleanup
            await signOut(secondaryAuth);
            await deleteApp(secondaryApp);

            return { loginId, tempPass: tempPassword };

        } catch (error: any) {
            console.error("Creation Failed:", error);
            // Ensure app is cleaned up even on error
            await deleteApp(secondaryApp).catch(() => { });

            if (error.code === 'auth/email-already-in-use') {
                throw new Error('This email is already registered.');
            }
            throw new Error(error.message || 'Failed to create employee');
        }
    },

    getAllEmployees: async () => {
        try {
            const q = query(collection(db, 'employees'), orderBy('dateOfJoining', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return { id: doc.id, ...data };
            });
        } catch (error) {
            console.error("Error fetching employees:", error);
            throw error;
        }
    },

    getAllAttendance: async (date?: string) => {
        try {
            const attendanceRef = collection(db, 'attendance');
            // If date is provided, filter by date, else get recent
            const q = date
                ? query(attendanceRef, where('date', '==', date))
                : query(attendanceRef, orderBy('date', 'desc'), limit(100)); // Limit to prevent overload

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return { id: doc.id, ...data };
            });
        } catch (error) {
            // Indexing error might occur here initially
            console.error("Error fetching attendance:", error);
            throw error;
        }
    },

    getAllTimeOffRequests: async () => {
        try {
            // Order by status (pending first) then date? Needs composite index.
            // Simple query first.
            const q = query(collection(db, 'timeOffRequests'), orderBy('startDate', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching leave requests:", error);
            return [];
        }
    },

    updateTimeOffRequestStatus: async (requestId: string, status: 'approved' | 'rejected', adminId: string, comments?: string) => {
        try {
            const ref = doc(db, 'timeOffRequests', requestId);
            await setDoc(ref, {
                status,
                approverId: adminId,
                reviewedAt: new Date().toISOString(),
                adminComments: comments || ''
            }, { merge: true });
        } catch (error) {
            console.error("Error updating leave request:", error);
            throw error;
        }
    },

    getSalaryStructure: async (employeeId: string) => {
        try {
            const docSnap = await getDocs(query(collection(db, 'salaryStructures'), where('employeeId', '==', employeeId)));
            if (!docSnap.empty) {
                return docSnap.docs[0].data();
            }
            return null;
        } catch (error) {
            console.error("Error fetching salary structure:", error);
            return null;
        }
    },

    updateSalaryStructure: async (employeeId: string, data: any) => {
        try {
            // Check if exists
            const q = query(collection(db, 'salaryStructures'), where('employeeId', '==', employeeId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Update
                const docId = querySnapshot.docs[0].id;
                await setDoc(doc(db, 'salaryStructures', docId), { ...data, employeeId }, { merge: true });
            } else {
                // Create
                const newDocRef = doc(collection(db, 'salaryStructures'));
                await setDoc(newDocRef, { ...data, employeeId, id: newDocRef.id });
            }
        } catch (error) {
            console.error("Error updating salary structure:", error);
            throw error;
        }
    },

    getAllPayrollRecords: async () => {
        try {
            const q = query(collection(db, 'payroll'), orderBy('month', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching payroll:", error);
            return [];
        }
    }
};
