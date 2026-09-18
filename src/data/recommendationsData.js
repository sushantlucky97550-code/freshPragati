export const aiRecommendations = [
  {
    id: "REC-2024-101",
    type: "SHADOW_BLOCK_OPPORTUNITY",
    badge: "High Value Opportunity",
    severity: "RECOMMENDED",
    title: "Combine OHE Tower Wagon with Track Tamping at Tundla",
    corridorId: "COR-NDLS-CNB",
    section: "ALJN - TDL (Km 162 - 168, UP Line)",
    estimatedSavings: "2.5 Block Hours & 110 Train Delay Mins Saved",
    description: "SSE/TRD and SSE/P-Way have submitted separate block requests for the same physical track segment within 36 hours. Pragati recommends bundling into a single 3.5 hour Integrated Traffic & Power block.",
    metrics: {
      blockHoursSaved: 2.5,
      delayMinutesSaved: 110,
      carbonOffsetKg: 420
    },
    actionText: "Auto-Bundle Requisitions",
    actionPayload: {
      taskIds: ["TSK-NCR-2024-891", "TSK-NCR-2024-892"],
      date: "2026-09-11",
      targetSlot: "01:45 - 05:15"
    }
  },
  {
    id: "REC-2024-102",
    type: "CRITICAL_DEFECT_WINDOW",
    badge: "Safety Alert",
    severity: "CRITICAL",
    title: "USFD Ultrasonic Flaw Detected at Km 138/18 (UP Main)",
    corridorId: "COR-NDLS-CNB",
    section: "Aligarh - Daudkhan (Km 138/18)",
    estimatedSavings: "Derailment Risk Mitigation / Avoid Unscheduled Punctuality Collapse",
    description: "Defect classified as IMR (Immediate Rail Replacement). If not addressed within 48 hours, mandatory 20 km/h caution order will impose 18 min cumulative delay per passing train.",
    metrics: {
      riskLevel: "Critical IMR Flaw",
      recommendedWindow: "01:30 - 03:00 (1.5 hrs)",
      affectedDailyTrains: 42
    },
    actionText: "Schedule Emergency Block",
    actionPayload: {
      taskId: "TSK-NCR-2024-895",
      date: "2026-09-10",
      targetSlot: "01:30 - 03:00"
    }
  },
  {
    id: "REC-2024-103",
    type: "MACHINE_LOGISTICS_STAGING",
    badge: "Logistics Optimization",
    severity: "INFO",
    title: "Pre-position BCM 420 from Kanpur Yard to Etawah Siding",
    corridorId: "COR-NDLS-CNB",
    section: "CNB -> ETW Goods Loop",
    estimatedSavings: "85 Mins Machine Ferry Time Avoided",
    description: "Ballast Cleaning Machine (BCM-420) can be ferried during the low-density 13:00 - 14:30 freight path tomorrow, eliminating dead travel under peak evening traffic.",
    metrics: {
      travelTimeMins: 75,
      pathAvailability: "Clear Signal Priority 3",
      fuelEfficiency: "+12%"
    },
    actionText: "Issue Pilot Machine Movement Order",
    actionPayload: {
      machineId: "BCM-420",
      from: "CNB",
      to: "ETW"
    }
  },
  {
    id: "REC-2024-104",
    type: "SPEED_RESTORATION",
    badge: "Capacity Boost",
    severity: "SUCCESS",
    title: "Lift TSR 45 km/h Restriction at Sasni Crossover",
    corridorId: "COR-NDLS-CNB",
    section: "Sasni (Km 152/12)",
    estimatedSavings: "Recover 4.5 Mins per Superfast Train",
    description: "Post-tamping stabilization criteria and dynamic track settlement (100,000 GMT load passage) have passed ultrasonic & accelerometer inspection tests.",
    metrics: {
      speedGain: "45 km/h -> 130 km/h",
      dailyTrainsBenefitted: 64,
      punctualityGain: "+1.4%"
    },
    actionText: "Cancel Caution Order (TSR)",
    actionPayload: {
      location: "Sasni Km 152/12",
      newSpeed: 130
    }
  }
];
