import { doc, setDoc, runTransaction } from 'firebase/firestore';
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
        // We do NOT create the Auth User here. The employee will do that themselves.
        await setDoc(doc(db, 'employees', loginId), {
            id: loginId,
            firstName: data.firstName,
            lastName: data.lastName,
            personalEmail: data.email, // Store the email they provided to HR as 'personalEmail' for verification later
            department: data.department,
            designation: data.designation,
            yearOfJoining: data.yearOfJoining,
            phoneNumber: data.phoneNumber,
            companyCode: data.companyCode,
            dateOfJoining: new Date().toISOString(),
            isActive: true, // Active as an employee record, but not essentially 'login ready' until reg
            isRegistered: false, // Critical flag for the registration flow
            role: 'employee'
        });
        
        // No User Mapping created yet because there is no UID.
        
        return { loginId };

    } catch (error: any) {
        console.error("Creation Failed:", error);
        throw new Error(error.message || 'Failed to generate employee ID');
    }
  }
};
