import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, orderBy, limit, addDoc, doc, getDoc } from 'firebase/firestore';
import type { TimeOffRequest, AttendanceRecord, EmployeeProfile } from '../types';

export const EmployeeService = {
  // Fetch Employee Profile
  getProfile: async (employeeId: string) => {
    try {
      const docRef = doc(db, 'employees', employeeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as EmployeeProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  // Fetch Attendance History
  getAttendanceHistory: async (employeeId: string) => {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('employeeId', '==', employeeId),
        orderBy('date', 'desc'),
        limit(30)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AttendanceRecord[];
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return [];
    }
  },

  // Fetch Leave Requests
  getLeaveRequests: async (employeeId: string) => {
    try {
      const q = query(
        collection(db, 'timeOffRequests'),
        where('employeeId', '==', employeeId),
        orderBy('startDate', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TimeOffRequest[];
    } catch (error) {
      console.error("Error fetching leaves:", error);
      return [];
    }
  },

  // Apply for Leave
  applyLeave: async (data: Omit<TimeOffRequest, 'id' | 'status'>) => {
    try {
      await addDoc(collection(db, 'timeOffRequests'), {
        ...data,
        status: 'pending',
        appliedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error applying leave:", error);
      throw error;
    }
  }
};
