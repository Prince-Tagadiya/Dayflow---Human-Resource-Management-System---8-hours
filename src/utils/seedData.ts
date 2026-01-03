import { db } from '../firebase/firebase';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { faker } from '@faker-js/faker';

// Realistic Indian Names
const indianFirstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Atharva', 'Advait', 'Pranav', 'Kabir', 'Dhruv', 'Ritvik', 'Harsh', 'Arnav', 'Rohan',
    'Priya', 'Ananya', 'Aisha', 'Diya', 'Isha', 'Kavya', 'Meera', 'Nisha', 'Pooja', 'Riya',
    'Shreya', 'Tanvi', 'Neha', 'Anjali', 'Divya', 'Sakshi', 'Kritika', 'Simran', 'Swati', 'Nikita',
    'Rahul', 'Amit', 'Vikram', 'Suresh', 'Rajesh', 'Manish', 'Karan', 'Nikhil', 'Deepak', 'Sanjay',
    'Sneha', 'Pallavi', 'Komal', 'Rashmi', 'Jyoti', 'Megha', 'Shikha', 'Preeti', 'Ankita', 'Sonali'
];

const indianLastNames = [
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy', 'Rao', 'Iyer', 'Nair',
    'Pillai', 'Menon', 'Das', 'Bose', 'Ghosh', 'Banerjee', 'Mukherjee', 'Chatterjee', 'Sen', 'Roy',
    'Joshi', 'Kulkarni', 'Deshmukh', 'Patil', 'Deshpande', 'Thakur', 'Tiwari', 'Pandey', 'Mishra', 'Dubey',
    'Agarwal', 'Jain', 'Mehta', 'Shah', 'Kapoor', 'Khanna', 'Malhotra', 'Arora', 'Bhatia', 'Sethi',
    'Chopra', 'Goel', 'Rastogi', 'Saxena', 'Srivastava', 'Trivedi', 'Bhatt', 'Nayak', 'Hegde', 'Shetty'
];

const departments = ['Engineering', 'Human Resources', 'Sales', 'Marketing', 'Finance', 'Design', 'Operations', 'Product'];
const designations = ['Software Engineer', 'Senior Developer', 'Team Lead', 'Manager', 'Director', 'Intern', 'Business Analyst', 'HR Executive', 'Consultant'];

const getRandomIndianName = () => {
    return {
        firstName: indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)],
        lastName: indianLastNames[Math.floor(Math.random() * indianLastNames.length)]
    };
};

const generateEmployeeId = (firstName: string, lastName: string, year: number, serial: number) => {
    const f2 = firstName.substring(0, 2).toUpperCase();
    const l2 = lastName.substring(0, 2).toUpperCase();
    const serialStr = serial.toString().padStart(4, '0');
    return `OI${f2}${l2}${year}${serialStr}`;
};

// Clear all documents from a collection
const clearCollection = async (collectionName: string) => {
    const snapshot = await getDocs(collection(db, collectionName));
    const batch = writeBatch(db);
    let count = 0;
    
    snapshot.docs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
        count++;
    });
    
    if (count > 0) {
        await batch.commit();
    }
    console.log(`Cleared ${count} documents from ${collectionName}`);
    return count;
};

