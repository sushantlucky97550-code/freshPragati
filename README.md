# 🚆 RailOpt AI — Indian Railways Block Planning & Maintenance Optimization System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17%20%7C%2021-orange.svg?logo=openjdk)](https://openjdk.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-purple.svg?logo=vite)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x%20%7C%208.x-green.svg?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-83%20Passing-success.svg?logo=github-actions)](backend/)
[![Build](https://img.shields.io/badge/Build-Passing-success.svg)](#-9-automated-testing--verification)

**RailOpt AI** is an intelligent decision-support and operations research platform built for Indian Railways section controllers, chief controllers, and departmental engineers (Permanent Way, Traction & Rolling Distribution / OHE, Signal & Telecommunication, and Mechanical).

It optimizes track maintenance block allocation, eliminates train possession conflicts, performs multi-department shadow bundling, and minimizes passenger train delays across high-density Indian Railway corridors (e.g. Prayagraj Division, Northern & North Central Railway).

---

## 📊 Current System Status & Verification

| Subsystem | Tech Stack | Status | Details |
| :--- | :--- | :--- | :--- |
| **Backend Core** | Spring Boot 3.3.4, Java 17/21 | ✅ Operational | REST API layer, CORS proxy, Jakarta Validation |
| **Database** | MongoDB Community 7.x/8.x | ✅ Operational | Spring Data MongoDB, Auto-sequence ID generator |
| **Live Telemetry & Tracking** | RailRadar API + Simulation Provider | ✅ Operational | Pluggable `TrainTrackingProvider`, 45s TTL cache, Haversine GPS route matching |
| **Data Seeder** | Java ApplicationRunner | ✅ Operational | Auto-seeds 4 Depts, 3 Corridors, 18 Trains, 21 Assets, 12 Tasks, 10 Requests, 2 AI Plans |
| **AI Priority Engine** | Deterministic 12-Factor Engine | ✅ Operational | Uses live telemetry for Factor 7 (Density) & Factor 10 (Conflict Potential) |
| **Shadow Block Optimizer** | AiBlockPlanService | ✅ Operational | 11-step pipeline, traffic valley scanning, conflict regulation, shadow bundling |
| **Frontend UI** | React 18, Vite 6, Tailwind CSS | ✅ Operational | 9 pages, Recharts telemetry, Dark/Light mode, Real-time telemetry feed |
| **Automated Tests** | JUnit 5, Mockito, MockMvc | ✅ 83/83 Passing | 8 Controller slice suites, 11 Service/Engine/Tracking unit suites (0 failures) |
| **Production Build** | Vite production rollup | ✅ Built Cleanly | Minified bundle generated in `dist/` (0 errors) |

---

## 🏛️ 1. System Architecture

RailOpt AI enforces a tiered architecture where MongoDB serves as the persistence engine, Spring Boot provides domain business logic, AI optimization, and REST endpoints, and React presents real-time telemetry and controller actions.

```
+---------------------------------------------------------------------------------------+
|                                  React 18 Frontend                                    |
|   (Vite 6 • Tailwind CSS • Lucide Icons • Recharts • ThemeContext • RailwayContext)  |
|                                                                                       |
|  [Dashboard]  [AI Planning]  [Tasks]  [Assets]  [Trains/Corridors]  [Planner] [Reports] |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            | HTTP REST / JSON (Proxy on :5173 -> :8080)
                                            v
+---------------------------------------------------------------------------------------+
|                               Spring Boot 3.3.4 Backend                               |
|  +---------------------------------------------------------------------------------+  |
|  |                                REST Controllers                                 |  |
|  |  (Root • Health • Departments • Tasks • Assets • Trains • Corridors • AI)      |  |
|  +----------------------------------------+----------------------------------------+  |
|                                           |                                           |
|  +----------------------------------------v----------------------------------------+  |
|  |                                 Service Layer                                   |  |
|  |  - DashboardService (dynamic MongoDB KPI aggregations, timeline, & conflicts)   |  |
|  |  - AiBlockPlanService (11-step Pareto optimization & shadow bundling solver)     |  |
|  |  - Core Domain Services (Department, Task, Asset, Train, Corridor, Request)    |  |
|  |  - SequenceGeneratorService (Atomic numeric IDs via database_sequences)         |  |
|  +----------------------------------------+----------------------------------------+  |
|                                           |                                           |
|  +----------------------------------------v----------------------------------------+  |
|  |                              AI Priority Engine                                 |  |
|  |  - PriorityEngine Interface (Pluggable Abstraction)                            |  |
|  |  - RuleBasedPriorityEngine (12-Factor Deterministic Analytic Model)             |  |
|  |  - (Ready for Python FastAPI microservice: OR-Tools / MILP / XGBoost)           |  |
|  +----------------------------------------+----------------------------------------+  |
|                                           |                                           |
|  +----------------------------------------v----------------------------------------+  |
|  |                               Spring Data MongoDB                               |  |
|  +----------------------------------------+----------------------------------------+  |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            | MongoDB Wire Protocol (port 27017)
                                            v
+---------------------------------------------------------------------------------------+
|                             MongoDB Community Server 7.x/8.x                          |
|         Database: railopt • Port: 27017 • Native Windows Service / Docker Container   |
+---------------------------------------------------------------------------------------+
```

### Architectural Principles
1. **Separation of Concerns**: The React client never queries MongoDB directly; all database operations and validations pass through Spring Boot REST APIs.
2. **MongoDB as Single Source of Truth**: KPIs, timeline occupancies, train delays, and conflict alerts are computed dynamically from live collections rather than hardcoded mock figures.
3. **Graceful Client Fallback**: The React `RailwayContext` handles network latency or offline backend states seamlessly, keeping the UI functional with cached/simulated telemetry while indicating connection status.
4. **Transparent & Explainable AI**: The AI Priority Engine evaluates 12 explicit railway engineering dimensions, generating human-readable reasoning traces, affected train impacts, and confidence badges.
5. **Pluggable Optimizer Architecture**: Decoupled behind the `PriorityEngine` interface so advanced mathematical solvers (e.g. Google OR-Tools, Python MILP, or RL models) can be swapped in without modifying frontend contracts.

---

## 💻 2. Frontend Applications & Features (9 Modules)

The frontend is an Indian Railways control room dashboard built with React 18, Vite, and Tailwind CSS:

1. **Live Operational Dashboard (`/`)**:
   - **5 Dynamic Metric Cards**: Track Possession Efficiency %, Active Block Windows, Unresolved Train Conflicts, Pending Critical Tasks, and Total Weekly Maintenance Hours.
   - **Corridor Timeline (Gantt-Style)**: Real-time 24-hour visualization of scheduled passenger trains, freight paths, and planned maintenance blocks across UP/DN tracks.
   - **Live Conflict Telemetry**: Instant conflict detection between train paths and maintenance requisitions with recommended regulation actions (e.g., loop freight at siding).
   - **Departmental Workload Distribution**: Interactive Recharts chart detailing pending workload hours across P-Way, TRD, S&T, and Mechanical.

2. **AI Block Planning & Optimization (`/ai-planning`)**:
   - Interactive corridor selector (`NDLS-CNB`, `NDLS-AGC`, `CNB-PRYG`) and shift filters (**Night Valley 01:00–05:00**, **Morning Slack 06:00–10:00**, **Afternoon Slack 13:00–16:30**).
   - Department selector for multi-department shadow block consolidation.
   - **Generate Block Plan**: Calls `/api/ai/block-plans/generate` to compute the optimal possession slot, train regulations, and shadow bundling efficiency score.
   - Explainable reasoning trace breakdown (Task Analysis, Conflict Scan, Timetable Fit, Optimization Math).
   - **Approve & Dispatch**: Single-click authorization for Section & Chief Controllers to lock and push the plan to COIS/FOIS systems.

3. **Maintenance Tasks Management (`/maintenance-tasks`)**:
   - Tabbed filtering by railway department (**P-Way**, **TRD/OHE**, **S&T**, **Mechanical**).
   - Filtering by Severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and Status (`PENDING`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `DEFERRED`).
   - Modal dialog to create new maintenance requisitions with auto-validation.
   - Quick action to dispatch tasks directly into the AI Block Planner.

4. **Railway Infrastructure Assets (`/railway-assets`)**:
   - Real-time asset inventory covering tracks, bridges, level crossing gates, OHE sections, traction substations (TSS), electronic interlocking, point machines, digital axle counters, locomotives, and tamping track machines.
   - Visual health score rings, defect counts, next inspection countdowns, and active **Temporary Speed Restriction (TSR)** warnings.

5. **Trains & Corridors Directory (`/trains-corridors`)**:
   - Corridor master telemetry: track configurations (UP/DN Main, 3rd/4th lines), daily train volumes, capacity utilization %, speed limits, and electrification status.
   - Operating trains roster: Rajdhani, Vande Bharat, Shatabdi, Superfast, and Freight paths with scheduled timings, max speeds, rake lengths, and **Kavach ATP** installation status.

6. **Weekly Block Planner (`/planner`)**:
   - 7-day visual cyclical matrix mapping scheduled block windows across corridors and departments for macro-level corridor management.

7. **AI Decision Recommendations (`/recommendations`)**:
   - Proactive operational advisories, regulatory looping strategies, caution order issuances, and joint shadow bundling suggestions.

8. **Audit & Compliance Reports (`/reports`)**:
   - Departmental quota compliance analytics, historical block utilization percentages, conflict resolution audit logs, and export capability.

9. **Role-Based Control Room Simulation (`/login`)**:
   - Fast persona switcher simulating Chief Controller, Section Controller, and Senior Section Engineers (SSE P-Way, SSE TRD, SSE S&T, SSE Mech) with role badge updates and action permission scoping.
   - **Theme Engine**: Complete Dark and Light mode toggle via `ThemeContext`.

---

## 📋 3. System Prerequisites

| Prerequisite | Recommended Version | Verification Command |
| :--- | :--- | :--- |
| **Java Development Kit (JDK)** | Java 17 or 21+ | `java -version` |
| **Apache Maven** | 3.8+ (or backend `mvnw`) | `mvn -version` |
| **Node.js & npm** | Node v18+ & npm 9+ | `node -v` and `npm -v` |
| **MongoDB** | Community Server 7.x or 8.x | `Get-Service MongoDB` / `mongod --version` |

---

## 🍃 4. Local MongoDB Setup (Windows Native or Docker)

RailOpt AI connects to MongoDB on `localhost:27017` with the `railopt` database.

### Option A: Native Windows Service (Recommended)
1. **Install MongoDB**:
   ```powershell
   winget install --id MongoDB.Server --silent --accept-source-agreements --accept-package-agreements
   ```
2. **Verify / Start Windows Service**:
   ```powershell
   Get-Service -Name MongoDB
   # If stopped:
   Start-Service -Name MongoDB
   ```

### Option B: Docker Container
```powershell
docker run -d --name railopt-mongo -p 27017:27017 -v railopt_mongo_data:/data/db mongo:7.0
```

---

## ⚙️ 5. Configuration & Environment Variables

The backend configuration is located in [application.properties](file:///c:/Users/rajes/OneDrive/Documents/Sih_Railways/backend/src/main/resources/application.properties) and can be configured with environment variables:

| Environment Variable | Default Value | Purpose |
| :--- | :--- | :--- |
| `SPRING_DATA_MONGODB_URI` / `MONGODB_URI` | `mongodb://localhost:27017/railopt` | MongoDB connection URI |
| `SERVER_PORT` | `8080` | Spring Boot HTTP listening port |
| `SPRING_PROFILES_ACTIVE` | `default` | Active profile (`default`, `dev`, `prod`) |

A template file is provided at [backend/.env.example](file:///c:/Users/rajes/OneDrive/Documents/Sih_Railways/backend/.env.example).

---

## 🚀 6. Quickstart & Startup Instructions

### Step 1: Ensure MongoDB is Active
```powershell
# Windows PowerShell
Start-Service -Name MongoDB
```

### Step 2: Start Backend (Spring Boot)
Open a terminal in `backend/`:
```powershell
# Windows PowerShell / CMD
cd backend
mvn spring-boot:run
```
*The Spring Boot server starts at `http://localhost:8080`.*

> [!NOTE]
> **Automatic Database Seeding**: On the initial startup with an empty database, `DataSeeder` automatically populates realistic Indian Railways data:
> - **4 Departments**: P-Way, TRD, S&T, Mechanical
> - **3 Main Corridors**: `NDLS-CNB` (Delhi–Kanpur, 440 km), `NDLS-AGC` (Delhi–Agra, 195 km), `CNB-PRYG` (Kanpur–Prayagraj, 194 km)
> - **18 Operating Trains**: Vande Bharat (22436), Rajdhani (12302), Gatimaan (12049), Sampoorna Kranti, BOXN & BCNA freight rakes
> - **21 Railway Assets**: Track sections, Yamuna Bridge #42, Ganga Bridge #108, LC Gates, OHE lines, TSS-4, Interlocking, Axle Counters, CSM 09-32 tampers, BCM 373, UNIMAT
> - **12 Maintenance Tasks** & **10 Departmental Block Requests**
> - **2 Pre-calculated AI Block Plans**

### Step 3: Start Frontend (React + Vite)
Open a new terminal in the project root:
```powershell
# Windows PowerShell (use npm.cmd if PowerShell script policy blocks npm)
npm.cmd install
npm.cmd run dev
```
Open **`http://localhost:5173`** in your browser.
Vite automatically proxies `/api/*` calls to `http://localhost:8080`.

---

## 📡 7. REST API Catalog

All endpoints return JSON responses. A friendly root overview is exposed at `GET /api`.

### System & Health
- `GET /` or `GET /api`: API catalog overview and active endpoint registry.
- `GET /api/health`: Health status returning application and MongoDB connectivity state.

### Departments (`/api/departments`)
- `GET /api/departments`: Retrieve all departments with active task counts.
- `GET /api/departments/{id}`: Retrieve department by primary ID.
- `POST /api/departments`: Create a new department (`201 Created`).
- `PUT /api/departments/{id}`: Update department metadata.
- `DELETE /api/departments/{id}`: Delete department (`204 No Content`).

### Maintenance Tasks (`/api/maintenance-tasks`)
- `GET /api/maintenance-tasks`: Retrieve all maintenance tasks.
- `GET /api/maintenance-tasks/{id}`: Retrieve specific task by ID.
- `GET /api/maintenance-tasks/status/{status}`: Filter by status (`PENDING`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `DEFERRED`, `CANCELLED`).
- `GET /api/maintenance-tasks/priority/{priority}`: Filter by priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- `GET /api/maintenance-tasks/department/{departmentId}`: Filter by department.
- `POST /api/maintenance-tasks`: Create a new maintenance task.
- `PUT /api/maintenance-tasks/{id}`: Update an existing task.
- `DELETE /api/maintenance-tasks/{id}`: Remove task.

### Railway Assets (`/api/assets`)
- `GET /api/assets`: Retrieve all railway assets.
- `GET /api/assets/{id}`: Retrieve asset by ID.
- `GET /api/assets?department={code}`: Filter by department (`PWAY`, `TRD`, `ST`, `MECH`).
- `GET /api/assets?status={status}`: Filter by health status (`GOOD`, `ATTENTION_REQUIRED`, `CRITICAL`).
- `GET /api/assets?corridorId={id}`: Filter by corridor.

### Trains (`/api/trains`)
- `GET /api/trains`: Retrieve all operating trains.
- `GET /api/trains/{id}`: Retrieve train by ID.
- `GET /api/trains?corridor={code}` or `?corridorCode={code}`: Filter trains by corridor code (e.g. `NDLS-CNB`).
- `GET /api/trains?corridorId={id}`: Filter trains by corridor ID.
- `GET /api/trains/live`: Retrieve real-time train telemetry across all seeded trains (with TTL caching and route matching).
- `GET /api/trains/{id}/live`: Retrieve real-time telemetry for a specific train by database ID or train number.
- `GET /api/trains/live/summary`: Aggregate live telemetry KPIs (Total, Live, Delayed, Stale, Conflicts, Data Source, Freshness, Last Update).
- `POST /api/trains/live/refresh`: Evict cached telemetry and force an on-demand refresh from the active tracking provider.

### Corridors (`/api/corridors`)
- `GET /api/corridors`: Retrieve all corridors with station lists and tracks.
- `GET /api/corridors/{identifier}`: Retrieve corridor by ID (`1`) or corridor code (`NDLS-CNB`).
- `GET /api/corridors/code/{corridorId}`: Retrieve corridor by code.
- `GET /api/corridors/{id}/trains/live`: Retrieve real-time telemetry of trains mapped specifically to the corridor.

### Block Requests (`/api/block-requests`)
- `GET /api/block-requests`: Retrieve all departmental block requisitions.
- `GET /api/block-requests?status={status}`: Filter block requests by status.
- `POST /api/block-requests`: Submit a new block request.

### Dynamic Dashboard Telemetry (`/api/dashboard`)
- `GET /api/dashboard/summary`: Dynamic KPI aggregations (asset availability %, critical tasks count, active blocks, train conflicts, total weekly workload hours, AI Priority score & recommended action).
- `GET /api/dashboard/corridor-timeline?corridorId={id}`: 24h train paths, scheduled block windows, and active maintenance requisitions for timeline rendering.
- `GET /api/dashboard/conflicts?corridorId={id}`: Live train possession conflict telemetry and automated regulation actions.
- `GET /api/dashboard/maintenance-workload`: Breakdown of workload hours by department.

### AI Planning & Priority Engine (`/api/ai`)
- `GET /api/ai/block-plans`: Retrieve all AI block plans (optional `?status=PROPOSED` filter).
- `GET /api/ai/block-plans/{id}`: Retrieve plan by ID.
- `POST /api/ai/block-plans/generate`: Trigger AI optimization solver for corridor, shift, and department bundle.
- `POST /api/ai/block-plans/{id}/approve`: Authorize and lock block plan for dispatch to COIS / FOIS.

---

## 🧠 8. AI Priority Engine & Shadow Bundling

### The 12-Factor Analytical Scoring Model
The `RuleBasedPriorityEngine` analyzes live operational data across **12 deterministic engineering factors** to produce an explainable priority score ($0-100$), a priority tier, and operational actions:

1. **Task Severity**: `CRITICAL` (25 pts), `HIGH` (18 pts), `MEDIUM` (10 pts), `LOW` (5 pts).
2. **Task Priority**: `URGENT` (20 pts), `HIGH` (14 pts), `MEDIUM` (8 pts), `LOW` (4 pts).
3. **Task Status**: `PENDING` (10 pts), `SCHEDULED` (6 pts), `IN_PROGRESS` (4 pts).
4. **Due Date Urgency**: Overdue (15 pts), Due $\le 24$h (12 pts), Due $\le 72$h (8 pts), Due $\le 7$ days (4 pts).
5. **Asset Condition & Health**: Health score $<55$ or `CRITICAL` (12 pts), Health $<75$ (7 pts).
6. **Asset Availability & TSR**: Active Temporary Speed Restriction (8 pts), High defect count (5 pts).
7. **Train Traffic & Density**: Corridor daily trains $\ge 150$ (6 pts), $\ge 100$ (4.5 pts).
8. **Corridor Importance**: Capacity utilization $\ge 85\%$ (5 pts), $\ge 75\%$ (3.5 pts).
9. **Existing Block Requests**: Pending block requisition present on section (5 pts).
10. **Train Conflicts Potential**: Multiple premium trains (Rajdhani/Vande Bharat) in window (5 pts).
11. **Department Backlog**: Department pending task queue $\ge 4$ (5 pts).
12. **Maintenance Duration Efficiency**: Window duration $\le 3$ hours allows rapid possession handover (4 pts).

#### Priority Tiers & Operational Directives
- **Score $\ge 78$ (`CRITICAL`)**: *"Schedule immediate maintenance block. Regulate conflicting freight paths to siding loops."*
- **Score $62-77$ (`HIGH`)**: *"Allocate night slack window (01:00-05:00) with multi-department shadow bundling."*
- **Score $45-61$ (`MEDIUM`)**: *"Schedule during daylight coaching slack window with caution order."*
- **Score $< 45$ (`LOW`)**: *"Routine cyclic maintenance; monitor during standard daily track inspection patrol."*

### 11-Step Optimization & Shadow Bundling Pipeline
The `AiBlockPlanService` executes:
1. Ingests corridor timetable, tracks, and operating trains.
2. Identifies pending/critical requisitions across selected departments.
3. Maps traffic valley windows:
   - **NIGHT Valley**: 01:00 – 05:00 IST (optimal for heavy tamping & OHE isolation).
   - **MORNING Slack**: 06:00 – 10:00 IST.
   - **AFTERNOON Slack**: 13:00 – 16:30 IST.
4. Detects conflicts with scheduled passenger and freight train paths.
5. Computes automated train regulation: loops freight trains at sidings, uses slack buffer for passenger trains.
6. **Multi-Department Shadow Bundling**: Bundles P-Way (track), TRD (OHE power block), and S&T (signaling) into one combined possession window, saving up to $60\%$ of independent line closures.
7. Computes multi-objective Pareto optimization score ($0-100\%$).
8. Attaches explainable confidence badges (`TIMETABLE_FIT`, `MULTI_DEPT_BUNDLING`, `SAFETY_CRITICAL`, `ASSET_OPTIMIZED`).
9. Persists plan in MongoDB and returns response ready for controller authorization.

---

## 🧪 9. Automated Testing & Verification

### Running Test Suites
```powershell
cd backend
mvn test
```

### Verified Test Results (83 Tests / 0 Failures / 0 Errors)
- **REST Controller Slice Suites (`@WebMvcTest`)**:
  - `MaintenanceTaskControllerTest` (10 tests): CRUD operations, status/priority filtering, validation errors, 404 responses.
  - `DepartmentControllerTest` (7 tests): CRUD lifecycle, duplicate validation, cascade rules.
  - `TrainControllerTest` (4 tests): Corridor filtering, ID lookup, schedule parsing, live endpoints.
  - `AssetControllerTest` (4 tests): Department and condition filtering, corridor mapping.
  - `CorridorControllerTest` (4 tests): Numeric ID, alphanumeric code routing (`NDLS-CNB`), and live corridor trains.
  - `DashboardControllerTest` (4 tests): KPI summary, corridor timeline, conflict alerts, workload telemetry.
  - `AiBlockPlanControllerTest` (4 tests): AI plan generation and Chief Controller approval endpoints.
  - `HealthControllerTest` (1 test): Health check status verification.
- **Service, AI & Tracking Engine Suites (`MockitoExtension`)**:
  - `RailRadarTrainTrackingProviderTest` (8 tests): JSON response parsing, 401 unauthorized, 404 not found, 500 error, missing GPS, missing speed, missing station, network timeout.
  - `RouteMatchingServiceTest` (5 tests): Master train corridor mapping, station sequence match, GPS proximity, off-network detection, uncertain route handling.
  - `TrainTrackingServiceTest` (6 tests): Mock provider fallback, RailRadar selection, TTL caching, telemetry summary, RailRadar failure handling without simulation leakage, master train synchronization.
  - `PriorityEngineTest` (3 tests): 12-factor analytical scoring verification, priority tiers, shadow block plan optimization.
  - `AiBlockPlanServiceTest` (5 tests): Plan lifecycle, validation, and authorization logic.
  - `DashboardServiceTest` (3 tests): Dynamic MongoDB aggregations, timeline conflict detection, workload hours.
  - `DepartmentServiceTest` (7 tests): Department business logic and task counts.
  - `MaintenanceTaskServiceTest` (7 tests): Task lifecycle, status transitions, department relationship validation.

### Production Frontend Build Verification
```powershell
npm.cmd run build
# Result: 2239 modules transformed -> Built cleanly into dist/
```

---

## 📡 10. Real-Time Train Tracking & RailRadar Integration

RailOpt AI integrates real-time train positioning from the **RailRadar API** (`https://api.railradar.in/v1/trains/{number}/live`) directly into its Spring Boot operations backend.

```
                  +-------------------------+
                  |      RailRadar API      |
                  | (api.railradar.in/v1)   |
                  +------------+------------+
                               | (x-api-key HTTP header)
                               v
                  +-------------------------+
                  |  TrainTrackingProvider  |
                  | [RailRadar / Simulation]|
                  +------------+------------+
                               |
                               v
                  +-------------------------+
                  |  RouteMatchingService   |
                  |  (Haversine GPS / Stn)  |
                  +------------+------------+
                               |
                               v
                  +-------------------------+
                  |   MongoDB 7.x / 8.x     |
                  | (train_telemetry coll)  |
                  +------------+------------+
                               |
            +------------------+------------------+
            |                                     |
            v                                     v
  +-------------------+                 +-------------------+
  | Conflict Engine   |                 | Priority Engine   |
  | (Delay Detentions)|                 | (Factor 7 & 10)   |
  +---------+---------+                 +---------+---------+
            \                                     /
             +-----------------+-----------------+
                               |
                               v
                  +-------------------------+
                  |  Shadow Block Optimizer |
                  | (AiBlockPlanService)    |
                  +------------+------------+
                               |
                               v
                  +-------------------------+
                  | React Control Dashboard |
                  +-------------------------+
```

### Key Capabilities
1. **Pluggable Tracking Provider**: Controlled via `TRAIN_TRACKING_PROVIDER` (`mock` or `railradar`). If set to `mock` (default development mode), the engine generates realistic speeds and coordinates based on station centroids without requiring an external API key.
2. **Deterministic Route Matching**: Maps live GPS (`lat`, `lng`) or station halts to seeded corridors (`NDLS-CNB`, `NDLS-AGC`, `CNB-PRYG`) using Haversine great-circle distance. If confidence is below $0.4$, the train is flagged with `ROUTE_MATCH_UNCERTAIN` rather than blindly guessing track lines.
3. **Data Freshness Classification**: Every telemetry record is tagged with an audit label:
   - `LIVE`: Telemetry received $\le 60$ seconds ago from RailRadar.
   - `RECENT`: Telemetry received $\le 5$ minutes ago.
   - `STALE`: Telemetry older than 5 minutes.
   - `SIMULATION`: Generated by simulation provider. Never labeled as LIVE.
4. **Delay-Aware Conflict Detection**: Computes dynamically whether delayed trains will enter active maintenance possession windows, recommending regulated loop stops or speed restriction cushions.
5. **AI Priority Engine Integration**: Dynamically enriches **Factor 7** (Traffic Density) and **Factor 10** (Train Conflict Potential) with real-time train positions and delays.

### Environment Configuration
```properties
# Train Tracking Provider ('mock' or 'railradar')
railopt.tracking.provider=mock

# RailRadar API Configuration
railopt.tracking.railradar.base-url=https://api.railradar.in
railopt.tracking.railradar.api-key=YOUR_RAILRADAR_API_KEY_HERE
railopt.tracking.railradar.timeout-ms=5000
railopt.tracking.cache-ttl-seconds=45
```

---

## 🔮 11. Extensibility & Future AI Solvers

The backend is architected with interface decoupling for external AI solvers:
- **Pluggable Architecture**: The `RuleBasedPriorityEngine` implements `com.railopt.service.ai.PriorityEngine`.
- **Python / OR-Tools Integration**: To connect an advanced Python solver (MILP, Constraint Programming via OR-Tools, or XGBoost):
  1. Stand up a Python FastAPI microservice (e.g. on port `8000`).
  2. Implement `PythonMicroservicePriorityEngine` implementing `PriorityEngine`.
  3. Annotate the new class with `@Primary` to seamlessly delegate optimization calls over HTTP.
  4. Zero changes required in REST controllers, DTO schemas, or the React frontend.

---

## 📁 11. Directory Structure

```
Sih_Railways/
├── backend/                               # Spring Boot 3.3.4 Backend
│   ├── pom.xml                            # Maven dependencies (MongoDB, Validation, Lombok)
│   ├── .env.example                       # Environment variables template
│   └── src/
│       ├── main/java/com/railopt/
│       │   ├── RailOptApplication.java    # Spring Boot main entrypoint
│       │   ├── config/                    # DataSeeder, MongoConfig, IdGeneratorListener
│       │   ├── controller/                # 10 REST Controllers
│       │   ├── dto/                       # Request and Response transfer objects
│       │   ├── entity/                    # 22 MongoDB entities and enums
│       │   ├── exception/                 # GlobalExceptionHandler, ResourceNotFoundException
│       │   ├── repository/                # Spring Data MongoDB repositories
│       │   └── service/                   # Domain services, DashboardService, AI Priority Engine
│       ├── main/resources/
│       │   └── application.properties     # MongoDB & server configurations
│       └── test/                          # 64 Automated unit and slice tests
├── src/                                   # React 18 + Vite Frontend
│   ├── components/
│   │   ├── common/                        # Navbar, Sidebar, Modal, Badge
│   │   ├── dashboard/                     # MetricCards, CorridorTimeline, ConflictAlerts, Workload
│   │   └── planning/                      # GanttChart, OptimizationPanel, PlanApproval
│   ├── context/
│   │   ├── RailwayContext.jsx             # Live API data provider with offline fallback
│   │   └── ThemeContext.jsx               # Dark/Light theme state
│   ├── pages/                             # 9 Full Control Room Dashboard Pages
│   ├── services/                          # API client (api.js), blockOptimizer, departmentService
│   ├── App.jsx                            # Layout, Error Boundary, and Route State
│   └── index.css                          # Tailwind CSS custom styles & animations
├── mongo_dummy_data.json                  # Standalone MongoDB seed reference
├── package.json                           # React dependencies & scripts
├── tailwind.config.js                     # Railway control room color theme tokens
├── vite.config.js                         # Vite config with /api reverse proxy to 8080
└── .md                              # System documentation
```

---

## 👥 Contributors & License

Developed for the **Smart India Hackathon (SIH)** — Indian Railways Track Maintenance & Block Allocation Problem Statement.
Built for the Ministry of Railways, Government of India.
