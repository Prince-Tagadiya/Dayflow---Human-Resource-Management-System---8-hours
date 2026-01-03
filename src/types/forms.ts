import { z } from 'zod';

export const loginSchema = z.object({
  loginId: z.string().min(1, 'Login ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createEmployeeSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'), // Role/Designation matches prompt
  yearOfJoining: z.number().int().min(2000).max(new Date().getFullYear()),
  companyCode: z.string().default('OD'), // Hardcoded for this company "Odoo India" -> OD? User said "OI" in example "OIJODO...", wait "OI" -> Odoo India. I'll use "OD" or "OI" as config. Prompt says "OIJODO... OI -> Company Name". I will use 'OI'.
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
