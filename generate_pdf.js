const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 60, size: 'A4' });
doc.pipe(fs.createWriteStream('VehicleTelemetry_Demo_Script.pdf'));

const PW = doc.page.width - 120; // usable width

// ─── tiny helpers ────────────────────────────────────────────────────────────

function addPage() { doc.addPage(); }

function gap(n = 0.4) { doc.moveDown(n); }

function coverLine(text, y, size, color, bold) {
  doc.fillColor(color).font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(size);
  doc.text(text, 60, y, { width: PW, align: 'center' });
}

// big dark banner heading
function H1(text) {
  gap(0.6);
  const y = doc.y;
  doc.rect(60, y, PW, 30).fill('#1a1a2e');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(14);
  doc.text(text, 68, y + 8, { width: PW - 16 });
  doc.fillColor('#111111');
  gap(0.5);
}

// blue sub-heading
function H2(text) {
  gap(0.5);
  doc.fillColor('#1a73e8').font('Helvetica-Bold').fontSize(12);
  doc.text(text, 60, doc.y);
  doc.moveTo(60, doc.y).lineTo(60 + PW, doc.y).lineWidth(1).strokeColor('#1a73e8').stroke();
  doc.fillColor('#111111').font('Helvetica').fontSize(11);
  gap(0.3);
}

// italic quoted speech block
function QUOTE(text) {
  const x = 72, qW = PW - 12, sy = doc.y;
  doc.fillColor('#444444').font('Helvetica-Oblique').fontSize(11);
  doc.text(text, x, sy, { width: qW });
  doc.rect(60, sy, 4, doc.y - sy).fill('#1a73e8');
  doc.fillColor('#111111').font('Helvetica').fontSize(11);
  gap(0.4);
}

// normal paragraph
function P(text, indent = 0) {
  doc.fillColor('#111111').font('Helvetica').fontSize(11);
  doc.text(text, 60 + indent, doc.y, { width: PW - indent });
  gap(0.25);
}

// bullet point
function B(text, indent = 0) {
  const bx = 72 + indent, tx = bx + 10, by = doc.y + 5.5;
  doc.circle(bx, by, 2.5).fill('#1a73e8');
  doc.fillColor('#111111').font('Helvetica').fontSize(11);
  doc.text(text, tx, doc.y, { width: PW - (tx - 60) });
  gap(0.2);
}

// sub-bullet (dash)
function SB(text) {
  const bx = 90, tx = bx + 10, by = doc.y + 6;
  doc.rect(bx, by, 6, 1.5).fill('#888888');
  doc.fillColor('#444444').font('Helvetica').fontSize(10.5);
  doc.text(text, tx, doc.y, { width: PW - (tx - 60) });
  gap(0.15);
}

// bold inline label + normal text
function BL(label, text) {
  doc.fillColor('#111111').font('Helvetica-Bold').fontSize(11);
  const lw = doc.widthOfString(label + '  ');
  doc.text(label, 60, doc.y, { continued: true, width: lw });
  doc.font('Helvetica').text('  ' + text, { width: PW - lw });
  gap(0.2);
}

// monospaced code block
function CODE(lines) {
  gap(0.2);
  const lh = 13, pad = 10, bh = lines.length * lh + pad * 2;
  const sy = doc.y;
  doc.rect(60, sy, PW, bh).fill('#f5f5f5').lineWidth(0.5).strokeColor('#cccccc').stroke();
  doc.fillColor('#222222').font('Courier').fontSize(9);
  lines.forEach((l, i) => doc.text(l, 70, sy + pad + i * lh, { width: PW - 20, lineBreak: false }));
  doc.y = sy + bh + 6;
  doc.fillColor('#111111').font('Helvetica').fontSize(11);
  gap(0.3);
}

