/**
 * Pragati - Multi-Objective Railway Block Optimization Solver
 * 
 * Simulates the Python AI service (OR-Tools / MILP / Genetic Algorithm)
 * Minimizes passenger train delay penalties while maximizing track maintenance window duration
 * and bundling cross-departmental shadow blocks (Engineering + Electrical TRD + S&T).
 */

export function runAiBlockOptimization({
  corridor,
  trackLine = 'UP_MAIN',
  date = '2026-09-12',
  targetShift = 'NIGHT', // NIGHT, MORNING, AFTERNOON
  departments = ['P_WAY', 'TRD_OHE'],
  allowShadowBlocks = true,
  maxDelayToleranceMinutes = 20,
  selectedMachine = 'CSM (09-32 Tamping Machine)',
  requiredWindowHours = 3.5,
  tasks = []
}) {
  // Candidate time windows by shift
  const shiftWindows = {
    NIGHT: { startHour: 1, startMin: 45, duration: requiredWindowHours, label: '01:45 - 05:15 IST (Night Maintenance Valley)' },
    MORNING: { startHour: 10, startMin: 30, duration: requiredWindowHours, label: '10:30 - 14:00 IST (Post-Morning Peak Window)' },
    AFTERNOON: { startHour: 13, startMin: 0, duration: requiredWindowHours, label: '13:00 - 16:30 IST (Afternoon Coaching Slack)' }
  };

  const chosenSlot = shiftWindows[targetShift] || shiftWindows.NIGHT;

  // Filter eligible tasks
  const eligibleTasks = tasks.filter(t => 
    t.corridorId === corridor.id &&
    (t.track === trackLine || t.track === 'BOTH') &&
    departments.includes(t.department)
  );

  // Bundle cross-department tasks if shadow block is enabled
  const bundledTasks = eligibleTasks.slice(0, allowShadowBlocks ? 3 : 1);

  // Calculate optimization score based on constraints
  let score = 96.4;
  if (!allowShadowBlocks) score -= 8.2;
  if (targetShift !== 'NIGHT') score -= 11.5; // Daytime has more coaching trains
  if (maxDelayToleranceMinutes < 15) score -= 5.0;

  // Affected trains simulation based on track and shift
  const affectedTrains = [];

  if (targetShift === 'NIGHT') {
    affectedTrains.push({
      trainNo: "12582",
      name: "Banaras - New Delhi SF",
      category: "Superfast Mail/Express",
      direction: trackLine.includes('UP') ? 'UP' : 'DN',
      scheduledPass: "03:10 IST",
      actionRequired: "REGULATE",
      regulationStation: `${corridor.stations[2]?.name || 'Aligarh'} Loop 2`,
      delayMinutes: Math.min(14, maxDelayToleranceMinutes),
      recoveryBufferMins: 20,
      netArrivalDelayAtDelhi: 0,
      remarks: "Absorbed in terminal running slack before New Delhi."
    });

    affectedTrains.push({
      trainNo: "FR-BOXN-4012",
      name: "NTPC Dadri Coal Freight",
      category: "Heavy Freight Rake",
      direction: trackLine.includes('UP') ? 'UP' : 'DN',
      scheduledPass: "02:25 IST",
      actionRequired: "DETENTION",
      regulationStation: `${corridor.stations[3]?.name || 'Tundla'} Goods Loop`,
      delayMinutes: 38,
      recoveryBufferMins: 0,
      netArrivalDelayAtDelhi: 38,
      remarks: "Non-passenger freight; crew hours compliant under HOER regulations."
    });

    if (corridor.tracks.some(t => t.id === '3RD_LINE')) {
      affectedTrains.push({
        trainNo: "12417",
        name: "Prayagraj Express",
        category: "VIP Superfast",
        direction: trackLine.includes('UP') ? 'UP' : 'DN',
        scheduledPass: "04:15 IST",
        actionRequired: "DIVERSION_TO_3RD_LINE",
        regulationStation: `${corridor.stations[1]?.name || 'Ghaziabad'} 3rd Line`,
        delayMinutes: 0,
        recoveryBufferMins: 15,
        netArrivalDelayAtDelhi: 0,
        remarks: "Smooth transition to bi-directional 3rd line. 0 mins passenger delay."
      });
    }
  } else {
    // Daytime affected trains
    affectedTrains.push({
      trainNo: "22436",
      name: "Vande Bharat Express",
      category: "Vande Bharat VIP",
      direction: trackLine.includes('UP') ? 'UP' : 'DN',
      scheduledPass: "11:20 IST",
      actionRequired: "PRIORITY_PASS_FIRST",
      regulationStation: "Main Line Clearance",
      delayMinutes: 0,
      recoveryBufferMins: 10,
      netArrivalDelayAtDelhi: 0,
      remarks: "Block paused 12 mins prior to allow VIP Vande Bharat to pass without deceleration."
    });

    affectedTrains.push({
      trainNo: "12004",
      name: "Lucknow Shatabdi Express",
      category: "Shatabdi Express",
      direction: trackLine.includes('UP') ? 'UP' : 'DN',
      scheduledPass: "12:15 IST",
      actionRequired: "REGULATE",
      regulationStation: `${corridor.stations[2]?.name || 'Aligarh'} Loop 1`,
      delayMinutes: Math.min(18, maxDelayToleranceMinutes),
      recoveryBufferMins: 12,
      netArrivalDelayAtDelhi: 6,
      remarks: "Regulated at loop line; speed raised to 130 km/h post block."
    });
  }

  const startHStr = String(chosenSlot.startHour).padStart(2, '0');
  const startMStr = String(chosenSlot.startMin).padStart(2, '0');
  const endHour = (chosenSlot.startHour + Math.floor(requiredWindowHours)) % 24;
  const endMin = (chosenSlot.startMin + Math.round((requiredWindowHours % 1) * 60)) % 60;
  const endHStr = String(endHour).padStart(2, '0');
  const endMStr = String(endMin).padStart(2, '0');

  const formattedWindowStart = `${startHStr}:${startMStr} IST`;
  const formattedWindowEnd = `${endHStr}:${endMStr} IST`;

  const totalAvoidedDelay = Math.round(140 + Math.random() * 40);

  const reasons = [
    {
      title: "Traffic Headway Optimization",
      description: `Selected window (${formattedWindowStart} - ${formattedWindowEnd}) matches the absolute lowest traffic density slot for ${corridor.name}, avoiding morning and evening peak passenger corridors.`,
      badge: "HEADWAY_SLACK",
      confidence: 97
    },
    allowShadowBlocks ? {
      title: "Shadow Block Synergies",
      description: `Bundled ${bundledTasks.length} cross-departmental operations (Engineering + Electrical TRD) within a single traffic block, preventing ${departments.length > 1 ? 'separate daytime line disconnections' : 'subsequent line possessions'}.`,
      badge: "SHADOW_BUNDLING",
      confidence: 95
    } : {
      title: "Isolated Department Window",
      description: "Dedicated single-department block without shadow bundling as requested by controller parameters.",
      badge: "ISOLATED_BLOCK",
      confidence: 89
    },
    {
      title: "Punctuality & Slack Absorption",
      description: `Assigned regulations to stations with loop line capacity (${corridor.stations.slice(1, 4).map(s => s.code).join(', ')}), ensuring 0 terminal delay for critical passenger trains.`,
      badge: "SLACK_RECOVERY",
      confidence: 93
    },
    {
      title: "Track Machine Staging Match",
      description: `Assigned ${selectedMachine} with minimized dead running transit time along ${trackLine}.`,
      badge: "MACHINE_LOGISTICS",
      confidence: 96
    }
  ];

  return {
    planId: `BLK-AI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    corridorId: corridor.id,
    corridorName: corridor.name,
    trackLine: trackLine,
    trackName: corridor.tracks.find(t => t.id === trackLine)?.name || trackLine,
    section: `${corridor.stations[1]?.name || 'Mid'} - ${corridor.stations[3]?.name || 'End'} (${corridor.code})`,
    scheduledDate: date,
    windowStart: formattedWindowStart,
    windowEnd: formattedWindowEnd,
    durationHours: requiredWindowHours,
    blockType: allowShadowBlocks ? "INTEGRATED_SHADOW_BLOCK" : "TRAFFIC_BLOCK_ONLY",
    blockTypeName: allowShadowBlocks ? "Integrated Traffic & Power Block (Shadow)" : "Isolated Traffic Block",
    optimizationScore: Math.min(99.4, Math.max(78.5, parseFloat(score.toFixed(1)))),
    metrics: {
      delayMinutesAvoided: totalAvoidedDelay,
      punctualityImpactPercent: -0.6,
      machineUtilizationPercent: 93.8,
      conflictsResolved: affectedTrains.length,
      coachingPunctualityMaintained: 99.4
    },
    aiReasons: reasons,
    assignedTasks: bundledTasks.map(t => ({
      taskId: t.id,
      title: t.title,
      dept: t.department,
      machine: t.machineRequired,
      crew: t.crewSize,
      allocatedWindow: `${formattedWindowStart} - ${formattedWindowEnd} (${requiredWindowHours}h)`
    })),
    affectedTrains: affectedTrains,
    status: "PROPOSED",
    approvedBy: null,
    generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
  };
}
