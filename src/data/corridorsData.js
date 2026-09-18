export const corridors = [
  {
    id: "COR-NDLS-CNB",
    name: "Delhi - Kanpur Corridor (HDN-1)",
    code: "NDLS-CNB",
    zone: "NCR / NR",
    division: "Prayagraj & Delhi",
    lengthKm: 440,
    tracks: [
      { id: "UP_MAIN", name: "UP Main Line (To Delhi)", direction: "UP", status: "OPERATIONAL" },
      { id: "DN_MAIN", name: "DOWN Main Line (To Kanpur)", direction: "DN", status: "RESTRICTED" },
      { id: "3RD_LINE", name: "3rd Line / Freight Loop (GZB-ALJN)", direction: "BIDIRECTIONAL", status: "OPERATIONAL" }
    ],
    stations: [
      { code: "NDLS", name: "New Delhi", km: 0, hasLoops: true, maxSpeed: 110 },
      { code: "GZB", name: "Ghaziabad Jn", km: 26, hasLoops: true, maxSpeed: 130 },
      { code: "ALJN", name: "Aligarh Jn", km: 131, hasLoops: true, maxSpeed: 130 },
      { code: "TDL", name: "Tundla Jn", km: 204, hasLoops: true, maxSpeed: 130 },
      { code: "ETW", name: "Etawah Jn", km: 296, hasLoops: true, maxSpeed: 130 },
      { code: "CNB", name: "Kanpur Central", km: 440, hasLoops: true, maxSpeed: 110 }
    ],
    capacityUtilization: 138, // Percent (Over-saturated HDN route)
    dailyTrains: 214,
    coachingRatio: 62,
    freightRatio: 38,
    signaling: "Automatic Block Signalling (ABS)",
    traction: "25 kV AC Electric OHE",
    speedLimit: 130
  },
  {
    id: "COR-HWH-DDU",
    name: "Howrah - Pt. Deen Dayal Upadhyaya (Grand Chord)",
    code: "HWH-DDU",
    zone: "ECR / ER",
    division: "Danapur & Dhanbad",
    lengthKm: 660,
    tracks: [
      { id: "UP_MAIN", name: "UP Main Line (To DDU/Delhi)", direction: "UP", status: "OPERATIONAL" },
      { id: "DN_MAIN", name: "DOWN Main Line (To Howrah)", direction: "DN", status: "OPERATIONAL" },
      { id: "DED_FREIGHT", name: "Eastern DFC Parallel Section", direction: "BIDIRECTIONAL", status: "OPERATIONAL" }
    ],
    stations: [
      { code: "HWH", name: "Howrah", km: 0, hasLoops: true, maxSpeed: 100 },
      { code: "BWN", name: "Barddhaman Jn", km: 95, hasLoops: true, maxSpeed: 130 },
      { code: "ASN", name: "Asansol Jn", km: 200, hasLoops: true, maxSpeed: 130 },
      { code: "DHN", name: "Dhanbad Jn", km: 259, hasLoops: true, maxSpeed: 120 },
      { code: "GAYA", name: "Gaya Jn", km: 458, hasLoops: true, maxSpeed: 130 },
      { code: "DDU", name: "Pt. DD Upadhyaya Jn", km: 660, hasLoops: true, maxSpeed: 110 }
    ],
    capacityUtilization: 145,
    dailyTrains: 248,
    coachingRatio: 45,
    freightRatio: 55,
    signaling: "Automatic Block Signalling (ABS)",
    traction: "2x25 kV AC High Rise OHE",
    speedLimit: 130
  },
  {
    id: "COR-BCT-ADI",
    name: "Mumbai Central - Ahmedabad Corridor",
    code: "BCT-ADI",
    zone: "WR",
    division: "Mumbai & Vadodara",
    lengthKm: 492,
    tracks: [
      { id: "UP_MAIN", name: "UP Line (To Mumbai)", direction: "UP", status: "OPERATIONAL" },
      { id: "DN_MAIN", name: "DOWN Line (To Ahmedabad)", direction: "DN", status: "OPERATIONAL" }
    ],
    stations: [
      { code: "MMCT", name: "Mumbai Central", km: 0, hasLoops: true, maxSpeed: 100 },
      { code: "BVI", name: "Borivali", km: 30, hasLoops: true, maxSpeed: 110 },
      { code: "ST", name: "Surat", km: 263, hasLoops: true, maxSpeed: 130 },
      { code: "BRC", name: "Vadodara Jn", km: 392, hasLoops: true, maxSpeed: 130 },
      { code: "ADI", name: "Ahmedabad Jn", km: 492, hasLoops: true, maxSpeed: 110 }
    ],
    capacityUtilization: 122,
    dailyTrains: 190,
    coachingRatio: 70,
    freightRatio: 30,
    signaling: "Continuous Automatic Train Control (KAVACH Deployed)",
    traction: "25 kV AC Electric",
    speedLimit: 160
  }
];
