export const mockGeneratedBlockPlans = [
  {
    planId: "BLK-AI-2026-9041",
    corridorId: "COR-NDLS-CNB",
    corridorName: "Delhi - Kanpur Corridor (HDN-1)",
    trackLine: "UP_MAIN",
    trackName: "UP Main Line (To Delhi)",
    section: "Aligarh (ALJN) - Tundla (TDL) [Km 162/10 - 168/20]",
    scheduledDate: "2026-09-11",
    windowStart: "01:45 IST",
    windowEnd: "05:15 IST",
    durationHours: 3.5,
    blockType: "INTEGRATED_SHADOW_BLOCK", // Traffic + Power + S&T
    blockTypeName: "Integrated Traffic & Power Block",
    optimizationScore: 95.8,
    metrics: {
      delayMinutesAvoided: 164,
      punctualityImpactPercent: -0.8,
      machineUtilizationPercent: 94.2,
      conflictsResolved: 4,
      coachingPunctualityMaintained: 99.2
    },
    aiReasons: [
      {
        title: "Optimal Nocturnal Traffic Valley",
        description: "Between 01:45 and 05:15 IST, passenger coaching density drops by 76% compared to morning peak. Only 2 mail/express trains traverse this block compared to 14 trains in afternoon.",
        badge: "TIMETABLE_FIT",
        confidence: 98
      },
      {
        title: "Shadow Block Consolidation",
        description: "Bundled OHE Contact Wire inspection (Task #892) inside the P-Way Tamping window (Task #891), saving an additional 2.5 hour isolated power block on 12-Sep.",
        badge: "MULTI_DEPT_BUNDLING",
        confidence: 96
      },
      {
        title: "Loop Capacity Utilization for Freight",
        description: "Freight Rake FR-BOXN-4012 safely regulated at Tundla Yard Loop 4 without encroaching on UP line clearance or breaching Section 25 loco crew rest rules.",
        badge: "SLACK_EXPLOITATION",
        confidence: 94
      },
      {
        title: "Track Machine Logistics Efficiency",
        description: "CSM-932 tamping machine is pre-stabled at Tundla Machine Siding (Km 204), requiring only 22 minutes transit time to work site, avoiding line clearance delays.",
        badge: "ASSET_OPTIMIZED",
        confidence: 99
      }
    ],
    assignedTasks: [
      {
        taskId: "TSK-NCR-2024-891",
        title: "Continuous Track Tamping (CSM-932)",
        dept: "P_WAY",
        machine: "CSM-932 Tamping Machine + DTS",
        crew: 14,
        allocatedWindow: "01:45 - 05:15 (3.5 hrs)"
      },
      {
        taskId: "TSK-NCR-2024-892",
        title: "OHE Contact Wire Stagger & Dropper Check",
        dept: "TRD_OHE",
        machine: "4-Wheeler OHE Tower Wagon",
        crew: 8,
        allocatedWindow: "02:00 - 04:30 (2.5 hrs)"
      },
      {
        taskId: "TSK-NCR-2024-893",
        title: "Axle Counter Track Lead Alignment",
        dept: "S_AND_T",
        machine: "S&T Tool Van",
        crew: 4,
        allocatedWindow: "02:15 - 03:45 (1.5 hrs)"
      }
    ],
    affectedTrains: [
      {
        trainNo: "12582",
        name: "Banaras - New Delhi SF",
        category: "Superfast Mail/Express",
        direction: "UP",
        scheduledPass: "03:10 IST",
        actionRequired: "REGULATE",
        regulationStation: "Hathras Jn (Loop Line 2)",
        delayMinutes: 18,
        recoveryBufferMins: 22,
        netArrivalDelayAtDelhi: 0,
        remarks: "Delay easily recovered in 22 min slack buffer between Ghaziabad and New Delhi."
      },
      {
        trainNo: "FR-BOXN-4012",
        name: "NTPC Dadri Coal Freight",
        category: "Heavy Freight Rake",
        direction: "UP",
        scheduledPass: "02:30 IST",
        actionRequired: "DETENTION",
        regulationStation: "Tundla Yard (Goods Loop 4)",
        delayMinutes: 45,
        recoveryBufferMins: 0,
        netArrivalDelayAtDelhi: 45,
        remarks: "Non-critical commodity freight; coal stock at Dadri Thermal Plant currently at 14 days safe reserve."
      },
      {
        trainNo: "12417",
        name: "Prayagraj Express",
        category: "VIP Superfast",
        direction: "UP",
        scheduledPass: "04:15 IST",
        actionRequired: "DIVERSION_TO_3RD_LINE",
        regulationStation: "Daudkhan - Aligarh 3rd Line",
        delayMinutes: 0,
        recoveryBufferMins: 15,
        netArrivalDelayAtDelhi: 0,
        remarks: "Routed through 3rd bi-directional line with clear signal clearance. Zero passenger impact."
      }
    ],
    status: "PROPOSED",
    approvedBy: null,
    generatedAt: "2026-09-09 23:58"
  }
];