// timing table
function TABLE(rows) {
  const c1 = PW * 0.68, c2 = PW * 0.32, rh = 22, sx = 60;
  let ty = doc.y;
  // header
  doc.rect(sx, ty, PW, rh).fill('#1a73e8');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11);
  doc.text('Section', sx + 8, ty + 6, { width: c1 });
  doc.text('Time', sx + c1 + 8, ty + 6, { width: c2 });
  ty += rh;
  rows.forEach(([s, t], i) => {
    const isTot = s.startsWith('Total');
    doc.rect(sx, ty, PW, rh).fill(i % 2 === 0 ? '#eef2ff' : '#ffffff');
    doc.moveTo(sx, ty).lineTo(sx + PW, ty).lineWidth(0.3).strokeColor('#cccccc').stroke();
    doc.fillColor(isTot ? '#1a73e8' : '#111111').font(isTot ? 'Helvetica-Bold' : 'Helvetica').fontSize(11);
    doc.text(s, sx + 8, ty + 6, { width: c1 });
    doc.text(t, sx + c1 + 8, ty + 6, { width: c2 });
    ty += rh;
  });
  doc.rect(sx, doc.y, PW, ty - doc.y).lineWidth(0.8).strokeColor('#cccccc').stroke();
  doc.y = ty + 8;
  doc.fillColor('#111111').font('Helvetica').fontSize(11);
}

// page numbers (called at very end)
function pageNumbers() {
  const range = doc.bufferedPageRange();
  for (let i = 1; i < range.count; i++) { // skip cover (page 0)
    doc.switchToPage(range.start + i);
    doc.fillColor('#999999').font('Helvetica').fontSize(9);
    doc.text(`Page ${i}`, 60, doc.page.height - 40, { width: PW, align: 'center' });
  }
}

// ─── COVER ───────────────────────────────────────────────────────────────────
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f3460');
coverLine('Vehicle Telemetry', 180, 30, '#ffffff', true);
coverLine('Monitoring System', 218, 30, '#ffffff', true);
coverLine('15-Minute Demo Script  ·  STAR Technique', 278, 15, '#a8c8ff', false);
doc.moveTo(130, 310).lineTo(doc.page.width - 130, 310).lineWidth(1).strokeColor('#a8c8ff').stroke();
coverLine('ASP.NET Core 8  ·  React 19  ·  SQL Server  ·  JWT  ·  EF Core  ·  Recharts', 324, 11, '#dddddd', false);
coverLine('Interview Presentation Guide', 360, 11, '#aaaaaa', false);
addPage();

// ─── OPENING ─────────────────────────────────────────────────────────────────
H1('OPENING  (1 min)  —  Set the Stage');
QUOTE(
  '"Let me walk you through a full-stack project I built called the Vehicle Telemetry Monitoring System. ' +
  'I\'ll take you through the problem I was solving, the architecture I designed, every technical decision I made, ' +
  'and a live walkthrough of the working product."'
);

// ─── SITUATION ───────────────────────────────────────────────────────────────
H1('SITUATION  (1.5 min)  —  Why Does This Project Exist?');
QUOTE(
  '"The situation is this: Fleet management companies — think logistics, cab aggregators, delivery fleets — ' +
  'need real-time visibility into their vehicles. Without it, they can\'t detect engine faults early, can\'t track ' +
  'overspeeding drivers, and can\'t generate compliance reports.\n\n' +
  'The problem I set out to solve: Build a production-grade platform where:\n' +
  '  •  Telemetry data (speed, engine temperature, GPS) flows in continuously from vehicles\n' +
  '  •  Operators can monitor dashboards in real-time\n' +
  '  •  Managers have role-restricted access — admins can manage data, viewers can only read it\n' +
  '  •  The system raises intelligent alerts when things go wrong"'
);

// ─── TASK ────────────────────────────────────────────────────────────────────
H1('TASK  (1 min)  —  What I Built');
QUOTE('"My task was to design and build this end-to-end. That means:"');
B('A RESTful backend API in ASP.NET Core .NET 8 with JWT authentication and role-based access control');
B('A SQL Server database with Entity Framework Core for persistence');
B('A background data simulator that generates realistic telemetry');
B('A React frontend with live dashboards, analytics, alerts, and reports');

addPage();

// ─── ACTION PART 1 ───────────────────────────────────────────────────────────
H1('ACTION — Part 1: Database Design  (1 min)');
QUOTE('"I\'ll start at the foundation — the database. I have three tables."');

