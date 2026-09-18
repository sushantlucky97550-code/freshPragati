export const railwayAssets = [
  {
    id: "AST-TRK-01",
    name: "UP Main Track Section Km 160 - 175",
    type: "TRACK_KM",
    category: "Permanent Way",
    corridorId: "COR-NDLS-CNB",
    corridorName: "Delhi - Kanpur (NCR)",
    section: "Aligarh - Mandrak - Sasni",
    railProfile: "60 kg/m (90 UTS)",
    sleeperType: "PSC (Pre-stressed Concrete 1660/km)",
    gmtCarried: 42.8, // Gross Million Tonnes
    healthScore: 78,
    status: "FAIR",
    lastMaintenance: "2026-06-15",
    nextInspectionDue: "2026-09-15",
    lastUsfdDate: "2026-08-20",
    defectsCount: 3,
    activeTsr: "None",
    telemetry: {
      trackGeometryIndex: 71.4,
      twistMm: 2.1,
      gaugeDeviationMm: "+1.8",
      verticalUnevenness: "Low"
    }
  },
  {
    id: "AST-TRK-02",
    name: "DN Main Track Section Km 335 - 350",
    type: "TRACK_KM",
    category: "Permanent Way",
    corridorId: "COR-NDLS-CNB",
    corridorName: "Delhi - Kanpur (NCR)",
    section: "Etawah - Bharthana",
    railProfile: "60 kg/m (90 UTS)",
    sleeperType: "PSC (1660/km)",
    gmtCarried: 54.2,
    healthScore: 64,
    status: "CRITICAL",
    lastMaintenance: "2026-03-10",
    nextInspectionDue: "2026-09-12",
    lastUsfdDate: "2026-09-02",
    defectsCount: 7,
    activeTsr: "TSR 45 km/h at Km 341/14",
    telemetry: {
      trackGeometryIndex: 62.8,
      twistMm: 3.4,
      gaugeDeviationMm: "+3.2",
      verticalUnevenness: "Elevated"
    }
  },
  {
    id: "AST-BRG-12",
    name: "Major Yamuna Bridge No. 24 (Tundla - Agra Cord)",
    type: "BRIDGE",
    category: "Structures & Civil",
    corridorId: "COR-NDLS-CNB",
    corridorName: "Delhi - Kanpur (NCR)",
    section: "Km 201/10 (14 Girders)",
    railProfile: "60 kg/m Welded",
    sleeperType: "Steel Channel Sleepers",
    gmtCarried: 38.0,
    healthScore: 92,
    status: "EXCELLENT",
    lastMaintenance: "2026-07-22",
    nextInspectionDue: "2026-10-30",
    lastUsfdDate: "2026-07-20",
    defectsCount: 0,
    activeTsr: "None",
    telemetry: {
      bearingDisplacementMm: 0.4,
      scourLevelBelowDanger: "3.8 meters safe",
      vibrationIndex: "Normal"
    }
  },
  {
    id: "AST-PNT-102",
    name: "High Speed Turnout Point 102B (Ghaziabad Yard)",
    type: "TURNOUT",
    category: "Signalling & P-Way",
    corridorId: "COR-NDLS-CNB",
    corridorName: "Delhi - Kanpur (NCR)",
    section: "Ghaziabad East Crossover",
    railProfile: "1 in 12 Thick Web Switch (60 kg)",
    sleeperType: "Special Turnout PSC Sleepers",
    gmtCarried: 61.5,
    healthScore: 69,
    status: "ATTENTION_REQUIRED",
    lastMaintenance: "2026-08-01",
    nextInspectionDue: "2026-09-11",
    lastUsfdDate: "2026-08-14",
    defectsCount: 2,
    activeTsr: "TSR 30 km/h (Crossover)",
    telemetry: {
      throwOperatingTimeSec: 4.8, // Threshold 5.0
      operatingCurrentAmps: 3.2,
      tongueRailOpeningMm: 114
    }
  },
  {
    id: "AST-TSS-05",
    name: "25 kV Traction Substation (Tundla TSS)",
    type: "TRACTION_SUBSTATION",
    category: "Electrical (TRD)",
    corridorId: "COR-NDLS-CNB",
    corridorName: "Delhi - Kanpur (NCR)",
    section: "Km 205/18 (Feeding TDL - ETW)",
    railProfile: "N/A",
    sleeperType: "N/A",
    gmtCarried: 0,
    healthScore: 88,
    status: "GOOD",
    lastMaintenance: "2026-08-25",
    nextInspectionDue: "2026-11-25",
    lastUsfdDate: "N/A",
    defectsCount: 0,
    activeTsr: "None",
    telemetry: {
      transformerTempC: 44.5,
      sf6GasPressureBar: 5.8,
      feederCurrentAmps: 420,
      voltageKv: 26.4
    }
  },
  {
    id: "AST-SIG-88",
    name: "Electronic Interlocking (Surat Route Relay Interlocking)",
    type: "INTERLOCKING_SYSTEM",
    category: "Signalling & Telecom",
    corridorId: "COR-BCT-ADI",
    corridorName: "Mumbai - Ahmedabad (WR)",
    section: "Surat Central Station",
    railProfile: "N/A",
    sleeperType: "N/A",
    gmtCarried: 0,
    healthScore: 95,
    status: "EXCELLENT",
    lastMaintenance: "2026-08-10",
    nextInspectionDue: "2026-10-10",
    lastUsfdDate: "N/A",
    defectsCount: 0,
    activeTsr: "None",
    telemetry: {
      vitalProcessorRedundancy: "Dual Active/Standby 100%",
      axleCounterResetEvents: 0,
      busVoltageDc: 24.2
    }
  }
];
