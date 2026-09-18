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
 * Database seeder — inserts realistic Indian Railway DEMO/MOCK data on startup.
 *
 * Seeds: 4 departments, 3 corridors, 18 trains, 18 assets,
 *        10 maintenance tasks, 10 block requests, 2 AI block plans.
 *
 * This runs only when the departments collection is empty to avoid duplicate inserts
 * on subsequent restarts.
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
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedOfficersIfEmpty();

        if (departmentRepository.count() > 0) {
            log.info("[DataSeeder] General railway data already exists — skipping general seed.");
            return;
        }

        log.info("[DataSeeder] Seeding DEMO/MOCK data for RailOpt AI...");

        // ─── 1. Departments ──────────────────────────────────────────────────
        Department pway = departmentRepository.save(Department.builder()
                .name("Permanent Way")
                .code("PWAY")
                .description("Responsible for track maintenance, inspection, and renewal on NCR division.")
                .status(DepartmentStatus.ACTIVE)
                .build());

        Department trd = departmentRepository.save(Department.builder()
                .name("Traction & Rolling Distribution")
                .code("TRD")
                .description("Manages overhead equipment (OHE), traction substations, and power supply.")
                .status(DepartmentStatus.ACTIVE)
                .build());

        Department st = departmentRepository.save(Department.builder()
                .name("Signal & Telecommunication")
                .code("ST")
                .description("Maintains signalling systems, interlocking, and telecom infrastructure.")
                .status(DepartmentStatus.ACTIVE)
                .build());

        Department mech = departmentRepository.save(Department.builder()
                .name("Mechanical")
                .code("MECH")
                .description("Oversees maintenance of rolling stock, cranes, and mechanical assets.")
                .status(DepartmentStatus.ACTIVE)
                .build());

        log.info("[DataSeeder] Inserted 4 departments.");

        // ─── 2. Corridors ────────────────────────────────────────────────────
        Corridor ndlsCnb = corridorRepository.save(Corridor.builder()
                .corridorId("NDLS-CNB")
                .name("Delhi – Kanpur Main Line")
                .fromStation("NDLS")
                .toStation("CNB")
                .lengthKm(440)
                .capacityUtilization(87)
                .dailyTrains(186)
                .zone("NCR")
                .division("Prayagraj")
                .signaling("Multi-Aspect Colour Light (MACLS) + ATP-SIL2")
                .traction("25kV AC OHE")
                .speedLimit(130)
                .status(CorridorStatus.OPERATIONAL)
                .tracks(List.of(
                        CorridorTrack.builder().id(1L).trackCode("UP_MAIN").trackName("UP Main Line").direction(TrackDirection.UP).status(CorridorStatus.OPERATIONAL).build(),
                        CorridorTrack.builder().id(2L).trackCode("DN_MAIN").trackName("DN Main Line").direction(TrackDirection.DN).status(CorridorStatus.OPERATIONAL).build(),
                        CorridorTrack.builder().id(3L).trackCode("3RD_LINE").trackName("3rd Line (Freight Loop)").direction(TrackDirection.BIDIRECTIONAL).status(CorridorStatus.OPERATIONAL).build()
                ))
                .stations(List.of(
                        CorridorStation.builder().id(1L).stationCode("NDLS").stationName("New Delhi").km(0).hasLoops(true).maxSpeed(130).build(),
                        CorridorStation.builder().id(2L).stationCode("GZB").stationName("Ghaziabad").km(26).hasLoops(true).maxSpeed(130).build(),
                        CorridorStation.builder().id(3L).stationCode("ALJN").stationName("Aligarh").km(126).hasLoops(true).maxSpeed(130).build(),
                        CorridorStation.builder().id(4L).stationCode("TDL").stationName("Tundla").km(206).hasLoops(true).maxSpeed(130).build(),
                        CorridorStation.builder().id(5L).stationCode("CNB").stationName("Kanpur Central").km(440).hasLoops(true).maxSpeed(130).build()
                ))
                .build());

        Corridor ndlsAgc = corridorRepository.save(Corridor.builder()
                .corridorId("NDLS-AGC")
                .name("Delhi – Agra Mainline")
                .fromStation("NDLS")
                .toStation("AGC")
                .lengthKm(195)
                .capacityUtilization(92)
                .dailyTrains(120)
                .zone("NCR")
                .division("Agra")
                .signaling("ETCS Level-1 + KAVACH SIL-4")
                .traction("25kV AC OHE")
                .speedLimit(160)
                .status(CorridorStatus.OPERATIONAL)
                .tracks(List.of(
                        CorridorTrack.builder().id(4L).trackCode("UP_MAIN").trackName("UP Semi-High Speed Line").direction(TrackDirection.UP).status(CorridorStatus.OPERATIONAL).build(),
                        CorridorTrack.builder().id(5L).trackCode("DN_MAIN").trackName("DN Semi-High Speed Line").direction(TrackDirection.DN).status(CorridorStatus.OPERATIONAL).build()
                ))
                .stations(List.of(
                        CorridorStation.builder().id(6L).stationCode("NDLS").stationName("New Delhi").km(0).hasLoops(true).maxSpeed(160).build(),
                        CorridorStation.builder().id(7L).stationCode("MTJ").stationName("Mathura Junction").km(141).hasLoops(true).maxSpeed(160).build(),
                        CorridorStation.builder().id(8L).stationCode("AGC").stationName("Agra Cantonment").km(195).hasLoops(true).maxSpeed(160).build()
                ))
                .build());

        Corridor cnbPryg = corridorRepository.save(Corridor.builder()
                .corridorId("CNB-PRYG")
                .name("Kanpur – Prayagraj Junction")
                .fromStation("CNB")
                .toStation("PRYG")
                .lengthKm(204)
                .capacityUtilization(78)
                .dailyTrains(95)
                .zone("NCR")
                .division("Prayagraj")
                .signaling("Multi-Aspect Colour Light (MACLS)")
                .traction("25kV AC OHE")
                .speedLimit(110)
                .status(CorridorStatus.OPERATIONAL)
                .tracks(List.of(
                        CorridorTrack.builder().id(6L).trackCode("UP_MAIN").trackName("UP Main Line").direction(TrackDirection.UP).status(CorridorStatus.OPERATIONAL).build(),
                        CorridorTrack.builder().id(7L).trackCode("DN_MAIN").trackName("DN Main Line").direction(TrackDirection.DN).status(CorridorStatus.OPERATIONAL).build()
                ))
                .stations(List.of(
                        CorridorStation.builder().id(9L).stationCode("CNB").stationName("Kanpur Central").km(0).hasLoops(true).maxSpeed(110).build(),
                        CorridorStation.builder().id(10L).stationCode("FTP").stationName("Fatehpur").km(78).hasLoops(true).maxSpeed(110).build(),
                        CorridorStation.builder().id(11L).stationCode("PRYG").stationName("Prayagraj Junction").km(204).hasLoops(true).maxSpeed(110).build()
                ))
                .build());

        log.info("[DataSeeder] Inserted 3 corridors.");

        // ─── 3. Trains ────────────────────────────────────────────────────────
        List<Train> trains = List.of(
            Train.builder().trainNumber("12301").trainName("Howrah Rajdhani Express")
                .trainType(TrainType.PREMIUM).category("Rajdhani").source("NDLS").destination("HWH")
                .corridor(ndlsCnb).trackLine("UP_MAIN").priority(1).maxSpeed(130).rakeLength(20)
                .departureTime("16:55").arrivalTime("10:05").status(TrainStatus.ON_TIME).delayMinutes(0).kavachFitted(true).build(),

            Train.builder().trainNumber("12302").trainName("Howrah Rajdhani Express")
                .trainType(TrainType.PREMIUM).category("Rajdhani").source("HWH").destination("NDLS")
                .corridor(ndlsCnb).trackLine("DN_MAIN").priority(1).maxSpeed(130).rakeLength(20)
                .departureTime("14:05").arrivalTime("07:55").status(TrainStatus.DELAYED).delayMinutes(12).kavachFitted(true).build(),

            Train.builder().trainNumber("22436").trainName("Vande Bharat Express (Delhi-CNB)")
                .trainType(TrainType.PREMIUM).category("Vande Bharat").source("NDLS").destination("CNB")
                .corridor(ndlsCnb).trackLine("UP_MAIN").priority(1).maxSpeed(160).rakeLength(16)
                .departureTime("06:00").arrivalTime("10:45").status(TrainStatus.ON_TIME).delayMinutes(0).kavachFitted(true).build(),

            Train.builder().trainNumber("22435").trainName("Vande Bharat Express (CNB-Delhi)")
                .trainType(TrainType.PREMIUM).category("Vande Bharat").source("CNB").destination("NDLS")
                .corridor(ndlsCnb).trackLine("DN_MAIN").priority(1).maxSpeed(160).rakeLength(16)
                .departureTime("17:35").arrivalTime("22:20").status(TrainStatus.ON_TIME).delayMinutes(0).kavachFitted(true).build(),

            Train.builder().trainNumber("12003").trainName("Lucknow Shatabdi Express")
                .trainType(TrainType.PREMIUM).category("Shatabdi").source("NDLS").destination("LKO")
                .corridor(ndlsCnb).trackLine("UP_MAIN").priority(2).maxSpeed(150).rakeLength(18)
                .departureTime("06:10").arrivalTime("12:30").status(TrainStatus.ON_TIME).delayMinutes(0).kavachFitted(false).build(),

            Train.builder().trainNumber("12004").trainName("Lucknow Shatabdi Express")
                .trainType(TrainType.PREMIUM).category("Shatabdi").source("LKO").destination("NDLS")
                .corridor(ndlsCnb).trackLine("DN_MAIN").priority(2).maxSpeed(150).rakeLength(18)
                .departureTime("14:55").arrivalTime("21:30").status(TrainStatus.DELAYED).delayMinutes(8).kavachFitted(false).build(),

            Train.builder().trainNumber("12393").trainName("Sampoorna Kranti Express")
                .trainType(TrainType.EXPRESS).category("Superfast").source("RJPB").destination("NDLS")
                .corridor(ndlsCnb).trackLine("DN_MAIN").priority(3).maxSpeed(110).rakeLength(22)
                .departureTime("19:30").arrivalTime("07:40").status(TrainStatus.ON_TIME).delayMinutes(0).kavachFitted(false).build(),

            Train.builder().trainNumber("12582").trainName("Banaras – NDLS SF Express")
                .trainType(TrainType.EXPRESS).category("Superfast").source("BSB").destination("NDLS")
                .corridor(ndlsCnb).trackLine("DN_MAIN").priority(3).maxSpeed(110).rakeLength(20)
                .departureTime("16:35").arrivalTime("06:10").status(TrainStatus.ON_TIME).delayMinutes(0).kavachFitted(false).build(),

            Train.builder().trainNumber("FR-BOXN-4012").trainName("BOXN Freight – Khurja to CNB")
                .trainType(TrainType.FREIGHT).category("Freight").source("KRJ").destination("CNB")
                .corridor(ndlsCnb).trackLine("UP_MAIN").priority(5).maxSpeed(75).rakeLength(58)
                .departureTime("02:00").arrivalTime("10:30").status(TrainStatus.ON_TIME).delayMinutes(0).kavachFitted(false).build(),

            Train.builder().trainNumber("FR-BCNA-7201").trainName("BCNA Rake – GZB Yard to AGC")
                .trainType(TrainType.FREIGHT).category("Freight").source("GZB").destination("AGC")
                .corridor(ndlsCnb).trackLine("DN_MAIN").priority(5).maxSpeed(75).rakeLength(50)
                .departureTime("01:15").arrivalTime("08:00").status(TrainStatus.DELAYED).delayMinutes(22).kavachFitted(false).build(),

            // NDLS-AGC corridor trains
            Train.builder().trainNumber("12049").trainName("Gatimaan Express (NDLS-AGC)")
                .trainType(TrainType.PREMIUM).category("Premium").source("NDLS").destination("AGC")
                .corridor(ndlsAgc).trackLine("UP_MAIN").priority(1).maxSpeed(160).rakeLength(12)
                .departureTime("08:10").arrivalTime("09:50").status(TrainStatus.ON_TIME).delayMinutes(0).kavachFitted(true).build(),

            Train.builder().trainNumber("12050").trainName("Gatimaan Express (AGC-NDLS)")
                .trainType(TrainType.PREMIUM).category("Premium").source("AGC").destination("NDLS")
                .corridor(ndlsAgc).trackLine("DN_MAIN").priority(1).maxSpeed(160).rakeLength(12)
                .departureTime("17:50").arrivalTime("19:30").status(TrainStatus.ON_TIME).delayMinutes(0).kavachFitted(true).build(),

            Train.builder().trainNumber("12138").trainName("Punjab Mail")
                .trainType(TrainType.EXPRESS).category("Mail/Express").source("CSTM").destination("FZR")
                .corridor(ndlsAgc).trackLine("DN_MAIN").priority(3).maxSpeed(110).rakeLength(22)
                .departureTime("17:15").arrivalTime("09:30").status(TrainStatus.DELAYED).delayMinutes(18).kavachFitted(false).build(),

            // CNB-PRYG corridor trains
            Train.builder().trainNumber("12275").trainName("Allahabad Duronto Express")
                .trainType(TrainType.EXPRESS).category("Duronto").source("NDLS").destination("PRYG")
                .corridor(cnbPryg).trackLine("UP_MAIN").priority(2).maxSpeed(110).rakeLength(20)
                .departureTime("14:05").arrivalTime("22:10").status(TrainStatus.ON_TIME).delayMinutes(0).kavachFitted(false).build(),

            Train.builder().trainNumber("12276").trainName("Allahabad Duronto Express")
                .trainType(TrainType.EXPRESS).category("Duronto").source("PRYG").destination("NDLS")
                .corridor(cnbPryg).trackLine("DN_MAIN").priority(2).maxSpeed(110).rakeLength(20)
                .departureTime("05:55").arrivalTime("14:00").status(TrainStatus.ON_TIME).delayMinutes(0).kavachFitted(false).build(),

            Train.builder().trainNumber("22182").trainName("PRYG Rajyarani SF Express")
                .trainType(TrainType.EXPRESS).category("Superfast").source("PRYG").destination("HZM")
                .corridor(cnbPryg).trackLine("DN_MAIN").priority(3).maxSpeed(100).rakeLength(18)
                .departureTime("20:30").arrivalTime("10:45").status(TrainStatus.ON_TIME).delayMinutes(0).kavachFitted(false).build(),

            Train.builder().trainNumber("FR-BTPN-5901").trainName("Petrol Tank Rake – CNB to PRYG")
                .trainType(TrainType.FREIGHT).category("Freight").source("CNB").destination("PRYG")
                .corridor(cnbPryg).trackLine("UP_MAIN").priority(5).maxSpeed(65).rakeLength(40)
                .departureTime("03:30").arrivalTime("07:20").status(TrainStatus.ON_TIME).delayMinutes(0).kavachFitted(false).build(),

            Train.builder().trainNumber("FR-COAL-8842").trainName("Coal Rake – CNB to PRYG")
                .trainType(TrainType.FREIGHT).category("Freight").source("CNB").destination("PRYG")
                .corridor(cnbPryg).trackLine("UP_MAIN").priority(5).maxSpeed(60).rakeLength(58)
                .departureTime("22:45").arrivalTime("05:30").status(TrainStatus.DELAYED).delayMinutes(35).kavachFitted(false).build()
        );

        trainRepository.saveAll(trains);
        log.info("[DataSeeder] Inserted {} trains.", trains.size());

        // ─── 4. Railway Assets ────────────────────────────────────────────────
        List<RailwayAsset> assets = List.of(
            // PWAY Assets
            RailwayAsset.builder().assetId("AST-TRK-01").name("Track TDL-162 UP Main")
                .assetType(AssetType.TRACK_KM).department(pway).corridor(ndlsCnb)
                .section("Aligarh – Tundla").location("Tundla Yard, km 162+400")
                .healthScore(74).status(AssetStatus.ATTENTION_REQUIRED).lastMaintenance(LocalDate.now().minusDays(45))
                .nextInspectionDue(LocalDate.now().plusDays(5)).defectsCount(3)
                .activeTsr("TSR-30 at km 162+380 (slew defect)").gmtCarried(18.4).build(),

            RailwayAsset.builder().assetId("AST-TRK-02").name("Track CNB-105 UP Main")
                .assetType(AssetType.TRACK_KM).department(pway).corridor(ndlsCnb)
                .section("Etawah – Kanpur").location("Kanpur Junction, km 105+200")
                .healthScore(52).status(AssetStatus.CRITICAL).lastMaintenance(LocalDate.now().minusDays(90))
                .nextInspectionDue(LocalDate.now().plusDays(2)).defectsCount(6)
                .activeTsr("TSR-45 at km 105+190 (hogged joint)").gmtCarried(22.1).build(),

            RailwayAsset.builder().assetId("AST-BRG-01").name("Yamuna Bridge YB-01")
                .assetType(AssetType.BRIDGE).department(pway).corridor(ndlsAgc)
                .section("Agra Cantonment – AGC").location("Agra, km 192+000")
                .healthScore(89).status(AssetStatus.GOOD).lastMaintenance(LocalDate.now().minusDays(30))
                .nextInspectionDue(LocalDate.now().plusDays(60)).defectsCount(0)
                .activeTsr(null).gmtCarried(null).build(),

            RailwayAsset.builder().assetId("AST-TRK-03").name("Track PRYG-204 DN Main")
                .assetType(AssetType.TRACK_KM).department(pway).corridor(cnbPryg)
                .section("Fatehpur – Prayagraj").location("Prayagraj Jn, km 204+800")
                .healthScore(81).status(AssetStatus.GOOD).lastMaintenance(LocalDate.now().minusDays(20))
                .nextInspectionDue(LocalDate.now().plusDays(25)).defectsCount(1)
                .activeTsr(null).gmtCarried(14.5).build(),

            RailwayAsset.builder().assetId("AST-LC-01").name("Level Crossing LC-47")
                .assetType(AssetType.LEVEL_CROSSING).department(pway).corridor(ndlsCnb)
                .section("Etawah").location("Etawah, km 219+750")
                .healthScore(65).status(AssetStatus.ATTENTION_REQUIRED).lastMaintenance(LocalDate.now().minusDays(60))
                .nextInspectionDue(LocalDate.now().plusDays(10)).defectsCount(2)
                .activeTsr("TSR-30 (worn check rails)").gmtCarried(null).build(),

            // TRD Assets
            RailwayAsset.builder().assetId("AST-OHE-01").name("OHE ALJN-22 UP Line")
                .assetType(AssetType.OHE_SECTION).department(trd).corridor(ndlsCnb)
                .section("Aligarh – Sasni").location("Aligarh Junction, km 122+300")
                .healthScore(61).status(AssetStatus.ATTENTION_REQUIRED).lastMaintenance(LocalDate.now().minusDays(120))
                .nextInspectionDue(LocalDate.now().plusDays(7)).defectsCount(2)
                .activeTsr(null).gmtCarried(null).build(),

            RailwayAsset.builder().assetId("AST-TSS-01").name("Traction Substation TSS-4 Firozabad")
                .assetType(AssetType.TRACTION_SUBSTATION).department(trd).corridor(ndlsCnb)
                .section("Etawah – Firozabad").location("Firozabad, km 203+000")
                .healthScore(88).status(AssetStatus.GOOD).lastMaintenance(LocalDate.now().minusDays(25))
                .nextInspectionDue(LocalDate.now().plusDays(15)).defectsCount(0)
                .activeTsr(null).gmtCarried(null).build(),

            RailwayAsset.builder().assetId("AST-TSS-02").name("Traction Substation TSS-7 Agra")
                .assetType(AssetType.TRACTION_SUBSTATION).department(trd).corridor(ndlsAgc)
                .section("AGC").location("Agra Cantonment, km 188+000")
                .healthScore(94).status(AssetStatus.GOOD).lastMaintenance(LocalDate.now().minusDays(10))
                .nextInspectionDue(LocalDate.now().plusDays(80)).defectsCount(0)
                .activeTsr(null).gmtCarried(null).build(),

            RailwayAsset.builder().assetId("AST-OHE-02").name("OHE CNB-SP-UP Section")
                .assetType(AssetType.OHE_SECTION).department(trd).corridor(cnbPryg)
                .section("Kanpur – Fatehpur").location("Kanpur Jn, km 100+000 to 125+000")
                .healthScore(76).status(AssetStatus.ATTENTION_REQUIRED).lastMaintenance(LocalDate.now().minusDays(55))
                .nextInspectionDue(LocalDate.now().plusDays(12)).defectsCount(1)
                .activeTsr(null).gmtCarried(null).build(),

            // ST Assets
            RailwayAsset.builder().assetId("AST-SIG-01").name("Signal ALJN-44 Home Signal")
                .assetType(AssetType.SIGNAL_SYSTEM).department(st).corridor(ndlsCnb)
                .section("Aligarh Junction").location("Aligarh Junction, Platform 4")
                .healthScore(58).status(AssetStatus.ATTENTION_REQUIRED).lastMaintenance(LocalDate.now().minusDays(35))
                .nextInspectionDue(LocalDate.now().plusDays(3)).defectsCount(1)
                .activeTsr(null).gmtCarried(null).build(),

            RailwayAsset.builder().assetId("AST-PM-01").name("Point Machine PM-17 Mathura Jn")
                .assetType(AssetType.INTERLOCKING_SYSTEM).department(st).corridor(ndlsAgc)
                .section("Mathura Junction").location("Mathura Junction, km 130+500, Road 17")
                .healthScore(70).status(AssetStatus.ATTENTION_REQUIRED).lastMaintenance(LocalDate.now().minusDays(50))
                .nextInspectionDue(LocalDate.now().plusDays(8)).defectsCount(1)
                .activeTsr(null).gmtCarried(null).build(),

            RailwayAsset.builder().assetId("AST-AXC-01").name("Axle Counter AC-CNB-12")
                .assetType(AssetType.AXLE_COUNTER).department(st).corridor(cnbPryg)
                .section("Kanpur Central").location("Kanpur Central, km 100+800")
                .healthScore(45).status(AssetStatus.CRITICAL).lastMaintenance(LocalDate.now().minusDays(80))
                .nextInspectionDue(LocalDate.now().plusDays(1)).defectsCount(2)
                .activeTsr(null).gmtCarried(null).build(),

            RailwayAsset.builder().assetId("AST-SIG-02").name("Block Instrument BI-GZB-7")
                .assetType(AssetType.SIGNAL_SYSTEM).department(st).corridor(ndlsCnb)
                .section("Ghaziabad").location("Ghaziabad Jn, Section-7")
                .healthScore(92).status(AssetStatus.GOOD).lastMaintenance(LocalDate.now().minusDays(15))
                .nextInspectionDue(LocalDate.now().plusDays(45)).defectsCount(0)
                .activeTsr(null).gmtCarried(null).build(),

            // MECH Assets
            RailwayAsset.builder().assetId("AST-CRN-01").name("Breakdown Crane BCR-05 (140T)")
                .assetType(AssetType.CRANE).department(mech).corridor(ndlsAgc)
                .section("Agra Cantonment Loco Shed").location("Agra Cantonment, Loco Shed")
                .healthScore(96).status(AssetStatus.GOOD).lastMaintenance(LocalDate.now().minusDays(5))
                .nextInspectionDue(LocalDate.now().plusDays(30)).defectsCount(0)
                .activeTsr(null).gmtCarried(null).build(),

            RailwayAsset.builder().assetId("AST-LOCO-01").name("WAP-7 Loco #30411")
                .assetType(AssetType.ROLLING_STOCK).department(mech).corridor(ndlsCnb)
                .section("Kanpur Loco Shed").location("Kanpur Loco Shed, Pit No. 3")
                .healthScore(72).status(AssetStatus.ATTENTION_REQUIRED).lastMaintenance(LocalDate.now().minusDays(40))
                .nextInspectionDue(LocalDate.now().plusDays(20)).defectsCount(1)
                .activeTsr(null).gmtCarried(null).build(),

            RailwayAsset.builder().assetId("AST-LOCO-02").name("WAG-9H Loco #31207")
                .assetType(AssetType.ROLLING_STOCK).department(mech).corridor(cnbPryg)
                .section("Allahabad Shed").location("Prayagraj Loco Shed, Pit No. 1")
                .healthScore(98).status(AssetStatus.GOOD).lastMaintenance(LocalDate.now().minusDays(8))
                .nextInspectionDue(LocalDate.now().plusDays(90)).defectsCount(0)
                .activeTsr(null).gmtCarried(null).build(),

            // Track Machines
            RailwayAsset.builder().assetId("AST-MCH-01").name("CSM 09-32 Continuous Tamping Machine")
                .assetType(AssetType.TRACK_MACHINE).department(pway).corridor(ndlsCnb)
                .section("Tundla Depot").location("Tundla Track Machine Siding")
                .healthScore(92).status(AssetStatus.GOOD).lastMaintenance(LocalDate.now().minusDays(14))
                .nextInspectionDue(LocalDate.now().plusDays(45)).defectsCount(0)
                .activeTsr(null).gmtCarried(null).build(),

            RailwayAsset.builder().assetId("AST-MCH-02").name("BCM 373 Ballast Cleaning Machine")
                .assetType(AssetType.TRACK_MACHINE).department(pway).corridor(ndlsCnb)
                .section("Ghaziabad Yard").location("Ghaziabad Track Machine Base")
                .healthScore(85).status(AssetStatus.GOOD).lastMaintenance(LocalDate.now().minusDays(28))
                .nextInspectionDue(LocalDate.now().plusDays(35)).defectsCount(1)
                .activeTsr(null).gmtCarried(null).build(),

            RailwayAsset.builder().assetId("AST-MCH-03").name("UNIMAT 08-4S Point & Crossing Tamper")
                .assetType(AssetType.TRACK_MACHINE).department(pway).corridor(ndlsAgc)
                .section("Mathura Section").location("Mathura Jn Track Depot")
                .healthScore(78).status(AssetStatus.ATTENTION_REQUIRED).lastMaintenance(LocalDate.now().minusDays(60))
                .nextInspectionDue(LocalDate.now().plusDays(10)).defectsCount(2)
                .activeTsr(null).gmtCarried(null).build(),

            RailwayAsset.builder().assetId("AST-MCH-04").name("4-Wheeler OHE Tower Wagon TW-22")
                .assetType(AssetType.TRACK_MACHINE).department(trd).corridor(cnbPryg)
                .section("Kanpur Central").location("Kanpur TRD Siding")
                .healthScore(95).status(AssetStatus.GOOD).lastMaintenance(LocalDate.now().minusDays(10))
                .nextInspectionDue(LocalDate.now().plusDays(50)).defectsCount(0)
                .activeTsr(null).gmtCarried(null).build()
        );

        assetRepository.saveAll(assets);
        log.info("[DataSeeder] Inserted {} railway assets.", assets.size());

        // ─── 5. Maintenance Tasks ─────────────────────────────────────────────
        List<MaintenanceTask> tasks = List.of(

            // PWAY Tasks
            MaintenanceTask.builder().taskId("TASK-PWAY-001").department(pway)
                .assetName("Track TDL-162").location("Tundla Yard, km 162+400")
                .taskType("Track Geometry Correction")
                .description("[DEMO] Rectification of slew and versine defects detected during OMS run. " +
                        "Packing and lining required at 3 locations.")
                .severity(Severity.HIGH).priority(Priority.HIGH).durationMinutes(240)
                .dueDate(LocalDate.now().plusDays(5)).status(TaskStatus.PENDING).build(),

            MaintenanceTask.builder().taskId("TASK-PWAY-002").department(pway)
                .assetName("Track CNB-105").location("Kanpur Junction, km 105+200")
                .taskType("Rail Replacement")
                .description("[DEMO] 90R rail replacement due to hogged joint. " +
                        "Three rails (total 36m) to be replaced on UP main line.")
                .severity(Severity.CRITICAL).priority(Priority.URGENT).durationMinutes(300)
                .dueDate(LocalDate.now().plusDays(2)).status(TaskStatus.SCHEDULED).build(),

            MaintenanceTask.builder().taskId("TASK-PWAY-003").department(pway)
                .assetName("Level Crossing LC-47").location("Etawah, km 219+750")
                .taskType("Renewal of Crossing Panels")
                .description("[DEMO] Worn check rails and crossing panels at manned LC-47 require renewal. " +
                        "Traffic restriction (30 kmph) currently in force.")
                .severity(Severity.MEDIUM).priority(Priority.MEDIUM).durationMinutes(180)
                .dueDate(LocalDate.now().plusDays(10)).status(TaskStatus.PENDING).build(),

            MaintenanceTask.builder().taskId("TASK-PWAY-004").department(pway)
                .assetName("Track GZB-018 DN Main").location("Ghaziabad, km 18+600")
                .taskType("Ballast Tamping & Deep Screening")
                .description("[DEMO] Annual tamping and screening required. BCM to be deployed for 4 km section.")
                .severity(Severity.MEDIUM).priority(Priority.MEDIUM).durationMinutes(360)
                .dueDate(LocalDate.now().plusDays(14)).status(TaskStatus.PENDING).build(),

            // TRD Tasks
            MaintenanceTask.builder().taskId("TASK-TRD-001").department(trd)
                .assetName("OHE ALJN-22").location("Aligarh Junction, km 122+300")
                .taskType("OHE Contact Wire Replacement")
                .description("[DEMO] Contact wire wear beyond permissible limit (7mm residual). " +
                        "Replacement of 1500m section on UP line required.")
                .severity(Severity.HIGH).priority(Priority.HIGH).durationMinutes(360)
                .dueDate(LocalDate.now().plusDays(7)).status(TaskStatus.PENDING).build(),

            MaintenanceTask.builder().taskId("TASK-TRD-002").department(trd)
                .assetName("Traction Substation TSS-4").location("Firozabad, km 203+000")
                .taskType("Transformer Preventive Maintenance")
                .description("[DEMO] Annual preventive maintenance of 25kV traction transformer. " +
                        "Insulation testing, oil sampling, and bushing inspection.")
                .severity(Severity.MEDIUM).priority(Priority.MEDIUM).durationMinutes(480)
                .dueDate(LocalDate.now().plusDays(15)).status(TaskStatus.SCHEDULED).build(),

            MaintenanceTask.builder().taskId("TASK-TRD-003").department(trd)
                .assetName("OHE CNB-SP-UP Section").location("Kanpur Jn, km 100+000 to 125+000")
                .taskType("OHE Section Inspection & Tensioning")
                .description("[DEMO] OHE wire sagging detected in 25km section. Wire height correction and re-tensioning required.")
                .severity(Severity.HIGH).priority(Priority.HIGH).durationMinutes(420)
                .dueDate(LocalDate.now().plusDays(9)).status(TaskStatus.PENDING).build(),

            // S&T Tasks
            MaintenanceTask.builder().taskId("TASK-ST-001").department(st)
                .assetName("Signal ALJN-44").location("Aligarh Junction, Platform 4")
                .taskType("Signal Lamp Replacement")
                .description("[DEMO] LED cluster replacement on home signal ALJN-44. " +
                        "Signal showing degraded luminosity during last inspection.")
                .severity(Severity.HIGH).priority(Priority.HIGH).durationMinutes(120)
                .dueDate(LocalDate.now().plusDays(3)).status(TaskStatus.IN_PROGRESS).build(),

            MaintenanceTask.builder().taskId("TASK-ST-002").department(st)
                .assetName("Point Machine PM-17").location("Mathura Junction, km 130+500, Road 17")
                .taskType("Point Machine Overhaul")
                .description("[DEMO] Periodic overhaul of clamp-lock point machine. " +
                        "Current stroke time 4.2s — threshold is 4.0s.")
                .severity(Severity.MEDIUM).priority(Priority.MEDIUM).durationMinutes(150)
                .dueDate(LocalDate.now().plusDays(8)).status(TaskStatus.PENDING).build(),

            MaintenanceTask.builder().taskId("TASK-ST-003").department(st)
                .assetName("Axle Counter AC-CNB-12").location("Kanpur Central, km 100+800")
                .taskType("Axle Counter Calibration")
                .description("[DEMO] Calibration and reset of axle counter section CNB-12 " +
                        "following intermittent failure reports from loco pilots.")
                .severity(Severity.CRITICAL).priority(Priority.URGENT).durationMinutes(90)
                .dueDate(LocalDate.now().plusDays(1)).status(TaskStatus.SCHEDULED).build(),

            // Mechanical Tasks
            MaintenanceTask.builder().taskId("TASK-MECH-001").department(mech)
                .assetName("Breakdown Crane BCR-05").location("Agra Cantonment, Loco Shed")
                .taskType("Crane Annual Inspection")
                .description("[DEMO] Annual load test and inspection of 140T breakdown crane as per RDSO guidelines. " +
                        "Last test: Sep 2023.")
                .severity(Severity.LOW).priority(Priority.LOW).durationMinutes(600)
                .dueDate(LocalDate.now().plusDays(30)).status(TaskStatus.PENDING).build(),

            MaintenanceTask.builder().taskId("TASK-MECH-002").department(mech)
                .assetName("WAP-7 Loco #30411").location("Kanpur Loco Shed, Pit No. 3")
                .taskType("Scheduled IOH")
                .description("[DEMO] Intermediate Overhaul (IOH) of WAP-7 locomotive #30411. " +
                        "Current mileage: 2,25,000 km. IOH due at 2,40,000 km.")
                .severity(Severity.MEDIUM).priority(Priority.MEDIUM).durationMinutes(1440)
                .dueDate(LocalDate.now().plusDays(20)).status(TaskStatus.DEFERRED).build()
        );

        taskRepository.saveAll(tasks);
        log.info("[DataSeeder] Inserted {} maintenance tasks.", tasks.size());

        // ─── 6. Block Requests ────────────────────────────────────────────────
        List<BlockRequest> blockRequests = List.of(
            BlockRequest.builder().blockId("BLK-REQ-PWAY-001").corridor(ndlsCnb).department(pway)
                .trackLine("UP_MAIN").requestedStart("01:00").requestedEnd("04:30").durationMinutes(210)
                .priority(Priority.HIGH).status(BlockRequestStatus.PENDING)
                .notes("Track geometry correction at TDL-162. CSM 09-32 required.").requestedBy("SSE/PWAY/TDL").build(),

            BlockRequest.builder().blockId("BLK-REQ-PWAY-002").corridor(ndlsCnb).department(pway)
                .trackLine("UP_MAIN").requestedStart("00:30").requestedEnd("05:00").durationMinutes(270)
                .priority(Priority.URGENT).status(BlockRequestStatus.APPROVED)
                .notes("Urgent rail replacement at CNB-105. Night block essential.").requestedBy("SSE/PWAY/CNB").build(),

            BlockRequest.builder().blockId("BLK-REQ-TRD-001").corridor(ndlsCnb).department(trd)
                .trackLine("UP_MAIN").requestedStart("01:30").requestedEnd("05:30").durationMinutes(240)
                .priority(Priority.HIGH).status(BlockRequestStatus.PENDING)
                .notes("OHE contact wire replacement ALJN-22. Power block + LWR isolation required.").requestedBy("SSE/TRD/ALJN").build(),

            BlockRequest.builder().blockId("BLK-REQ-ST-001").corridor(ndlsCnb).department(st)
                .trackLine("DN_MAIN").requestedStart("02:00").requestedEnd("03:30").durationMinutes(90)
                .priority(Priority.URGENT).status(BlockRequestStatus.APPROVED)
                .notes("Axle counter calibration AC-CNB-12. Safety critical — urgent completion.").requestedBy("SSE/ST/CNB").build(),

            BlockRequest.builder().blockId("BLK-REQ-PWAY-003").corridor(ndlsCnb).department(pway)
                .trackLine("DN_MAIN").requestedStart("00:00").requestedEnd("06:00").durationMinutes(360)
                .priority(Priority.MEDIUM).status(BlockRequestStatus.PENDING)
                .notes("Ballast tamping GZB-018 DN Main. BCM deployment planned.").requestedBy("SSE/PWAY/GZB").build(),

            BlockRequest.builder().blockId("BLK-REQ-TRD-002").corridor(ndlsCnb).department(trd)
                .trackLine("UP_MAIN").requestedStart("02:00").requestedEnd("09:00").durationMinutes(420)
                .priority(Priority.HIGH).status(BlockRequestStatus.PENDING)
                .notes("OHE tensioning CNB–FTP section. 25km stretch, multi-gang deployment.").requestedBy("SSE/TRD/CNB").build(),

            BlockRequest.builder().blockId("BLK-REQ-ST-002").corridor(ndlsAgc).department(st)
                .trackLine("DN_MAIN").requestedStart("03:00").requestedEnd("05:30").durationMinutes(150)
                .priority(Priority.MEDIUM).status(BlockRequestStatus.PENDING)
                .notes("Point machine overhaul PM-17. Special tools required from DEN office.").requestedBy("SSE/ST/MTJ").build(),

            BlockRequest.builder().blockId("BLK-REQ-PWAY-004").corridor(ndlsAgc).department(pway)
                .trackLine("UP_MAIN").requestedStart("01:00").requestedEnd("03:30").durationMinutes(150)
                .priority(Priority.LOW).status(BlockRequestStatus.PENDING)
                .notes("Routine inspection of LC-47 panels and check rails.").requestedBy("JE/PWAY/ETA").build(),

            BlockRequest.builder().blockId("BLK-REQ-TRD-003").corridor(cnbPryg).department(trd)
                .trackLine("UP_MAIN").requestedStart("00:00").requestedEnd("08:00").durationMinutes(480)
                .priority(Priority.MEDIUM).status(BlockRequestStatus.PENDING)
                .notes("TSS-4 transformer annual PM. Full isolation of CNB-FTP section required.").requestedBy("SSE/TRD/FZB").build(),

            BlockRequest.builder().blockId("BLK-REQ-MECH-001").corridor(ndlsCnb).department(mech)
                .trackLine("UP_MAIN").requestedStart("10:00").requestedEnd("20:00").durationMinutes(600)
                .priority(Priority.LOW).status(BlockRequestStatus.PENDING)
                .notes("BCR-05 crane annual load test at Agra. Non-traffic block during day hours.").requestedBy("SSE/MECH/AGC").build()
        );

        blockRequestRepository.saveAll(blockRequests);
        log.info("[DataSeeder] Inserted {} block requests.", blockRequests.size());

        // ─── 7. AI Block Plans (Pre-seeded samples) ───────────────────────────
        try {
            String reasoningJson1 = objectMapper.writeValueAsString(List.of(
                Map.of("step", "1", "title", "Task Analysis",
                    "detail", "Identified 2 critical PWAY tasks (TDL-162 geometry, CNB-105 rail replacement) requiring combined 540 min. Shadow bundled with TRD OHE inspection."),
                Map.of("step", "2", "title", "Train Conflict Scan",
                    "detail", "Night window 01:00-05:30 has 1 freight train (FR-BOXN-4012) at 02:00. Regulated to Tundla loop for 22 min — within acceptable delay tolerance."),
                Map.of("step", "3", "title", "Window Selection",
                    "detail", "01:00-05:30 IST selected. Lowest train density on NDLS-CNB UP Main. 3 Rajdhani/SF trains clear the section by 00:48 IST."),
                Map.of("step", "4", "title", "Optimization Score",
                    "detail", "Score: 94.2/100. Shadow bundling reduces total block time by 38%. One minor delay (22 min freight). Zero passenger train impact.")
            ));

            String affectedTrains1 = objectMapper.writeValueAsString(List.of(
                Map.of("trainNumber", "FR-BOXN-4012", "trainName", "BOXN Freight – Khurja to CNB",
                    "delayMinutes", 22, "regulation", "Regulated at Tundla Loop 2 for 22 min", "impactLevel", "LOW")
            ));

            String assignedTasks1 = objectMapper.writeValueAsString(List.of(
                Map.of("taskId", "TASK-PWAY-001", "type", "Track Geometry Correction", "dept", "PWAY", "durationMin", 240),
                Map.of("taskId", "TASK-PWAY-002", "type", "Rail Replacement", "dept", "PWAY", "durationMin", 300),
                Map.of("taskId", "TASK-TRD-001", "type", "OHE Contact Wire Replacement", "dept", "TRD", "durationMin", 360)
            ));

            AiBlockPlan plan1 = AiBlockPlan.builder()
                    .planId("BLK-AI-2026-9001")
                    .corridor(ndlsCnb)
                    .trackLine("UP_MAIN")
                    .scheduledDate(LocalDate.now().plusDays(1))
                    .windowStart("01:00")
                    .windowEnd("05:30")
                    .durationHours(4.5)
                    .optimizationScore(94.2)
                    .status(BlockPlanStatus.APPROVED)
                    .reasoningJson(reasoningJson1)
                    .affectedTrainsJson(affectedTrains1)
                    .assignedTasksJson(assignedTasks1)
                    .departments("PWAY,TRD")
                    .approvedBy("Rajesh K. Sharma (Chief Controller)")
                    .build();

            String reasoningJson2 = objectMapper.writeValueAsString(List.of(
                Map.of("step", "1", "title", "Task Analysis",
                    "detail", "ST urgent task AC-CNB-12 axle counter calibration (90 min). Single-dept block."),
                Map.of("step", "2", "title", "Optimal Window",
                    "detail", "02:00-03:30 IST on CNB-PRYG DN Main. Zero passenger trains in this 90-min slot."),
                Map.of("step", "3", "title", "Optimization Score",
                    "detail", "Score: 98.7/100. No train impacts. Zero delay. Single-department block — highly efficient.")
            ));

            String affectedTrains2 = objectMapper.writeValueAsString(List.of());

            String assignedTasks2 = objectMapper.writeValueAsString(List.of(
                Map.of("taskId", "TASK-ST-003", "type", "Axle Counter Calibration", "dept", "ST", "durationMin", 90)
            ));

            AiBlockPlan plan2 = AiBlockPlan.builder()
                    .planId("BLK-AI-2026-9002")
                    .corridor(cnbPryg)
                    .trackLine("DN_MAIN")
                    .scheduledDate(LocalDate.now())
                    .windowStart("02:00")
                    .windowEnd("03:30")
                    .durationHours(1.5)
                    .optimizationScore(98.7)
                    .status(BlockPlanStatus.PROPOSED)
                    .reasoningJson(reasoningJson2)
                    .affectedTrainsJson(affectedTrains2)
                    .assignedTasksJson(assignedTasks2)
                    .departments("ST")
                    .approvedBy(null)
                    .build();

            aiBlockPlanRepository.saveAll(List.of(plan1, plan2));
            log.info("[DataSeeder] Inserted 2 AI block plans.");

        } catch (Exception e) {
            log.error("[DataSeeder] Failed to serialize AI block plan JSON: {}", e.getMessage());
        }

        log.info("[DataSeeder] DEMO data seeding complete. RailOpt AI backend is ready.");
    }

    private void seedOfficersIfEmpty() {
        log.info("[DataSeeder] Ensuring 5 authorized Railway Officer accounts are seeded with BCrypt-hashed passwords...");

        List<User> officers = List.of(
                // 1. Administrator
                User.builder()
                        .officerId("OFF-ADMIN-01")
                        .name("Shri A. K. Verma")
                        .department("ADMINISTRATION")
                        .role("ADMIN")
                        .title("Principal Chief Operations Manager (PCOM)")
                        .division("NCR - Prayagraj Division")
                        .passwordHash(passwordEncoder.encode("RailOpt@Admin2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                // 2. Operations / Control Officer
                User.builder()
                        .officerId("OFF-OPS-101")
                        .name("Rajesh K. Sharma")
                        .department("OPERATIONS")
                        .role("OPERATIONS_CONTROL")
                        .title("Chief Controller (Operations)")
                        .division("NCR - Prayagraj Division")
                        .passwordHash(passwordEncoder.encode("RailOpt@Ops2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                // 3. Engineering Officer (P-Way)
                User.builder()
                        .officerId("OFF-ENG-201")
                        .name("Er. Vikram Singh")
                        .department("ENGINEERING")
                        .role("ENGINEERING_OFFICER")
                        .title("Senior Section Engineer (P-Way)")
                        .division("NCR - Prayagraj Division")
                        .passwordHash(passwordEncoder.encode("RailOpt@Eng2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                // 4. Signal & Telecommunication Officer
                User.builder()
                        .officerId("OFF-SIG-301")
                        .name("Er. Priya Sundaram")
                        .department("SIGNAL_AND_TELECOM")
                        .role("ST_OFFICER")
                        .title("Senior Section Engineer (S&T)")
                        .division("NCR - Prayagraj Division")
                        .passwordHash(passwordEncoder.encode("RailOpt@Sig2026"))
                        .accountStatus(AccountStatus.ACTIVE)
                        .failedLoginAttempts(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),

                // 5. Traction Distribution (TRD / OHE) Officer
                User.builder()
                        .officerId("OFF-TRD-401")
                        .name("Er. Amitav Sen")
                        .department("TRACTION_DISTRIBUTION")
                        .role("TRD_OFFICER")
                        .title("Senior Section Engineer (TRD / OHE)")
                        .division("NCR - Prayagraj Division")
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
                        existing.setDivision(officer.getDivision());
                        existing.setPasswordHash(officer.getPasswordHash());
                        existing.setAccountStatus(AccountStatus.ACTIVE);
                        existing.setFailedLoginAttempts(0);
                        existing.setLockedUntil(null);
                        userRepository.save(existing);
                    },
                    () -> userRepository.save(officer)
            );
        }
        log.info("[DataSeeder] Successfully ensured {} authorized officer accounts are ready in database.", officers.size());
    }
}