H2('Users Table');
P('"Users stores credentials with BCrypt-hashed passwords and a Role column — either Admin or Viewer."');
B('UserId (PK), Username (unique), Email (unique), PasswordHash, CreatedAt, Role');
B('Default role on registration: Viewer');
B('Unique indexes on Email and Username');

H2('Vehicles Table');
B('VehicleId (PK), Name, LicensePlate, CreatedAt');
B('One Vehicle → many VehicleReadings (1:N relationship)');

H2('VehicleReadings Table');
P('"Every 30 seconds, a reading is inserted for each vehicle."');
B('ReadingId (PK), VehicleId (FK), Speed (km/h), EngineTemp (°C), Lat, Lon, Timestamp (UTC)');
B('Composite index on (VehicleId, Timestamp) — almost every query filters by vehicle and time range');
SB('This makes time-range queries dramatically faster on large datasets');
B('Schema auto-migrates on startup via EF Core — zero manual setup');

// ─── ACTION PART 2 ───────────────────────────────────────────────────────────
H1('ACTION — Part 2: Background Simulator  (45 sec)');
QUOTE(
  '"Since I can\'t attach real IoT hardware for a demo, I built a SimulatorBackgroundService — ' +
  'an ASP.NET hosted service that runs as a background thread alongside the API."'
);
B('Runs as IHostedService — starts automatically when the app starts');
B('Executes every 30 seconds in an infinite background loop');
B('On each tick: loops over every vehicle in the database');
B('Generates Speed: 40–120 km/h (random)');
B('Generates EngineTemp: 75–105°C (random)');
B('GPS coordinates plotted along a real route through Chennai using 6 fixed waypoints');
B('Small random perturbations added to simulate natural GPS drift');
B('Writes readings directly to the database — this is what drives all real-time charts');

addPage();

// ─── ACTION PART 3 ───────────────────────────────────────────────────────────
H1('ACTION — Part 3: Authentication Flow  (1.5 min)');
QUOTE('"Let me walk through the authentication flow step by step."');

H2('Registration — POST /api/auth/register');
B('AuthService.RegisterAsync validates email and username uniqueness against the database');
B('If the requested role is Admin, the request must also include a secret admin code from appsettings.json');
SB('This prevents privilege escalation — you cannot just claim to be an admin');
SB('Admin code is stored under RoleCodes:Admin = "adm@2025" in config');
B('Password is hashed using BCrypt before being stored — plaintext never persisted');
B('Returns 201 Created or 409 Conflict if email/username already exists');

H2('Login — POST /api/auth/login');
B('AuthService.LoginAsync looks up the user by email');
B('Calls BCrypt.Verify to check the password against the stored hash');
B('On success, calls GenerateToken(user)');

H2('JWT Token — GenerateToken');
B('Algorithm: HS256 with symmetric key from Jwt:Key in appsettings.json');
B('Claims embedded in token: Sub (UserId), Email, UniqueName (Username), Jti (unique ID), Role');
B('Expiry: 24 hours — configurable via Jwt:ExpiryHours in config');
B('Token validated on every request: signature, expiry, issuer, and audience all checked');

H2('Frontend Token Handling');
B('React AuthContext receives the token → stores it in localStorage');
B('Axios request interceptor automatically adds Authorization: Bearer {token} to every call');
SB('No page has to manually pass the token — it\'s handled centrally');
B('On page refresh, token is rehydrated from localStorage — user stays logged in');

addPage();

// ─── ACTION PART 4 ───────────────────────────────────────────────────────────
H1('ACTION — Part 4: RBAC — Role-Based Access Control  (1 min)');
QUOTE(
  '"The two roles — Admin and Viewer — control what you can do. Every vehicle and reading endpoint ' +
  'is decorated with [Authorize], which means an unauthenticated request gets a 401 immediately."'
);

H2('Admin Role');
B('Can create, update, and delete vehicles and readings');
B('Can add readings manually via the API');
B('Registration requires the secret admin code from config');

H2('Viewer Role');
B('Can read all data: vehicles, readings, summaries, analytics');
B('Cannot perform any write, update, or delete operations — gets 403 Forbidden');
B('Default role assigned to every new registration');

