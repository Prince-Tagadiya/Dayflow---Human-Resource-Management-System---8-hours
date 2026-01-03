import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const createEmployee = functions.https.onCall(async (data, context) => {
  // 1. Security Check: Only Admins can call this
  if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only HR Admins can create employees.');
  }

  const { firstName, lastName, department, designation, email, yearOfJoining, companyCode } = data;

  // 2. Generate Login ID
  // Logic: [CompanyCode][First2][Last2][Year][Serial]
  const f2 = firstName.substring(0, 2).toUpperCase();
  const l2 = lastName.substring(0, 2).toUpperCase();
  const prefix = `${companyCode || 'OI'}${f2}${l2}${yearOfJoining}`;

  // Transaction to get unique serial
  const loginId = await db.runTransaction(async (transaction) => {
    const counterRef = db.collection('counters').doc(`employee_serial_${yearOfJoining}`);
    const counterDoc = await transaction.get(counterRef);
    
    let currentSerial = 1;
    if (counterDoc.exists) {
      currentSerial = counterDoc.data()!.current + 1;
    }
    
    transaction.set(counterRef, { current: currentSerial }, { merge: true });
    
    // Pad with zeros to 4 digits (e.g. 0001)
    const serialStr = currentSerial.toString().padStart(4, '0');
    return `${prefix}${serialStr}`;
  });

  // 3. Generate Temporary Password
  const tempPassword = Math.random().toString(36).slice(-8); // Random 8 chars

  // 4. Create Authentication User
  try {
    const userRecord = await admin.auth().createUser({
      email: email, // Assuming email is unique and available
      emailVerified: true,
      password: tempPassword,
      displayName: `${firstName} ${lastName}`,
      disabled: false,
    });

    // 5. Set Custom Claims (Role + ID)
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'employee',
      employeeId: loginId,
      companyId: 'ODOO_IND' // Default
    });

    // 6. Create Employee Profile in Firestore
    await db.collection('employees').doc(loginId).set({
      id: loginId,
      uid: userRecord.uid,
      firstName,
      lastName,
      email,
      department,
      designation,
      yearOfJoining,
      dateOfJoining: new Date().toISOString(),
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isFirstLogin: true // Force password change flag
    });
    
    // 7. Create User Reference
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      role: 'employee',
      employeeId: loginId
    });

    return { 
      loginId, 
      tempPass: tempPassword,
      message: 'Employee created successfully' 
    };

  } catch (error: any) {
    console.error("Error creating employee:", error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
