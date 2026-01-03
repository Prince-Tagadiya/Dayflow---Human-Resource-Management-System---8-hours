import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, orderBy, limit, addDoc, doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { TimeOffRequest, AttendanceRecord, EmployeeProfile } from '../types';

export const EmployeeService = {
  // Fetch Employee Profile by ID (Document Key)
  getProfile: async (employeeId: string) => {
    try {
      const docRef = doc(db, 'employees', employeeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as EmployeeProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  // Fetch Employee Profile by Auth UID
  getProfileByUid: async (uid: string) => {
    try {
      const q = query(
        collection(db, 'employees'),
        where('uid', '==', uid),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as EmployeeProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile by UID:", error);
      return null;
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

  // Real-time listener for Attendance
  subscribeToAttendance: (employeeId: string, callback: (records: AttendanceRecord[]) => void) => {
    const q = query(
      collection(db, 'attendance'),
      where('employeeId', '==', employeeId),
      orderBy('date', 'desc'),
      limit(10)
    );

    return onSnapshot(q, (snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as AttendanceRecord[];
      callback(data);
    });
  },

  // Fetch Leave Requests (Static)
  getLeaveRequests: async (employeeId: string) => {
    try {
      const q = query(
        collection(db, 'timeOffRequests'),
        where('employeeId', '==', employeeId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TimeOffRequest[];
      // Sort in memory to avoid needing a Firestore index for simple setups
      return data.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    } catch (error) {
      console.error("Error fetching leaves:", error);
      return [];
    }
  },

  // Real-time listener for Leave Requests
  subscribeToLeaveRequests: (employeeId: string, callback: (requests: TimeOffRequest[]) => void) => {
    const q = query(
      collection(db, 'timeOffRequests'),
      where('employeeId', '==', employeeId)
    );

    return onSnapshot(q, (snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as TimeOffRequest[];
      const sorted = data.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      callback(sorted);
    });
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
  },

  // Calculate Leave Balances
  getLeaveBalances: async (employeeId: string) => {
    try {
      // 1. Define Entitlements
      const entitlements = {
        casual: 12,
        sick: 10,
        privilege: 20,
        unpaid: 0 // Unpaid has no limit usually, or tracked differently
      };

      // 2. Fetch ALL approved requests for this user
      const q = query(
        collection(db, 'timeOffRequests'),
        where('employeeId', '==', employeeId),
        where('status', '==', 'approved')
      );
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => doc.data() as TimeOffRequest);

      // 3. Calculate Taken Days
      const taken = {
        casual: 0,
        sick: 0,
        privilege: 0,
        unpaid: 0
      };

      requests.forEach(req => {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        // Simple day diff + 1. 
        // NOTE: Does not account for weekends/holidays in this simple version, 
        // but sufficient for now as per "make this real".
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (req.type in taken) {
          taken[req.type as keyof typeof taken] += days;
        }
      });

      // 4. Return Structure
      return {
        casual: { taken: taken.casual, total: entitlements.casual },
        sick: { taken: taken.sick, total: entitlements.sick },
        privilege: { taken: taken.privilege, total: entitlements.privilege },
        unpaid: { taken: taken.unpaid, total: 0 }
      };

    } catch (error) {
      console.error("Error calculating balances:", error);
      return {
        casual: { taken: 0, total: 12 },
        sick: { taken: 0, total: 10 },
        privilege: { taken: 0, total: 20 },
        unpaid: { taken: 0, total: 0 }
      };
    }
  }
};
