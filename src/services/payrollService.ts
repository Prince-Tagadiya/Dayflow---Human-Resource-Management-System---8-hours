import { EmployeeSalaryDetails } from '../types';

export const PayrollService = {
  calculateSalaryBreakdown: (wage: number): EmployeeSalaryDetails => {
    // Basic = 50% of Wage
    const basic = wage * 0.50;

    // HRA = 50% of Basic
    const hra = basic * 0.50;

    // Standard Allowance = Fixed 4167
    const standardAllowance = 4167;

    // Performance Bonus = 8.33% of Basic (Standard assumption, or stated "8.33% field")
    // Assuming calculation based on Basic as is common for statutory bonuses in India
    const performanceBonus = parseFloat((basic * 0.0833).toFixed(2));

    // Leave Travel Allowance = 8.333% of Basic
    const lta = parseFloat((basic * 0.08333).toFixed(2));

    const totalFixedComponents = basic + hra + standardAllowance + performanceBonus + lta;
    
    // Fixed Allowance = Balancing Figure (Wage - All other earnings)
    // If Total Fixed > Wage, Fixed Allowance is 0 (or negative? logic check needed)
    // Usually Wage is CTC, so components sum to Wage.
    let fixedAllowance = wage - totalFixedComponents;
    if (fixedAllowance < 0) fixedAllowance = 0; // Should handle this case better in UI (error)

    // Deductions
    // PF = 12% of Basic
    const pf = parseFloat((basic * 0.12).toFixed(2));

    // Professional Tax = Fixed 200
    const pt = 200;

    const totalDeductions = pf + pt;
    const netSalary = wage - totalDeductions;

    return {
      employeeId: '', // To be filled by consuming component
      ctc: wage,
      basic,
      hra,
      standardAllowance,
      performanceBonus,
      lta,
      fixedAllowance: parseFloat(fixedAllowance.toFixed(2)),
      pf,
      pt,
      netSalary: parseFloat(netSalary.toFixed(2))
    };
  }
};
