package com.railopt.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.railopt.entity.*;
import com.railopt.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Database seeder — inserts realistic Indian Railway multi-zone DEMO/MOCK data on startup.
 * Seeds:
 * 1. Zonal Railways Master (WCR, NR, WR, NCR, CR)
 * 2. Authorized Officers for WCR (Bhopal) and NR (Delhi)
 * 3. WCR Bhopal Corridors (BPL-ITR, BPL-SEH) and Assets
 * 4. Multi-Department Maintenance Tasks with spatial overlap for Bundling demonstrations
 * 5. ML Learning Pipeline baseline records
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final DepartmentRepository departmentRepository;
    private final MaintenanceTaskRepository taskRepository;
    private final CorridorRepository corridorRepository;
    private final TrainRepository trainRepository;
    private final RailwayAssetRepository assetRepository;
    private final BlockRequestRepository blockRequestRepository;
    private final AiBlockPlanRepository aiBlockPlanRepository;
    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;
    private final MlTrainingRecordRepository mlTrainingRecordRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedZonesIfEmpty();
        seedOfficersIfEmpty();
        seedDepartmentsIfEmpty();
        seedWcrDataIfEmpty();
        seedMlBaselineIfEmpty();

        log.info("[DataSeeder] All Indian Railways multi-zone data verified and ready.");
    }

    private void seedZonesIfEmpty() {
        if (zoneRepository.count() > 0) {
            log.info("[DataSeeder] Zones already configured in MongoDB ({} zones).", zoneRepository.count());
            return;
        }

        log.info("[DataSeeder] Seeding Indian Railways Zone Master data...");

        List<Zone> zones = List.of(
                Zone.builder()
                        .id("zone-wcr")
                        .code("WCR")
                        .name("West Central Railway")
                        .hq("Jabalpur")
                        .primary(true)
                        .divisions(List.of("Bhopal", "Jabalpur", "Kota"))
                        .electrified("3000+ Route Km")
                        .kavach("400+ Km")
                        .status("OPERATIONAL")
                        .zoneColor("from-blue-600 to-indigo-900")
                        .borderGlow("border-blue-500/60 shadow-blue-900/30")
                        .build(),

                Zone.builder()
                        .id("zone-nr")
                        .code("NR")
                        .name("Northern Railway")
                        .hq("New Delhi")
                        .primary(false)
                        .divisions(List.of("Delhi", "Ambala", "Firozpur", "Lucknow", "Moradabad"))
                        .electrified("3800+ Route Km")
                        .kavach("400+ Km")
                        .status("OPERATIONAL")
                        .zoneColor("from-slate-700 to-slate-900")
                        .borderGlow("border-slate-700/60")
                        .build(),

                Zone.builder()
                        .id("zone-ncr")
                        .code("NCR")
                        .name("North Central Railway")
                        .hq("Prayagraj")
                        .primary(false)
                        .divisions(List.of("Prayagraj", "Agra", "Jhansi"))
                        .electrified("3000+ Route Km")
                        .kavach("400+ Km")
                        .status("OPERATIONAL")
                        .zoneColor("from-slate-700 to-slate-900")
                        .borderGlow("border-slate-700/60")
                        .build(),

                Zone.builder()
                        .id("zone-wr")
                        .code("WR")
                        .name("Western Railway")
                        .hq("Mumbai (Churchgate)")
                        .primary(false)
                        .divisions(List.of("Mumbai Central", "Vadodara", "Ratlam", "Ahmedabad"))
                        .electrified("3800+ Route Km")
                        .kavach("400+ Km")
                        .status("OPERATIONAL")
                        .zoneColor("from-slate-700 to-slate-900")
                        .borderGlow("border-slate-700/60")
                        .build(),

                Zone.builder()
                        .id("zone-cr")
                        .code("CR")
                        .name("Central Railway")
                        .hq("Mumbai (CSMT)")
                        .primary(false)
                        .divisions(List.of("Mumbai CSMT", "Bhusawal", "Nagpur", "Pune"))
                        .electrified("3900+ Route Km")
                        .kavach("350+ Km")
                        .status("OPERATIONAL")
                        .zoneColor("from-slate-700 to-slate-900")
                        .borderGlow("border-slate-700/60")
                        .build()
        );

        zoneRepository.saveAll(zones);
        log.info("[DataSeeder] Seeded {} Indian Railways zones.", zones.size());
    }

    private void seedDepartmentsIfEmpty() {
        if (departmentRepository.count() > 0) return;

        departmentRepository.saveAll(List.of(
                Department.builder().name("Permanent Way").code("PWAY").description("Track maintenance, inspection, and renewals.").status(DepartmentStatus.ACTIVE).build(),
                Department.builder().name("Signal & Telecommunication").code("ST").description("Signalling systems, interlocking, ATP/Kavach.").status(DepartmentStatus.ACTIVE).build(),
                Department.builder().name("Traction & Rolling Distribution").code("TRD").description("Overhead Equipment (OHE), traction power.").status(DepartmentStatus.ACTIVE).build(),
                Department.builder().name("Mechanical").code("MECH").description("Rolling stock and mechanical assets.").status(DepartmentStatus.ACTIVE).build()
        ));
        log.info("[DataSeeder] Seeded 4 standard railway departments.");
    }

    private void seedOfficersIfEmpty() {
        log.info("[DataSeeder] Ensuring authorized officer accounts are seeded with zone scopes...");

        List<User> officers = List.of(
                // ─── 1. WCR DOM (Divisional Operations Manager) — Key Role for Selection & Authorization ───
                User.builder()
                        .officerId("OFF-WCR-DOM-01")
                        .name("Shri Sanjay Srivastava")
                        .department("OPERATIONS")
                        .role("DOM")
                        .title("Divisional Operations Manager (DOM)")
                        .zone("WCR")
                        .division("Bhopal")
                        .authorizedDivisions(List.of("Bhopal", "Jabalpur"))
                        .permissions(List.of("READ", "WRITE", "APPROVE", "DOM_AUTHORIZE", "BLOCK_MANAGEMENT"))
                        .passwordHash(passwordEncoder.encode("RailOpt@Ops2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                // ─── 2. WCR DRM (Divisional Railway Manager) ───
                User.builder()
                        .officerId("OFF-WCR-DRM-01")
                        .name("Shri Devendra Kumar")
                        .department("OPERATIONS")
                        .role("DRM")
                        .title("Divisional Railway Manager (DRM)")
                        .zone("WCR")
                        .division("Bhopal")
                        .authorizedDivisions(List.of("Bhopal", "Jabalpur", "Kota"))
                        .permissions(List.of("READ", "WRITE", "APPROVE", "DOM_AUTHORIZE", "ALL"))
                        .passwordHash(passwordEncoder.encode("RailOpt@Ops2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                // ─── 3. WCR Engineering / P-Way Officer ───
                User.builder()
                        .officerId("OFF-WCR-ENG-01")
                        .name("Er. Vikram Singh")
                        .department("ENGINEERING")
                        .role("ENGINEERING_OFFICER")
                        .title("Senior Section Engineer (P-Way)")
                        .zone("WCR")
                        .division("Bhopal")
                        .authorizedDivisions(List.of("Bhopal"))
                        .permissions(List.of("READ", "WRITE", "SUBMIT_REQUEST", "PWAY_APPROVE"))
                        .passwordHash(passwordEncoder.encode("RailOpt@Eng2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                // ─── 4. WCR Signal & Telecommunication Officer ───
                User.builder()
                        .officerId("OFF-WCR-SIG-01")
                        .name("Er. Priya Sundaram")
                        .department("SIGNAL_AND_TELECOM")
                        .role("ST_OFFICER")
                        .title("Senior Section Engineer (S&T)")
                        .zone("WCR")
                        .division("Bhopal")
                        .authorizedDivisions(List.of("Bhopal"))
                        .permissions(List.of("READ", "WRITE", "SUBMIT_REQUEST", "ST_APPROVE"))
                        .passwordHash(passwordEncoder.encode("RailOpt@Sig2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                // ─── 5. WCR Traction Distribution (TRD / OHE) Officer ───
                User.builder()
                        .officerId("OFF-WCR-TRD-01")
                        .name("Er. Amitav Sen")
                        .department("TRACTION_DISTRIBUTION")
                        .role("TRD_OFFICER")
                        .title("Senior Section Engineer (TRD / OHE)")
                        .zone("WCR")
                        .division("Bhopal")
                        .authorizedDivisions(List.of("Bhopal"))
                        .permissions(List.of("READ", "WRITE", "SUBMIT_REQUEST", "TRD_APPROVE", "TCP_REQUEST"))
                        .passwordHash(passwordEncoder.encode("RailOpt@Trd2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                // ─── 6. WCR Section Officer ───
                User.builder()
                        .officerId("OFF-WCR-SEC-01")
                        .name("Anil Sharma")
                        .department("OPERATIONS")
                        .role("SECTION_OFFICER")
                        .title("Section Officer (Bhopal – Sehore)")
                        .zone("WCR")
                        .division("Bhopal")
                        .authorizedDivisions(List.of("Bhopal"))
                        .permissions(List.of("READ", "EXECUTE", "EMERGENCY_REPORT", "FINAL_REPORT"))
                        .passwordHash(passwordEncoder.encode("RailOpt@Sec2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                // ─── 7. WCR Station Master ───
                User.builder()
                        .officerId("OFF-WCR-SM-01")
                        .name("Ramesh Chandra")
                        .department("OPERATIONS")
                        .role("STATION_MASTER")
                        .title("Station Master (Bhopal Junction)")
                        .zone("WCR")
                        .division("Bhopal")
                        .authorizedDivisions(List.of("Bhopal"))
                        .permissions(List.of("READ", "COMMUNICATE", "LINE_CLEAR"))
                        .passwordHash(passwordEncoder.encode("RailOpt@Sm2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                // ─── 8. System Administrator ───
                User.builder()
                        .officerId("OFF-ADMIN-01")
                        .name("Shri A. K. Verma")
                        .department("ADMINISTRATION")
                        .role("ADMIN")
                        .title("Principal Chief Operations Manager (PCOM)")
                        .zone("WCR")
                        .division("Bhopal")
                        .authorizedDivisions(List.of("Bhopal", "Jabalpur", "Delhi", "Prayagraj"))
                        .permissions(List.of("ALL"))
                        .passwordHash(passwordEncoder.encode("RailOpt@Admin2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                // ─── 9. NORTHERN RAILWAY (NR) OFFICER — For Testing Zone Security Boundary (Req 4) ───
                User.builder()
                        .officerId("OFF-NR-DOM-01")
                        .name("Shri R. P. Gupta")
                        .department("OPERATIONS")
                        .role("DOM")
                        .title("Senior Divisional Operations Manager (Sr. DOM)")
                        .zone("NR")
                        .division("Delhi")
                        .authorizedDivisions(List.of("Delhi", "Ambala"))
                        .permissions(List.of("READ", "WRITE", "DOM_AUTHORIZE"))
                        .passwordHash(passwordEncoder.encode("RailOpt@Nr2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                // ─── Legacy compatibility accounts mapped to WCR ───
                User.builder()
                        .officerId("OFF-OPS-101")
                        .name("Rajesh K. Sharma")
                        .department("OPERATIONS")
                        .role("OPERATIONS_CONTROL")
                        .title("Chief Controller (Operations)")
                        .zone("WCR")
                        .division("Bhopal")
                        .authorizedDivisions(List.of("Bhopal"))
                        .permissions(List.of("READ", "WRITE", "APPROVE"))
                        .passwordHash(passwordEncoder.encode("RailOpt@Ops2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                User.builder()
                        .officerId("OFF-ENG-201")
                        .name("Er. Vikram Singh")
                        .department("ENGINEERING")
                        .role("ENGINEERING_OFFICER")
                        .title("Senior Section Engineer (P-Way)")
                        .zone("WCR")
                        .division("Bhopal")
                        .authorizedDivisions(List.of("Bhopal"))
                        .permissions(List.of("READ", "WRITE", "SUBMIT_REQUEST"))
                        .passwordHash(passwordEncoder.encode("RailOpt@Eng2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                User.builder()
                        .officerId("OFF-SIG-301")
                        .name("Er. Priya Sundaram")
                        .department("SIGNAL_AND_TELECOM")
                        .role("ST_OFFICER")
                        .title("Senior Section Engineer (S&T)")
                        .zone("WCR")
                        .division("Bhopal")
                        .authorizedDivisions(List.of("Bhopal"))
                        .permissions(List.of("READ", "WRITE", "SUBMIT_REQUEST"))
                        .passwordHash(passwordEncoder.encode("RailOpt@Sig2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                User.builder()
                        .officerId("OFF-TRD-401")
                        .name("Er. Amitav Sen")
                        .department("TRACTION_DISTRIBUTION")
                        .role("TRD_OFFICER")
                        .title("Senior Section Engineer (TRD / OHE)")
                        .zone("WCR")
                        .division("Bhopal")
                        .authorizedDivisions(List.of("Bhopal"))
                        .permissions(List.of("READ", "WRITE", "SUBMIT_REQUEST"))
                        .passwordHash(passwordEncoder.encode("RailOpt@Trd2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()
        );

        for (User officer : officers) {
            userRepository.findByOfficerId(officer.getOfficerId()).ifPresentOrElse(
                    existing -> {
                        existing.setName(officer.getName());
                        existing.setDepartment(officer.getDepartment());
                        existing.setRole(officer.getRole());
                        existing.setTitle(officer.getTitle());
                        existing.setZone(officer.getZone());
                        existing.setDivision(officer.getDivision());
                        existing.setAuthorizedDivisions(officer.getAuthorizedDivisions());
                        existing.setPermissions(officer.getPermissions());
                        existing.setPasswordHash(officer.getPasswordHash());
                        existing.setAccountStatus(AccountStatus.ACTIVE);
                        existing.setFailedLoginAttempts(0);
                        existing.setLockedUntil(null);
                        userRepository.save(existing);
                    },
                    () -> userRepository.save(officer)
            );
        }
        log.info("[DataSeeder] Successfully ensured {} authorized officer accounts are configured.", officers.size());
    }

    private void seedWcrDataIfEmpty() {
        // Ensure WCR corridors exist
        Corridor bplSeh = corridorRepository.findByCorridorId("BPL-SEH").orElseGet(() -> {
            Corridor c = Corridor.builder()
                    .corridorId("BPL-SEH")
                    .name("Bhopal – Sehore Section")
                    .fromStation("BPL")
                    .toStation("SEH")
                    .lengthKm(38)
                    .capacityUtilization(84)
                    .dailyTrains(74)
                    .zone("WCR")
                    .division("Bhopal")
                    .signaling("Electronic Interlocking + KAVACH Ready")
                    .traction("25kV AC OHE")
                    .speedLimit(120)
                    .status(CorridorStatus.OPERATIONAL)
                    .tracks(List.of(
                            CorridorTrack.builder().id(101L).trackCode("UP_MAIN").trackName("UP Main (To Sehore)").direction(TrackDirection.UP).status(CorridorStatus.OPERATIONAL).build(),
                            CorridorTrack.builder().id(102L).trackCode("DN_MAIN").trackName("DN Main (To Bhopal)").direction(TrackDirection.DN).status(CorridorStatus.OPERATIONAL).build()
                    ))
                    .stations(List.of(
                            CorridorStation.builder().id(101L).stationCode("BPL").stationName("Bhopal Junction").km(0).hasLoops(true).maxSpeed(120).build(),
                            CorridorStation.builder().id(102L).stationCode("BIH").stationName("Bairagarh (Sant Hirdaram Nagar)").km(11).hasLoops(true).maxSpeed(110).build(),
                            CorridorStation.builder().id(103L).stationCode("SEH").stationName("Sehore").km(38).hasLoops(true).maxSpeed(120).build()
                    ))
                    .build();
            return corridorRepository.save(c);
        });

        corridorRepository.findByCorridorId("BPL-ITR").orElseGet(() -> {
            Corridor c = Corridor.builder()
                    .corridorId("BPL-ITR")
                    .name("Bhopal – Itarsi Mainline (HDN-5)")
                    .fromStation("BPL")
                    .toStation("ITR")
                    .lengthKm(92)
                    .capacityUtilization(94)
                    .dailyTrains(148)
                    .zone("WCR")
                    .division("Bhopal")
                    .signaling("Automatic Block Signalling (ABS) + KAVACH SIL-4")
                    .traction("25kV AC OHE")
                    .speedLimit(130)
                    .status(CorridorStatus.OPERATIONAL)
                    .tracks(List.of(
                            CorridorTrack.builder().id(103L).trackCode("UP_MAIN").trackName("UP Semi-High Speed Line").direction(TrackDirection.UP).status(CorridorStatus.OPERATIONAL).build(),
                            CorridorTrack.builder().id(104L).trackCode("DN_MAIN").trackName("DN Semi-High Speed Line").direction(TrackDirection.DN).status(CorridorStatus.OPERATIONAL).build(),
                            CorridorTrack.builder().id(105L).trackCode("3RD_LINE").trackName("3rd Line (Freight Express)").direction(TrackDirection.BIDIRECTIONAL).status(CorridorStatus.OPERATIONAL).build()
                    ))
                    .stations(List.of(
                            CorridorStation.builder().id(104L).stationCode("BPL").stationName("Bhopal Junction").km(0).hasLoops(true).maxSpeed(130).build(),
                            CorridorStation.builder().id(105L).stationCode("MDDP").stationName("Mandideep").km(22).hasLoops(true).maxSpeed(130).build(),
                            CorridorStation.builder().id(106L).stationCode("HBD").stationName("Hoshangabad (Narmadapuram)").km(74).hasLoops(true).maxSpeed(130).build(),
                            CorridorStation.builder().id(107L).stationCode("ITR").stationName("Itarsi Junction").km(92).hasLoops(true).maxSpeed(130).build()
                    ))
                    .build();
            return corridorRepository.save(c);
        });

        // Seed WCR trains if none exist
        if (trainRepository.findByCorridor_Id(bplSeh.getId()).isEmpty()) {
            trainRepository.saveAll(List.of(
                    Train.builder().trainNumber("12002").trainName("New Delhi - Bhopal Shatabdi").category("SUPERFAST_EXPRESS").trainType(TrainType.PREMIUM).priority(1).maxSpeed(130).status(TrainStatus.ON_TIME).corridor(bplSeh).trackLine("DN_MAIN").build(),
                    Train.builder().trainNumber("22436").trainName("Vande Bharat Express").category("VANDE_BHARAT").trainType(TrainType.PREMIUM).priority(1).maxSpeed(130).status(TrainStatus.ON_TIME).corridor(bplSeh).trackLine("UP_MAIN").build(),
                    Train.builder().trainNumber("12417").trainName("Prayagraj Express").category("EXPRESS").trainType(TrainType.PASSENGER).priority(2).maxSpeed(110).status(TrainStatus.DELAYED).corridor(bplSeh).trackLine("UP_MAIN").build(),
                    Train.builder().trainNumber("FR-BCNHL-991").trainName("FCI Grain Special Rake").category("FREIGHT").trainType(TrainType.FREIGHT).priority(3).maxSpeed(75).status(TrainStatus.ON_TIME).corridor(bplSeh).trackLine("DN_MAIN").build()
            ));
        }

        // ─── SEED WCR DEPARTMENTAL MAINTENANCE TASKS WITH SPATIAL OVERLAP (Requirement 11, 12, 13) ───
        Department pwayDept = departmentRepository.findByCode("PWAY").orElse(null);
        Department stDept = departmentRepository.findByCode("ST").orElse(null);
        Department trdDept = departmentRepository.findByCode("TRD").orElse(null);

        // Task 1: Engineering / P-Way on Bhopal - Sehore
        if (taskRepository.findByTaskId("TSK-WCR-ENG-101").isEmpty()) {
            taskRepository.save(MaintenanceTask.builder()
                    .taskId("TSK-WCR-ENG-101")
                    .department(pwayDept)
                    .zone("WCR")
                    .division("Bhopal")
                    .fromStation("BPL")
                    .toStation("SEH")
                    .section("Bhopal – Sehore")
                    .assetName("Track BPL-SEH-102 (Km 832/4 - 835/0)")
                    .location("Bhopal – Sehore UP Main Line")
                    .taskType("Track Deep Screening & Mechanized Tamping")
                    .description("Deep screening of ballast and computerized track alignment using CSM 09-32 machine.")
                    .severity(Severity.CRITICAL)
                    .priority(Priority.URGENT)
                    .criticality("SAFETY_CRITICAL")
                    .durationMinutes(210)
                    .dueDate(LocalDate.now().plusDays(1))
                    .manpower(16)
                    .equipment("CSM 09-32 Tamping Machine, Ballast Regulator")
                    .dependencies("Requires simultaneous OHE power isolation (TRD)")
                    .supportingDepartments(List.of("TRD", "ST"))
                    .status(TaskStatus.PENDING)
                    .lifecycleState("PRIORITIZED")
                    .submittedBy("OFF-WCR-ENG-01")
                    .build());
        }

        // Task 2: Signal & Telecom on the EXACT SAME Bhopal - Sehore Section (SPATIAL OVERLAP)
        if (taskRepository.findByTaskId("TSK-WCR-SIG-201").isEmpty()) {
            taskRepository.save(MaintenanceTask.builder()
                    .taskId("TSK-WCR-SIG-201")
                    .department(stDept)
                    .zone("WCR")
                    .division("Bhopal")
                    .fromStation("BPL")
                    .toStation("SEH")
                    .section("Bhopal – Sehore")
                    .assetName("Point Machine SEH-2B & Track Circuit TC-833")
                    .location("Sehore Yard & Approach Interlocking")
                    .taskType("Point Machine Overhaul & Track Circuit Testing")
                    .description("Comprehensive electronic interlocking overhaul and audio frequency track circuit calibration.")
                    .severity(Severity.HIGH)
                    .priority(Priority.HIGH)
                    .criticality("HIGH")
                    .durationMinutes(180)
                    .dueDate(LocalDate.now().plusDays(2))
                    .manpower(8)
                    .equipment("Audio Frequency Track Circuit Diagnostic Kit")
                    .dependencies("Requires track possession jointly with P-Way")
                    .supportingDepartments(List.of("PWAY"))
                    .status(TaskStatus.PENDING)
                    .lifecycleState("PRIORITIZED")
                    .submittedBy("OFF-WCR-SIG-01")
                    .build());
        }

        // Task 3: Traction Distribution on the EXACT SAME Bhopal - Sehore Section (MULTI-DEPARTMENT BUNDLE)
        if (taskRepository.findByTaskId("TSK-WCR-TRD-301").isEmpty()) {
            taskRepository.save(MaintenanceTask.builder()
                    .taskId("TSK-WCR-TRD-301")
                    .department(trdDept)
                    .zone("WCR")
                    .division("Bhopal")
                    .fromStation("BPL")
                    .toStation("SEH")
                    .section("Bhopal – Sehore")
                    .assetName("OHE Catenary Mast BPL-Km834/12")
                    .location("Bhopal – Bairagarh Section")
                    .taskType("OHE Catenary Wire Height & Stagger Adjustment")
                    .description("Adjustment of overhead contact wire tension and inspection of cantilever assemblies using tower wagon.")
                    .severity(Severity.HIGH)
                    .priority(Priority.HIGH)
                    .criticality("HIGH")
                    .durationMinutes(180)
                    .dueDate(LocalDate.now().plusDays(1))
                    .manpower(12)
                    .equipment("4-Wheeler OHE Tower Wagon")
                    .dependencies("Requires 25kV traction power shutdown (TCP)")
                    .supportingDepartments(List.of("PWAY", "ST"))
                    .status(TaskStatus.PENDING)
                    .lifecycleState("PRIORITIZED")
                    .submittedBy("OFF-WCR-TRD-01")
                    .build());
        }

        // Task 4: Engineering on Bhopal - Bina (Different section)
        if (taskRepository.findByTaskId("TSK-WCR-ENG-102").isEmpty()) {
            taskRepository.save(MaintenanceTask.builder()
                    .taskId("TSK-WCR-ENG-102")
                    .department(pwayDept)
                    .zone("WCR")
                    .division("Bhopal")
                    .fromStation("BPL")
                    .toStation("BINA")
                    .section("Bhopal – Bina Mainline")
                    .assetName("Curve BPL-842 Flash Butt Weld")
                    .location("Bhopal – Sukhi Sewaniyan Section")
                    .taskType("Flash Butt Rail Joint Welding & Grinding")
                    .description("In-situ aluminothermic welding of rail joints to eliminate fishplate joint wear.")
                    .severity(Severity.MEDIUM)
                    .priority(Priority.MEDIUM)
                    .criticality("MEDIUM")
                    .durationMinutes(150)
                    .dueDate(LocalDate.now().plusDays(3))
                    .manpower(10)
                    .equipment("Mobile Flash Butt Welding Plant")
                    .supportingDepartments(List.of())
                    .status(TaskStatus.PENDING)
                    .lifecycleState("PRIORITIZED")
                    .submittedBy("OFF-WCR-ENG-01")
                    .build());
        }

        log.info("[DataSeeder] WCR Bhopal operational corridors and multi-department tasks ensured.");
    }

    private void seedMlBaselineIfEmpty() {
        if (mlTrainingRecordRepository.count() > 0) return;

        mlTrainingRecordRepository.save(MlTrainingRecord.builder()
                .modelVersion("v2.1-WCR-ONLINE")
                .samplesTrained(42)
                .historicalAccuracyPercent(93.4)
                .meanDurationVariance(18.2)
                .zone("WCR")
                .division("Bhopal")
                .triggerEvent("HISTORICAL_BASE_IMPORT")
                .learnedPatternsSummaryJson("ML INSIGHT: Historical track tamping on Bhopal – Sehore section took 18.2% longer during peak summer. Recommended AI buffer: +15 minutes.")
                .trainedAt(LocalDateTime.now().minusDays(1))
                .build());

        log.info("[DataSeeder] Baseline ML learning layer records initialized.");
    }
}