H2('Two-Layer Enforcement');
B('Backend: [Authorize(Roles="Admin")] attribute on each write action');
SB('Unauthenticated → 401. Wrong role → 403. No exceptions.');
B('Frontend: canEdit() helper from AuthContext hides admin-only UI elements for Viewers');
SB('Viewers never see the Create / Edit / Delete buttons — clean UX, not just blocked API calls');

addPage();

// ─── ACTION PART 5 ───────────────────────────────────────────────────────────
H1('ACTION — Part 5: API Endpoints & Controller Layer  (1 min)');
QUOTE('"There are three controllers."');

H2('AuthController — /api/auth  (no auth required)');
BL('POST /register', '— Create new user account (validates uniqueness + admin code gate)');
BL('POST /login', '— Authenticate user, returns JWT token');

H2('VehiclesController — /api/vehicles  (all require [Authorize])');
BL('GET  /', '— Get all vehicles  (any role)');
BL('GET  /{id}', '— Get single vehicle  (any role)');
BL('POST /', '— Create vehicle  (Admin only)');
BL('PUT  /{id}', '— Update vehicle name/license plate  (Admin only)');
BL('DELETE /{id}', '— Delete vehicle  (Admin only)');
BL('GET  /{id}/summary', '— Peak speed, avg engine temp, total readings, last seen  (any role)');
BL('GET  /top5-speed-today', '— Top 5 vehicles by peak speed today  (any role)');

H2('ReadingsController — /api/vehicles/{vehicleId}/readings  ([Authorize])');
BL('GET  /', '— Readings with optional ?from= and ?to= date filters  (any role)');
BL('GET  /latest', '— Most recent reading for a vehicle  (any role)');
BL('POST /', '— Add a reading  (Admin only)');
BL('DELETE /{readingId}', '— Delete a reading  (Admin only)');
BL('GET  /avg-engine-temp-per-hour', '— Hour-bucketed averages — powers the dashboard bar chart  (any role)');

gap(0.3);
P('Performance note: All read-only queries use AsNoTracking() to skip EF change-tracking overhead on read-only paths.');

addPage();

// ─── ACTION PART 6 ───────────────────────────────────────────────────────────
H1('ACTION — Part 6: Frontend Architecture  (1 min)');
QUOTE(
  '"The React app is served by Vite with a dev proxy — all /api calls are transparently forwarded ' +
  'to https://localhost:7065 (the backend). The frontend never hard-codes a backend URL."'
);

H2('Core Structure');
BL('App.jsx', '— Main layout with sidebar navigation and React Router route-based pages');
BL('AuthContext.jsx', '— Global auth state: token, username, email, role, expiry — persisted in localStorage');
BL('services/api.js', '— Centralized Axios instance with request interceptor that adds the Bearer token');

H2('Pages');
BL('Dashboard', '— Real-time fleet overview with 15-second auto-refresh');
BL('Alerts', '— Alert detection and management with acknowledge/resolve workflow');
BL('Analytics', '— Trend charts + custom CSS/SVG GPS map');
BL('Reports', '— Summary and top-speed reports with CSV export');
BL('Vehicles', '— Admin-only CRUD management page');
BL('About', '— Project info page');

H2('State Management');
B('React hooks only: useState, useEffect, useContext — no Redux or external state library');
B('AuthContext provides: login(), logout(), isAdmin(), isViewer(), canEdit()');
B('All pages call through api.js — no scattered fetch() calls across components');

// ─── ACTION PART 7 ───────────────────────────────────────────────────────────
H1('ACTION — Part 7: Dashboard — Live Demo Walkthrough  (1.5 min)');
QUOTE('"The Dashboard is the heart of the app. Let me walk through what you are seeing."');

B('Auto-refreshes every 15 seconds — live countdown timer shows exactly when the next refresh fires');
B('On load, all data is fetched in parallel: latest readings + summaries + top-5 simultaneously');

