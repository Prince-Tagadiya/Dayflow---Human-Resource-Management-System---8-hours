import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../firebase/firebase';
import type { CreateEmployeeFormData } from '../types/forms';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

// Client-side helper to simulate ID generation if Cloud Functions are not available (Demo Mode)
// In production, this logic MUST be in the Cloud Function to avoid race conditions.
const generateLoginId = async (firstName: string, lastName: string, year: number) => {
  const companyCode = 'OI'; // Odoo India
  const f2 = firstName.substring(0, 2).toUpperCase();
  const l2 = lastName.substring(0, 2).toUpperCase();
  const prefix = `${companyCode}${f2}${l2}${year}`;

  // Check last serial for this prefix pattern (Simulated)
  // Real implementation: Firestore Counter or Transaction
  // Demo implementation: Random for safety if no DB access, but let's try to query

  // For this assignment, we will use a random 4 digit number to avoid collisions without transactions
  const randomSerial = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomSerial}`;
};

export const AdminService = {
  createEmployee: async (data: CreateEmployeeFormData) => {
    const functions = getFunctions();

    try {
      // 1. Try Cloud Function first (Best Practice)
      const createEmployeeFn = httpsCallable(functions, 'createEmployee');
      const result = await createEmployeeFn(data);
      return result.data as { loginId: string; tempPass: string };
    } catch (error: any) {
      console.warn("Cloud function failed (likely not deployed). Falling back to DEMO mode (Client-side generation).", error);

      // --- FALLBACK DEMO MODE (For strict Requirement delivery without backend deployment) ---
      // Validate Admin locally? Firestore rules will enforce writing permissions anyway.
      // We cannot create a Firebase Auth User from Client SDK without logging out.
      // STOPPER: We strictly cannot create a new user without logging out.

      // Solution: specific instruction to User or Mocking the return
      throw new Error("Cloud Function 'createEmployee' is required to create secure accounts. Please deploy functions.");
    }
  }
};
