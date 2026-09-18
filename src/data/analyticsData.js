export const blockHoursTrend = [
  { month: "Apr", planned: 142, granted: 118, aiOptimizedGranted: 135 },
  { month: "May", planned: 158, granted: 124, aiOptimizedGranted: 150 },
  { month: "Jun", planned: 130, granted: 102, aiOptimizedGranted: 126 },
  { month: "Jul", planned: 175, granted: 138, aiOptimizedGranted: 168 },
  { month: "Aug", planned: 190, granted: 152, aiOptimizedGranted: 184 },
  { month: "Sep (MTD)", planned: 160, granted: 145, aiOptimizedGranted: 156 }
];

export const punctualityDelaySavings = [
  { month: "Apr", manualDelayMins: 4850, aiAssistedDelayMins: 2900, savedMins: 1950 },
  { month: "May", manualDelayMins: 5200, aiAssistedDelayMins: 3100, savedMins: 2100 },
  { month: "Jun", manualDelayMins: 4600, aiAssistedDelayMins: 2650, savedMins: 1950 },
  { month: "Jul", manualDelayMins: 5900, aiAssistedDelayMins: 3400, savedMins: 2500 },
  { month: "Aug", manualDelayMins: 6300, aiAssistedDelayMins: 3550, savedMins: 2750 },
  { month: "Sep", manualDelayMins: 5400, aiAssistedDelayMins: 2800, savedMins: 2600 }
];

export const machineUtilization = [
  { machine: "CSM Tamping (09-32)", activeHours: 184, idleHours: 32, maintenanceHours: 24, targetPct: 85 },
  { machine: "BCM Ballast Cleaner", activeHours: 142, idleHours: 58, maintenanceHours: 40, targetPct: 75 },
  { machine: "UNIMAT Point Tamping", activeHours: 120, idleHours: 48, maintenanceHours: 20, targetPct: 80 },
  { machine: "OHE Tower Wagon", activeHours: 210, idleHours: 25, maintenanceHours: 15, targetPct: 90 },
  { machine: "DTS Stabilizer", activeHours: 165, idleHours: 35, maintenanceHours: 20, targetPct: 85 }
];

// Note: departmentWorkload mock data was removed; real data is served live via GET /api/departments

export const corridorPerformanceSummary = [
  {
    corridor: "Delhi - Kanpur (HDN-1)",
    punctuality: "94.2%",
    blockFulfillment: "91.8%",
    shadowBlockRatio: "42%",
    conflictResolutionRate: "98.4%",
    status: "OPTIMAL"
  },
  {
    corridor: "Howrah - DDU (Grand Chord)",
    punctuality: "89.6%",
    blockFulfillment: "86.4%",
    shadowBlockRatio: "35%",
    conflictResolutionRate: "95.1%",
    status: "CONGESTED"
  },
  {
    corridor: "Mumbai - Ahmedabad",
    punctuality: "96.4%",
    blockFulfillment: "94.0%",
    shadowBlockRatio: "48%",
    conflictResolutionRate: "99.1%",
    status: "EXCELLENT"
  }
];
