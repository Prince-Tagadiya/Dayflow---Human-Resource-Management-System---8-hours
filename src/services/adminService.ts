// Imports updated to remove unused auth logic
import { getFirestore, doc, setDoc, runTransaction, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
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

        try {
            // 2. Create Employee Profile in Firestore (Pending Registration status)
            // We do NOT create the Auth User here. The employee will do that themselves via /activate.
            await setDoc(doc(db, 'employees', loginId), {
                id: loginId,
                firstName: data.firstName,
                lastName: data.lastName,
                personalEmail: data.email, // Store email for verification
                department: data.department,
                designation: data.designation,
                yearOfJoining: data.yearOfJoining,
                phoneNumber: data.phoneNumber,
                companyCode: data.companyCode,
                ctc: data.ctc,
                dateOfJoining: new Date().toISOString(),
                isActive: true, 
                isRegistered: false, // CTA for Activation
                role: 'employee'
            });

            // Return only loginId, as no password exists yet
            return { loginId };

        } catch (error: any) {
            console.error("Creation Failed:", error);
            throw new Error(error.message || 'Failed to generate employee ID');
        }
    },

    updateEmployee: async (id: string, data: Partial<any>) => {
        try {
            await setDoc(doc(db, 'employees', id), data, { merge: true });
        } catch (error) {
            console.error("Error updating employee:", error);
            throw error;
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
