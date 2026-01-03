import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, orderBy, limit, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
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
  },

  // Calculate Leave Balances
  getLeaveBalances: async (employeeId: string) => {
    try {
      // 1. Define Entitlements
      const entitlements = {
        casual: 12,
        sick: 10,
        privilege: 20,
        unpaid: 0
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
  },

  // NEW: Real Attendance Tracking (Merged)
  clockIn: async (employeeId: string, customTime?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      let checkInTime = new Date().toISOString();

      if (customTime) {
        const [hours, minutes] = customTime.split(':');
        const d = new Date();
        d.setHours(parseInt(hours));
        d.setMinutes(parseInt(minutes));
        d.setSeconds(0);
        checkInTime = d.toISOString();
      }

      // Check if record exists for today (Accepting upstream logic)
      const q = query(
        collection(db, 'attendance'),
        where('employeeId', '==', employeeId),
        where('date', '==', today),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        const docRef = await addDoc(collection(db, 'attendance'), {
          employeeId,
          date: today,
          checkIn: checkInTime,
          checkOut: null,
          status: 'present',
          isLocked: false,
          createdAt: new Date().toISOString()
        });
        return docRef.id;
      }
      return snapshot.docs[0].id;
    } catch (error) {
      console.error("Error clocking in:", error);
      throw error;
    }
  },

  clockOut: async (employeeId: string, customTime?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      let checkOutTime = new Date().toISOString();

      if (customTime) {
        const [hours, minutes] = customTime.split(':');
        const d = new Date();
        d.setHours(parseInt(hours));
        d.setMinutes(parseInt(minutes));
        d.setSeconds(0);
        checkOutTime = d.toISOString();
      }

      const q = query(
        collection(db, 'attendance'),
        where('employeeId', '==', employeeId),
        where('date', '==', today),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id;
        const ref = doc(db, 'attendance', docId);
        await setDoc(ref, {
          checkOut: checkOutTime,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        return docId;
      }
      return null;
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
        orderBy('checkIn', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AttendanceRecord;
      }
      return null;
    } catch (error) {
      // If index doesn't exist, fallback to non-ordered
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
    }
  }
};
