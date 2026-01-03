import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, orderBy, limit, addDoc, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
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

  // Fetch Attendance History (Legacy/Simple)
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
      limit(10)
    );

    return onSnapshot(q, (snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as AttendanceRecord[];
      // Sort in memory to avoid index requirements
      const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(sorted);
    });
  },

  // Fetch Attendance for a specific month
  getAttendanceByMonth: async (employeeId: string, date: Date) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 0-based

      const startStr = `${year}-${month.toString().padStart(2, '0')}-01`;
      // Calculate last day of month
      const lastDay = new Date(year, month, 0).getDate();
      const endStr = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

      // 1. Fetch Real Attendance
      const attQuery = query(
        collection(db, 'attendance'),
        where('employeeId', '==', employeeId),
        where('date', '>=', startStr),
        where('date', '<=', endStr),
        orderBy('date', 'desc')
      );
      const attSnapshot = await getDocs(attQuery);
      const realAttendance = attSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AttendanceRecord[];

      // 2. Fetch Leaves (Active in this month)
      const leavesQuery = query(
        collection(db, 'timeOffRequests'),
        where('employeeId', '==', employeeId),
        where('status', '==', 'approved'),
        orderBy('startDate', 'desc'),
        limit(50)
      );
      const leavesSnapshot = await getDocs(leavesQuery);
      let approvedLeaves = leavesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TimeOffRequest[];

      // Filter for overlap in memory
      approvedLeaves = approvedLeaves.filter(l => {
        return l.startDate <= endStr && l.endDate >= startStr;
      });

      // 3. Expand Leaves into Virtual Attendance Records
      const leaveRecords: AttendanceRecord[] = [];
      const monthStart = new Date(startStr);
      const monthEnd = new Date(endStr);

      approvedLeaves.forEach(leave => {
        const lStart = new Date(leave.startDate);
        const lEnd = new Date(leave.endDate);

        for (let d = new Date(lStart); d <= lEnd; d.setDate(d.getDate() + 1)) {
          if (d >= monthStart && d <= monthEnd) {
            const dateStr = d.toISOString().split('T')[0];
            if (!realAttendance.find(a => a.date === dateStr)) {
              leaveRecords.push({
                id: `virt_leave_${leave.id}_${dateStr}`,
                employeeId,
                date: dateStr,
                checkIn: null,
                checkOut: null,
                status: 'on-leave',
                isLocked: true
              });
            }
          }
        }
      });

      // 4. Merge and Sort
      const combined = [...realAttendance, ...leaveRecords];
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return combined;

    } catch (error) {
      console.error("Error fetching monthly attendance:", error);
      return [];
    }
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
      const today = new Date().toISOString().split('T')[0];
      const checkInTime = time || new Date().toISOString();

      // Check if record exists for today
      const q = query(
        collection(db, 'attendance'),
        where('employeeId', '==', employeeId),
        where('date', '==', today),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        await addDoc(collection(db, 'attendance'), {
          employeeId,
          date: today,
          checkIn: checkInTime,
          checkOut: null,
          status: 'present',
          isLocked: false
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
      const today = new Date().toISOString().split('T')[0];
      const checkOutTime = time || new Date().toISOString();

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
        await setDoc(ref, { checkOut: checkOutTime }, { merge: true });
      }
    } catch (error) {
      console.error("Error clocking out:", error);
      throw error;
    }
  }
};