H2('UI Sections Top to Bottom');
BL('Stat Cards', '— Active vehicle count, fleet peak speed, and alert count');
BL('SVG Radial Gauges', '— Engine temp per vehicle; the arc fills and changes color green → orange → red based on thresholds');
BL('Speed Trend Charts', '— Last 20 readings per vehicle plotted over time using Recharts line chart');
BL('Vehicle Status', '— Computed client-side from data freshness:');
SB('Online: last reading < 5 minutes ago');
SB('Warning: last reading 5–15 minutes ago');
SB('Offline: last reading > 15 minutes ago — no manual status flags needed');
BL('Hourly Bar Chart', '— Avg engine temp per hour from the /avg-engine-temp-per-hour endpoint');
BL('Top-5 Leaderboard', '— Peak speed ranking today from the /top5-speed-today endpoint');

addPage();

// ─── ACTION PART 8 ───────────────────────────────────────────────────────────
H1('ACTION — Part 8: Alerts, Analytics & Reports  (1 min)');

H2('Alerts Page');
QUOTE('"The Alerts page evaluates every vehicle\'s latest reading client-side against defined thresholds."');
BL('Engine overheating', '— > 100°C → Critical, 95–100°C → Warning, 90–95°C → Info');
BL('Overspeed', '— > 115 km/h → Critical, > 100 km/h → Warning');
BL('Vehicle offline', '— No data for > 15 minutes → Offline alert');
B('Alert statuses: Active → Acknowledge → Resolve → Re-open');
B('Filterable by severity (Critical / Warning / Info) and by status');
B('Sortable by time (newest / oldest)');

H2('Analytics Page');
BL('Time range selector', '— 24h, 7d, 30d views');
BL('Trend line charts', '— Avg speed over time, Avg engine temp over time');
BL('Custom GPS Map', '— No third-party map library; built entirely with CSS and SVG:');
SB('Pulsing pins at each vehicle\'s last known GPS position');
SB('Grid background with compass rose');
SB('Hover tooltips showing lat/lon coordinates');
SB('Live position updates every 10 seconds');

H2('Reports Page');
BL('Vehicle Summary Report', '— All vehicles with readings count, peak speed, current speed, temp, status');
BL('Top Speed Report', '— Top 5 vehicles for today');
B('CSV export with one click — filename auto-includes report title and date');

// ─── ACTION PART 9 ───────────────────────────────────────────────────────────
H1('ACTION — Part 9: Vehicles Page — Admin-Only CRUD  (30 sec)');
QUOTE(
  '"The Vehicles page is visible only to Admins — the sidebar link itself is hidden by canEdit(). ' +
  'Viewers never see this page at all."'
);
B('Vehicle grid cards showing name and license plate');
B('Add vehicle: modal form → POST /api/vehicles (name + license plate)');
B('Edit vehicle: modal form → PUT /api/vehicles/{id} (update name/plate)');
B('Delete vehicle: confirmation modal → DELETE /api/vehicles/{id}');
B('Role-aware UI: Viewers cannot see or reach this page from any route');

addPage();

// ─── RESULT ───────────────────────────────────────────────────────────────────
H1('RESULT  (1.5 min)  —  What This Demonstrates');

H2('Security');
B('BCrypt password hashing — plaintext passwords never stored anywhere');
B('JWT with role claims — every request validated: signature, expiry, issuer, audience');
B('Admin code-gated privilege escalation — users cannot self-promote to Admin');
B('RBAC enforced at both the API attribute level and the frontend UI level');

H2('Real-Time Data');
B('Background service continuously generating telemetry on a 30-second interval');
B('Frontend polling with smart intervals: 15 seconds for dashboard, 10 seconds for GPS map');
B('Vehicle status derived dynamically from data freshness — no manual status flags');

H2('Performance Thinking');
B('Composite DB index on (VehicleId, Timestamp) for fast time-range queries');
B('EF Core AsNoTracking() on all read-only queries — no change-tracking overhead');
B('Parallel API calls on every page load — no waterfall of sequential requests');

H2('Clean Architecture');
B('Controllers only handle HTTP routing — zero business logic inside them');
B('All business logic lives in Services: AuthService, VehicleService');
B('Data access isolated in TelemetryDbContext');
B('Frontend auth centralized in one context + one Axios interceptor');

