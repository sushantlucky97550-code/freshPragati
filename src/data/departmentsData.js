/**
 * Pragati - Railway Department Reference Data
 * Used as reliable fallback and initial seed for P-Way, TRD, S&T, and Mechanical departments.
 */

export const mockDepartments = [
  {
    id: 1,
    name: "Permanent Way (Engineering)",
    code: "PWAY",
    description: "Track geometry, rail renewals, sleeper tamping, USFD defect elimination, deep screening",
    status: "ACTIVE",
    taskCount: 4,
    color: "#0284C7",
    officerRole: "SSE_PWAY"
  },
  {
    id: 2,
    name: "Traction Distribution (TRD / OHE)",
    code: "TRD",
    description: "25kV AC overhead equipment, contact wire stagger, dropper replacement, power blocks",
    status: "ACTIVE",
    taskCount: 2,
    color: "#8B5CF6",
    officerRole: "SSE_TRD"
  },
  {
    id: 3,
    name: "Signal & Telecommunication (S&T)",
    code: "ST",
    description: "Electronic Interlocking, point machines, digital axle counters, track vacancy, KAVACH",
    status: "ACTIVE",
    taskCount: 3,
    color: "#F59E0B",
    officerRole: "SSE_SIG"
  },
  {
    id: 4,
    name: "Mechanical (C&W / Rolling Stock)",
    code: "MECH",
    description: "Wagon examination, rolling in-out inspections, hot axle detector diagnostics",
    status: "ACTIVE",
    taskCount: 1,
    color: "#10B981",
    officerRole: "ENGINEERING_OFFICER"
  }
];

export const mockMaintenanceWorkload = {
  totalTasks: 10,
  totalEstimatedHours: 24.5,
  departments: [
    {
      id: 1,
      name: "Permanent Way (P-Way)",
      code: "PWAY",
      taskCount: 4,
      estimatedHours: 11.5,
      criticalCount: 2,
      color: "#0284C7"
    },
    {
      id: 2,
      name: "Traction Distribution (TRD)",
      code: "TRD",
      taskCount: 2,
      estimatedHours: 5.0,
      criticalCount: 1,
      color: "#8B5CF6"
    },
    {
      id: 3,
      name: "Signal & Telecom (S&T)",
      code: "ST",
      taskCount: 3,
      estimatedHours: 6.0,
      criticalCount: 2,
      color: "#F59E0B"
    },
    {
      id: 4,
      name: "Mechanical (MECH)",
      code: "MECH",
      taskCount: 1,
      estimatedHours: 2.0,
      criticalCount: 0,
      color: "#10B981"
    }
  ]
};