export const seedDatabase = async () => {
    console.log("=== CLEARING OLD DATA ===");
    
    // Clear all existing data first
    await clearCollection('employees');
    await clearCollection('attendance');
    await clearCollection('timeOffRequests');
    await clearCollection('salaryStructures');
    await clearCollection('payroll');
    await clearCollection('counters');
    
    console.log("=== OLD DATA CLEARED ===");
    console.log("=== SEEDING NEW DATA ===");

    const batch = writeBatch(db);
    let operationCount = 0;

    const employees: any[] = [];
    const NUM_EMPLOYEES = 25;

    // Generate Employees with Indian names
    for (let i = 0; i < NUM_EMPLOYEES; i++) {
        const { firstName, lastName } = getRandomIndianName();
        const yearOfJoining = faker.number.int({ min: 2021, max: 2025 });
        const id = generateEmployeeId(firstName, lastName, yearOfJoining, i + 1);

        const employee = {
            id: id,
            firstName,
            lastName,
            personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
            department: faker.helpers.arrayElement(departments),
            designation: faker.helpers.arrayElement(designations),
            yearOfJoining,
            phoneNumber: `+91 ${faker.number.int({ min: 70000, max: 99999 })} ${faker.number.int({ min: 10000, max: 99999 })}`,
            companyCode: id,
            dateOfJoining: faker.date.past({ years: 3 }).toISOString(),
            isActive: true,
            isRegistered: faker.datatype.boolean({ probability: 0.7 }),
            role: 'employee',
            ctc: faker.number.int({ min: 400000, max: 2500000 })
        };

        const empRef = doc(db, 'employees', id);
        batch.set(empRef, employee);
        employees.push(employee);
        operationCount++;
    }

    // Today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Assign attendance statuses for TODAY
    // 60% Present, 20% Absent, 20% On Leave
    const shuffledEmployees = [...employees].sort(() => Math.random() - 0.5);
    const presentCount = Math.floor(NUM_EMPLOYEES * 0.6);
    const absentCount = Math.floor(NUM_EMPLOYEES * 0.2);

    const presentEmployees = shuffledEmployees.slice(0, presentCount);
    const absentEmployees = shuffledEmployees.slice(presentCount, presentCount + absentCount);
    const onLeaveEmployees = shuffledEmployees.slice(presentCount + absentCount);

    // Create PRESENT attendance records
    for (const emp of presentEmployees) {
        const attRef = doc(collection(db, 'attendance'));
        const hasCheckedOut = faker.datatype.boolean({ probability: 0.3 });
        
        batch.set(attRef, {
            id: attRef.id,
            employeeId: emp.id,
            date: todayStr,
            checkIn: `${todayStr}T09:${faker.number.int({ min: 0, max: 30 }).toString().padStart(2, '0')}:00.000Z`,
            checkOut: hasCheckedOut ? `${todayStr}T18:${faker.number.int({ min: 0, max: 30 }).toString().padStart(2, '0')}:00.000Z` : null,
            status: 'present',
            isLocked: false
        });
        operationCount++;
    }

    // Create ABSENT attendance records
    for (const emp of absentEmployees) {
        const attRef = doc(collection(db, 'attendance'));
        batch.set(attRef, {
            id: attRef.id,
            employeeId: emp.id,
            date: todayStr,
            checkIn: null,
            checkOut: null,
            status: 'absent',
            isLocked: false
        });
        operationCount++;
    }

    // Create ON-LEAVE records
    for (const emp of onLeaveEmployees) {
        const leaveRef = doc(collection(db, 'timeOffRequests'));
        const leaveType = faker.helpers.arrayElement(['sick', 'casual', 'earned']);
        
        batch.set(leaveRef, {
            id: leaveRef.id,
            employeeId: emp.id,
            type: leaveType,
            startDate: todayStr,
            endDate: faker.date.soon({ days: 3 }).toISOString().split('T')[0],
            reason: faker.helpers.arrayElement([
                'Family function',
                'Medical appointment',
                'Personal work',
                'Wedding ceremony',
                'Festival celebration',
                'Out of station travel'
            ]),
            status: 'approved',
            createdAt: faker.date.recent({ days: 5 }).toISOString(),
            appliedAt: faker.date.recent({ days: 5 }).toISOString()
        });
        operationCount++;

        // Also mark as on-leave in attendance
        const attRef = doc(collection(db, 'attendance'));
        batch.set(attRef, {
            id: attRef.id,
            employeeId: emp.id,
            date: todayStr,
            checkIn: null,
            checkOut: null,
            status: 'on-leave',
            isLocked: false
        });
        operationCount++;
    }

    // Add some PENDING leave requests
    for (let i = 0; i < 5; i++) {
        const emp = faker.helpers.arrayElement(presentEmployees);
        const leaveRef = doc(collection(db, 'timeOffRequests'));
        batch.set(leaveRef, {
            id: leaveRef.id,
            employeeId: emp.id,
            type: faker.helpers.arrayElement(['sick', 'casual', 'earned', 'unpaid']),
            startDate: faker.date.soon({ days: 7 }).toISOString().split('T')[0],
            endDate: faker.date.soon({ days: 14 }).toISOString().split('T')[0],
            reason: faker.helpers.arrayElement([
                'Family emergency',
                'Health checkup',
                'Vacation trip',
                'Home town visit',
                'Personal reasons'
            ]),
            status: 'pending',
            createdAt: new Date().toISOString(),
            appliedAt: new Date().toISOString()
        });
        operationCount++;
    }

    // Generate past attendance (last 14 days)
    for (let d = 1; d <= 14; d++) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - d);
        const dateStr = pastDate.toISOString().split('T')[0];

        // Skip weekends
        if (pastDate.getDay() === 0 || pastDate.getDay() === 6) continue;

        for (const emp of employees) {
            const attRef = doc(collection(db, 'attendance'));
            const status = faker.helpers.weightedArrayElement([
                { weight: 85, value: 'present' },
                { weight: 8, value: 'absent' },
                { weight: 5, value: 'late' },
                { weight: 2, value: 'on-leave' }
            ]);

            batch.set(attRef, {
                id: attRef.id,
                employeeId: emp.id,
                date: dateStr,
                checkIn: status === 'present' || status === 'late' ? `${dateStr}T09:00:00.000Z` : null,
                checkOut: status === 'present' || status === 'late' ? `${dateStr}T18:00:00.000Z` : null,
                status,
                isLocked: true
            });
            operationCount++;
        }
    }

    // Salary Structures
    for (const emp of employees) {
        const salaryRef = doc(collection(db, 'salaryStructures'));
        const basic = Math.round(emp.ctc * 0.4 / 12);
        const hra = Math.round(basic * 0.5);

        batch.set(salaryRef, {
            id: salaryRef.id,
            employeeId: emp.id,
            basePay: basic,
            hra: hra,
            specialAllowances: faker.number.int({ min: 3000, max: 15000 }),
            pfDeduction: Math.round(basic * 0.12),
            taxDeduction: Math.round(basic * 0.1),
            netPay: basic + hra,
            currency: 'INR',
            effectiveDate: emp.dateOfJoining
        });
        operationCount++;
    }

    // Payroll (Last 2 months)
    for (let m = 1; m <= 2; m++) {
        const payrollDate = new Date();
        payrollDate.setMonth(payrollDate.getMonth() - m);
        const monthStr = `${payrollDate.getFullYear()}-${(payrollDate.getMonth() + 1).toString().padStart(2, '0')}`;

        for (const emp of employees) {
            const payrollRef = doc(collection(db, 'payroll'));
            const grossSalary = Math.round(emp.ctc / 12);
            const deductions = Math.round(grossSalary * 0.15);

            batch.set(payrollRef, {
                id: payrollRef.id,
                employeeId: emp.id,
                month: monthStr,
                totalDays: 30,
                payableDays: faker.number.int({ min: 26, max: 30 }),
                grossSalary,
                deductions,
                netSalary: grossSalary - deductions,
                isDisbursed: true,
                disbursedAt: new Date().toISOString(),
                generatedBy: 'system'
            });
            operationCount++;
        }
    }

    await batch.commit();
    console.log(`=== SEEDING COMPLETE: ${operationCount} documents ===`);
    return operationCount;
};
