import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, orderBy, limit, addDoc, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import type { TimeOffRequest, AttendanceRecord, EmployeeProfile } from '../types';

export const EmployeeService = {
  // Fetch Employee Profile by ID
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

  // Fetch Attendance for a specific month
  getAttendanceByMonth: async (employeeId: string, date: Date) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 0-based

      const startStr = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endStr = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

      const attQuery = query(
        collection(db, 'attendance'),
        where('employeeId', '==', employeeId),
        where('date', '>=', startStr),
        where('date', '<=', endStr),
        orderBy('date', 'desc')
      );
      const attSnapshot = await getDocs(attQuery);
      const realAttendance = attSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AttendanceRecord[];

      return realAttendance;

    } catch (error) {
      console.error("Error fetching monthly attendance:", error);
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
  applyLeave: async (data: Omit<TimeOffRequest, 'id' | 'status' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'timeOffRequests'), {
        ...data,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error applying leave:", error);
      throw error;
    }
  },

  // Calculate Leave Balances
  getLeaveBalances: async (employeeId: string) => {
    try {
      const entitlements = {
        casual: 12,
        sick: 10,
        privilege: 20,
        unpaid: 0
      };

      const q = query(
        collection(db, 'timeOffRequests'),
        where('employeeId', '==', employeeId),
        where('status', '==', 'approved')
      );
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => doc.data() as TimeOffRequest);

      const taken = {
        casual: 0,
        sick: 0,
        privilege: 0,
        unpaid: 0
      };

      requests.forEach(req => {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (req.type in taken) {
          taken[req.type as keyof typeof taken] += days;
        }
      });

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
  },

  // Clock In
  clockIn: async (employeeId: string, time?: string) => {
    try {
      const checkInTime = time || new Date().toISOString();
      // Derive 'date' field from the check-in time (simulated or real) to ensure consistency
      const relevantDate = new Date(checkInTime).toISOString().split('T')[0];

      // Check for any OPEN session (no checkOut) among recent records
      const q = query(
        collection(db, 'attendance'),
        where('employeeId', '==', employeeId),
        orderBy('date', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const activeSession = snapshot.docs.find(d => !d.data().checkOut);

      if (!activeSession) {
        await addDoc(collection(db, 'attendance'), {
          employeeId,
          date: relevantDate,
          checkIn: checkInTime,
          checkOut: null,
          status: 'present',
          isLocked: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error clocking in:", error);
      throw error;
    }
  },

  // Clock Out
  clockOut: async (employeeId: string, time?: string) => {
    try {
      const checkOutTime = time || new Date().toISOString();

      // Find the latest OPEN session
      const q = query(
        collection(db, 'attendance'),
        where('employeeId', '==', employeeId),
        orderBy('date', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const activeSession = snapshot.docs.find(d => !d.data().checkOut);

      if (activeSession) {
        const ref = doc(db, 'attendance', activeSession.id);
        await setDoc(ref, { 
            checkOut: checkOutTime,
            updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error clocking out:", error);
      throw error;
    }
  },

  getTodayAttendance: async (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const q = query(
        collection(db, 'attendance'),
        where('employeeId', '==', employeeId),
        where('date', '==', today),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AttendanceRecord;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
};
