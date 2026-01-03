import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// 1. Employee Creation (Admin Only)
// Call this via Callable Function from Client
export const createEmployee = functions.https.onCall(async (data, context) => {
  // Security: Check if requestor is Admin
  if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can create employees');
  }

  const { firstName, lastName, department, designation, salaryDetails } = data;

  // Logic:
  // 1. Generate System Login ID (e.g. EMP-001)
  // 2. Generate Random Password
  // 3. Create Auth User
  // 4. Set Custom Claims (role: employee, employeeId: ID)
  // 5. Create Firestore Documents:
  //    - /users/{uid}
  //    - /employees/{id}
  //    - /salaryStructures/{id} (Secure!)
  
  return { message: "Employee Created", loginId: "EMP-001", tempPassword: "xyz" };
});

// 2. Attendance Validation & Calculation (Trigger or Scheduled)
export const calculatePayableDays = functions.firestore
  .document('attendance/{id}')
  .onWrite(async (change, context) => {
    // Logic to update monthly payable days summary
    // Enforce "source-of-truth" and immutability rules checks
  });

// 3. Payroll Computation (Scheduled or Callable)
export const runPayroll = functions.https.onCall(async (data, context) => {
   if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can run payroll');
  }
  // Logic: 
  // Fetch Attendance Summary -> Fetch Salary Structure -> Calculate Net Pay -> Write to /payroll
});
