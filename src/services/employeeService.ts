import { db } from '../firebase/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  setDoc,
  orderBy,
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import type { EmployeeProfile, AttendanceRecord, TimeOffRequest } from '../types';

export const EmployeeService = {
  // Get employee profile by UID
  getProfileByUid: async (uid: string): Promise<EmployeeProfile | null> => {
    try {
      const q = query(
        collection(db, 'employees'),
        where('uid', '==', uid),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as EmployeeProfile;
    } catch (error) {
      console.error("Error getting profile:", error);
      throw error;
    }
  },

  // Get employee profile by Document ID
  getProfile: async (id: string): Promise<EmployeeProfile | null> => {
    try {
      const docRef = doc(db, 'employees', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as EmployeeProfile;
      }
      return null;
    } catch (error) {
      console.error("Error getting profile:", error);
      throw error;
    }
  },

  // Update profile
  updateProfile: async (id: string, data: Partial<EmployeeProfile>) => {
    try {
      const docRef = doc(db, 'employees', id);
      await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Real-time Attendance Subscription
  subscribeToAttendance: (employeeId: string, callback: (records: AttendanceRecord[]) => void) => {
    const q = query(
      collection(db, 'attendance'),
      where('employeeId', '==', employeeId),
      orderBy('date', 'desc'),
      limit(31)
    );

    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];
      callback(records);
    });
  },

  // Get attendance by month (for History)
  getAttendanceByMonth: async (employeeId: string, date: Date): Promise<AttendanceRecord[]> => {
    try {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

      // 1. Fetch real attendance
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('employeeId', '==', employeeId),
        where('date', '>=', startOfMonth),
        where('date', '<=', endOfMonth),
        orderBy('date', 'desc')
      );
      const attendanceSnap = await getDocs(attendanceQuery);
      const realRecords = attendanceSnap.docs.map(d => ({ id: d.id, ...d.data() })) as AttendanceRecord[];

      // 2. Fetch approved leaves to show in history
      const leavesQuery = query(
        collection(db, 'timeOffRequests'),
        where('employeeId', '==', employeeId),
        where('status', '==', 'approved')
      );
      const leavesSnap = await getDocs(leavesQuery);
      const leaveRecords: AttendanceRecord[] = [];

      leavesSnap.docs.forEach(d => {
        const leave = d.data();
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);

        // Loop through each day of leave
        for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
          const dateStr = dt.toISOString().split('T')[0];
          // Only add if within current month and not already marked as present
          if (dateStr >= startOfMonth && dateStr <= endOfMonth) {
            if (!realRecords.some(r => r.date === dateStr)) {
              leaveRecords.push({
                id: `leave-${d.id}-${dateStr}`,
                employeeId,
                date: dateStr,
                status: 'leave',
                checkIn: '',
                checkOut: '',
                isLeave: true,
                leaveType: leave.type
              } as any);
            }
          }
        }
      });

      return [...realRecords, ...leaveRecords].sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error("Error fetching monthly attendance:", error);
      return [];
    }
  },

  // Today's specific attendance helper
  getTodayAttendance: async (employeeId: string): Promise<AttendanceRecord | null> => {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'attendance'),
      where('employeeId', '==', employeeId),
      where('date', '==', today),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as AttendanceRecord;
  },

  // Real Attendance Tracking
  clockIn: async (employeeId: string, time?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const checkInTime = time || new Date().toISOString();

      // Check for any OPEN session (no checkOut)
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
          date: today,
          checkIn: checkInTime,
          status: 'present',
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error clocking in:", error);
      throw error;
    }
  },

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
        return activeSession.id;
      }
      return null;
    } catch (error) {
      console.error("Error clocking out:", error);
      throw error;
    }
  },

  // Apply for leave
  applyLeave: async (employeeId: string, data: Partial<TimeOffRequest>) => {
    try {
      await addDoc(collection(db, 'timeOffRequests'), {
        ...data,
        employeeId,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error applying leave:", error);
      throw error;
    }
  },

  // Real-time Leave Subscription
  subscribeToLeaveRequests: (employeeId: string, callback: (requests: TimeOffRequest[]) => void) => {
    const q = query(
      collection(db, 'timeOffRequests'),
      where('employeeId', '==', employeeId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimeOffRequest[];
      callback(requests);
    });
  },

  // Get leave balances
  getLeaveBalances: async (employeeId: string) => {
    try {
      const q = query(
        collection(db, 'timeOffRequests'),
        where('employeeId', '==', employeeId),
        where('status', '==', 'approved')
      );
      const snapshot = await getDocs(q);

      const balances = {
        casual: { taken: 0, total: 12 },
        sick: { taken: 0, total: 10 },
        privilege: { taken: 0, total: 20 },
        unpaid: { taken: 0, total: 0 }
      };

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const type = data.type as keyof typeof balances;
        if (balances[type]) {
          balances[type].taken += days;
        }
      });

      return balances;
    } catch (error) {
      console.error("Error getting leave balances:", error);
      throw error;
    }
  },

  // Get attendance history (Legacy / Fallback)
  getAttendanceHistory: async (employeeId: string): Promise<AttendanceRecord[]> => {
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
      console.error("Error getting attendance history:", error);
      throw error;
    }
  },

  // Get leave requests (Legacy / One-time)
  getLeaveRequests: async (employeeId: string): Promise<TimeOffRequest[]> => {
    try {
      const q = query(
        collection(db, 'timeOffRequests'),
        where('employeeId', '==', employeeId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TimeOffRequest[];
    } catch (error) {
      console.error("Error getting leave requests:", error);
      throw error;
    }
  }
};