H2('UX Quality');
B('Role-aware UI — your role controls what you see, not just what you can do');
B('Loading states, error banners, confirmation modals throughout');
B('Dark / light mode toggle stored in localStorage');
B('CSV reports with auto-generated filenames');
B('No heavy UI framework — custom CSS + Recharts only');

gap(0.4);
QUOTE(
  '"This is a project I can deploy, extend, and maintain. If you\'d like, I can go deeper into any specific layer — ' +
  'the JWT flow, the EF schema, the simulator logic, or any frontend component."'
);

addPage();

// ─── CONTROL FLOW DIAGRAM ────────────────────────────────────────────────────
H1('Control Flow Diagram');
P('Speak through this step-by-step when showing the live application:');
gap(0.3);

CODE([
  '┌──────────────────────────────────────────────────────────────────────┐',
  '│                       AUTHENTICATION FLOW                            │',
  '└──────────────────────────────────────────────────────────────────────┘',
  '',
  ' [User] ──► POST /api/auth/login',
  '                   │',
  '                   ▼',
  '        AuthController.Login()',
  '                   │',
  '                   ▼',
  '        AuthService.LoginAsync()',
  '          ├─ Look up User by Email in DB',
  '          ├─ BCrypt.Verify(password, hash)',
  '          └─ GenerateToken(user)  →  JWT with Role claim embedded',
  '                   │',
  '                   ▼',
  ' [React AuthContext] ──► Store token in localStorage',
  '',
  '┌──────────────────────────────────────────────────────────────────────┐',
  '│                     EVERY SUBSEQUENT REQUEST                         │',
  '└──────────────────────────────────────────────────────────────────────┘',
  '',
  ' [React Page] ──► api.js (Axios)',
  '                   │',
  '                   ▼  (request interceptor)',
  '        Add: Authorization: Bearer {token}',
  '                   │',
  '                   ▼',
  '        ASP.NET JWT Middleware',
  '          ├─ Validates: signature, expiry, issuer, audience',
  '          └─ Extracts Role claim from token',
  '                   │',
  '                   ▼',
  '        [Authorize] / [Authorize(Roles="Admin")] check',
  '          ├─ Pass ──► Controller Action',
  '          └─ Fail ──► 401 Unauthorized / 403 Forbidden',
  '                   │',
  '                   ▼',
  '        Controller ──► Service ──► DbContext ──► SQL Server',
  '                   │',
  '                   ▼',
  '        JSON Response ──► React state update ──► UI re-render',
]);

addPage();

// ─── TIMING GUIDE ────────────────────────────────────────────────────────────
H1('Timing Guide');
P('Use this to pace yourself during the demo. Aim to finish each section on time.');
gap(0.4);

TABLE([
  ['Opening', '1 min'],
  ['Situation — Why this project exists', '1.5 min'],
  ['Task — What was built', '1 min'],
  ['Part 1: Database Design', '1 min'],
  ['Part 2: Background Simulator', '45 sec'],
  ['Part 3: Authentication Flow', '1.5 min'],
  ['Part 4: RBAC — Role-Based Access Control', '1 min'],
  ['Part 5: API Endpoints & Controller Layer', '1 min'],
  ['Part 6: Frontend Architecture', '1 min'],
  ['Part 7: Dashboard Live Walkthrough', '1.5 min'],
  ['Part 8: Alerts, Analytics & Reports', '1 min'],
  ['Part 9: Vehicles Page — Admin-Only CRUD', '30 sec'],
  ['Result / Wrap-up', '1.5 min'],
  ['Total', '~15 min'],
]);

H2('Pro Tips for the Demo');
B('Open the browser with the Dashboard already loaded before you begin speaking');
B('Have Swagger UI open in a second browser tab — point to it when explaining the API endpoints');
B('Have VS Code open showing Program.cs and AuthService.cs side-by-side');
B('When showing the Dashboard, point to the live countdown timer — it proves the refresh is real');
B('Mention the composite DB index proactively — interviewers notice when candidates think about performance');
B('End with an open invitation: "I can go deeper into any layer — JWT, EF schema, or the simulator"');

// ─── PAGE NUMBERS ─────────────────────────────────────────────────────────────
pageNumbers();

doc.end();
console.log('Done → VehicleTelemetry_Demo_Script.pdf');
