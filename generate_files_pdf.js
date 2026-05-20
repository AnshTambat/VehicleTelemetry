const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 55, size: 'A4', bufferPages: true });
doc.pipe(fs.createWriteStream('VehicleTelemetry_Files_Explained.pdf'));

const PW = doc.page.width - 110;
const FONTS = {
  normal: 'Helvetica',
  bold: 'Helvetica-Bold',
  italic: 'Helvetica-Oblique',
  boldItalic: 'Helvetica-BoldOblique',
  mono: 'Courier',
  monoBold: 'Courier-Bold',
};

// ─── colour palette ───────────────────────────────────────────────────────────
const C = {
  backendBanner : '#0f3460',
  frontendBanner: '#1a4a1a',
  sectionBanner : '#1a1a2e',
  h2Accent      : '#1a73e8',
  codeBlock     : '#f0f4f8',
  codeBorder    : '#cbd5e1',
  inlineMono    : '#1e40af',
  bodyText      : '#1a1a1a',
  mutedText     : '#555555',
  bullet        : '#1a73e8',
  tableHeader   : '#1a73e8',
  tableEven     : '#eef2ff',
  white         : '#ffffff',
  keyNote       : '#7c3aed',
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function safeY(needed = 40) {
  if (doc.y + needed > doc.page.height - 60) doc.addPage();
}

function gap(n = 0.35) { doc.moveDown(n); }

// Full-width coloured banner
function banner(text, bg, fontSize = 15, indent = 0) {
  safeY(34);
  const y = doc.y;
  doc.rect(55, y, PW, 28).fill(bg);
  doc.fillColor(C.white).font(FONTS.bold).fontSize(fontSize);
  doc.text(text, 63 + indent, y + 7, { width: PW - 16 });
  doc.fillColor(C.bodyText).font(FONTS.normal).fontSize(11);
  gap(0.5);
}

// Blue underlined heading
function H2(text) {
  safeY(28);
  gap(0.4);
  doc.fillColor(C.h2Accent).font(FONTS.bold).fontSize(12);
  doc.text(text, 55, doc.y);
  const lineY = doc.y;
  doc.moveTo(55, lineY).lineTo(55 + PW, lineY).lineWidth(1.2).strokeColor(C.h2Accent).stroke();
  doc.fillColor(C.bodyText).font(FONTS.normal).fontSize(11);
  gap(0.3);
}

// Normal paragraph
function P(text, indent = 0) {
  safeY(16);
  doc.fillColor(C.bodyText).font(FONTS.normal).fontSize(11);
  doc.text(text, 55 + indent, doc.y, { width: PW - indent, lineGap: 1.5 });
  gap(0.25);
}

// Bold label + normal rest on same line (label: rest)
function KV(label, rest) {
  safeY(16);
  doc.fillColor(C.bodyText).font(FONTS.bold).fontSize(11);
  const lw = doc.widthOfString(label);
  if (lw + 10 + 55 > 55 + PW - 80) {
    // label too long — stack
    doc.text(label, 55, doc.y, { width: PW });
    doc.font(FONTS.normal).fillColor(C.bodyText);
    doc.text(rest, 65, doc.y, { width: PW - 10 });
  } else {
    doc.text(label, 55, doc.y, { continued: true, width: lw + 6 });
    doc.font(FONTS.normal).fillColor(C.bodyText);
    doc.text(' ' + rest, { width: PW - lw - 6 });
  }
  gap(0.2);
}

// Bullet point
function B(text, indent = 0) {
  safeY(16);
  const bx = 68 + indent, tx = bx + 10, by = doc.y + 5.5;
  doc.circle(bx, by, 2.5).fill(C.bullet);
  doc.fillColor(C.bodyText).font(FONTS.normal).fontSize(11);
  doc.text(text, tx, doc.y, { width: PW - (tx - 55), lineGap: 1.5 });
  gap(0.18);
}

// Sub-bullet (dash)
function SB(text, indent = 0) {
  safeY(14);
  const bx = 84 + indent, tx = bx + 10, by = doc.y + 6;
  doc.rect(bx, by, 6, 1.5).fill(C.mutedText);
  doc.fillColor(C.mutedText).font(FONTS.normal).fontSize(10.5);
  doc.text(text, tx, doc.y, { width: PW - (tx - 55), lineGap: 1.5 });
  gap(0.12);
}

// Code/monospace block
function CODE(lines, lang) {
  safeY(20 + lines.length * 13);
  gap(0.2);
  const lh = 13, pad = 9;
  const bh = lines.length * lh + pad * 2 + (lang ? 16 : 0);
  const sy = doc.y;
  doc.rect(55, sy, PW, bh).fill(C.codeBlock).lineWidth(0.6).strokeColor(C.codeBorder).stroke();
  if (lang) {
    doc.fillColor(C.mutedText).font(FONTS.italic).fontSize(8.5);
    doc.text(lang, 60, sy + 4, { width: PW - 10 });
  }
  doc.fillColor('#1e293b').font(FONTS.mono).fontSize(9);
  const textStart = sy + pad + (lang ? 14 : 0);
  lines.forEach((l, i) => {
    if (doc.y + 13 > doc.page.height - 55) {
      doc.addPage();
    }
    doc.text(l, 62, textStart + i * lh, { width: PW - 14, lineBreak: false });
  });
  doc.y = textStart + lines.length * lh + pad;
  doc.fillColor(C.bodyText).font(FONTS.normal).fontSize(11);
  gap(0.3);
}

// Inline mono text inside a sentence — rendered as bold blue
function M(text) { return text; } // used inline — just return text

// Key-note box (purple left bar)
function NOTE(text) {
  safeY(30);
  const sy = doc.y;
  doc.fillColor('#f5f3ff').rect(55, sy, PW, 1).fill('#f5f3ff');
  doc.fillColor(C.mutedText).font(FONTS.italic).fontSize(10.5);
  doc.text(text, 68, sy, { width: PW - 16, lineGap: 1.5 });
  const ey = doc.y;
  doc.rect(55, sy, 4, ey - sy).fill(C.keyNote);
  doc.fillColor(C.bodyText).font(FONTS.normal).fontSize(11);
  gap(0.35);
}

// Summary table at end
function TABLE(headers, rows) {
  const colW = headers.map(() => PW / headers.length);
  const rh = 21, sx = 55;
  safeY(rh * (rows.length + 1) + 10);
  let ty = doc.y;
  doc.rect(sx, ty, PW, rh).fill(C.tableHeader);
  doc.fillColor(C.white).font(FONTS.bold).fontSize(10);
  headers.forEach((h, i) => doc.text(h, sx + colW.slice(0, i).reduce((a, b) => a + b, 0) + 5, ty + 6, { width: colW[i] - 8 }));
  ty += rh;
  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? C.tableEven : C.white;
    doc.rect(sx, ty, PW, rh).fill(bg);
    doc.moveTo(sx, ty).lineTo(sx + PW, ty).lineWidth(0.3).strokeColor(C.codeBorder).stroke();
    doc.fillColor(C.bodyText).font(FONTS.normal).fontSize(9.5);
    row.forEach((cell, ci) => {
      doc.text(cell, sx + colW.slice(0, ci).reduce((a, b) => a + b, 0) + 5, ty + 6, { width: colW[ci] - 8 });
    });
    ty += rh;
  });
  doc.rect(sx, doc.y, PW, ty - doc.y).lineWidth(0.8).strokeColor(C.codeBorder).stroke();
  doc.y = ty + 8;
  doc.fillColor(C.bodyText).font(FONTS.normal).fontSize(11);
}

function pageNumbers() {
  const r = doc.bufferedPageRange();
  for (let i = 1; i < r.count; i++) {
    doc.switchToPage(r.start + i);
    doc.fillColor(C.mutedText).font(FONTS.normal).fontSize(9);
    doc.text(`Page ${i}`, 55, doc.page.height - 38, { width: PW, align: 'center' });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  COVER
// ══════════════════════════════════════════════════════════════════════════════
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0a0f1e');
doc.fillColor('#ffffff').font(FONTS.bold).fontSize(26);
doc.text('Vehicle Telemetry System', 55, 170, { width: PW, align: 'center' });
doc.fillColor('#60a5fa').font(FONTS.bold).fontSize(18);
doc.text('Complete File-by-File Explanation', 55, 210, { width: PW, align: 'center' });
doc.moveTo(130, 248).lineTo(doc.page.width - 130, 248).lineWidth(1.2).strokeColor('#334155').stroke();
doc.fillColor('#94a3b8').font(FONTS.normal).fontSize(11);
doc.text('Backend (ASP.NET Core 8)  ·  Frontend (React 19)', 55, 262, { width: PW, align: 'center' });
doc.text('24 Files  ·  Every Line Explained', 55, 282, { width: PW, align: 'center' });
doc.fillColor('#475569').font(FONTS.normal).fontSize(10);
doc.text('Program.cs · TelemetryDbContext · Models · DTOs · AuthService · VehicleService', 55, 340, { width: PW, align: 'center' });
doc.text('AuthController · VehiclesController · ReadingsController · Simulator', 55, 357, { width: PW, align: 'center' });
doc.text('main.jsx · App.jsx · AuthContext · api.js · Dashboard · AuthPage', 55, 374, { width: PW, align: 'center' });
doc.text('AlertsPage · VehiclesPage · AnalyticsPage · ReportsPage', 55, 391, { width: PW, align: 'center' });
doc.addPage();

// ══════════════════════════════════════════════════════════════════════════════
//  BACKEND SECTION DIVIDER
// ══════════════════════════════════════════════════════════════════════════════
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8fafc');
doc.rect(0, 0, doc.page.width, doc.page.height).fill('white');
banner('🔷  BACKEND — VehicleTelemetryAPI', C.backendBanner, 17);
P('The backend is an ASP.NET Core 8 Web API. It handles all data persistence, authentication, authorization, business logic, and background telemetry simulation. It exposes RESTful endpoints consumed by the React frontend.');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 1 — Program.cs
// ══════════════════════════════════════════════════════════════════════════════
banner('1.  Program.cs  —  Application Entry Point & Configuration', C.sectionBanner, 13);
P('This is the heart of the entire backend. Every service, middleware, and pipeline is wired here. Nothing works without this file being correct.');

H2('Service Registration (Lines 16–20)');
CODE([
  'builder.Services.AddDbContext<TelemetryDbContext>(opt =>',
  '    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));',
  'builder.Services.AddScoped<VehicleService>();',
  'builder.Services.AddScoped<AuthService>();',
  'builder.Services.AddHostedService<SimulatorBackgroundService>();',
], 'C# — Program.cs');
B('Lines 16–17: Registers TelemetryDbContext with SQL Server using the connection string from appsettings.json');
B('Line 18: Registers VehicleService as Scoped — a new instance is created per HTTP request');
B('Line 19: Registers AuthService as Scoped — same lifetime as VehicleService');
B('Line 20: Registers SimulatorBackgroundService as a Hosted Service — starts automatically with the app and runs in the background forever until app shutdown');

H2('JWT Authentication Setup (Lines 23–37)');
CODE([
  'var jwtSection = builder.Configuration.GetSection("Jwt");',
  'builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)',
  '    .AddJwtBearer(options => {',
  '        options.TokenValidationParameters = new TokenValidationParameters {',
  '            ValidateIssuer = true,',
  '            ValidateAudience = true,',
  '            ValidateLifetime = true,',
  '            ValidateIssuerSigningKey = true,',
  '            ValidIssuer = jwtSection["Issuer"],',
  '            ValidAudience = jwtSection["Audience"],',
  '            IssuerSigningKey = new SymmetricSecurityKey(',
  '                Encoding.UTF8.GetBytes(jwtSection["Key"]!))',
  '        };',
  '    });',
], 'C# — JWT configuration');
B('Reads the Jwt section from appsettings.json which contains Key, Issuer, Audience, ExpiryHours');
B('Five validation rules set: Issuer must match, Audience must match, Token must not be expired, Signature must be valid');
B('Uses HS256 symmetric signing — same secret key used to both sign and verify tokens');

H2('CORS Configuration (Lines 40–41)');
CODE([
  'builder.Services.AddCors(opt => opt.AddDefaultPolicy(p =>',
  '    p.WithOrigins("http://localhost:5173", "https://localhost:5173")',
  '     .AllowAnyHeader().AllowAnyMethod()));',
], 'C#');
B('Only the React dev server (Vite port 5173) is allowed to call this API');
B('AllowAnyHeader and AllowAnyMethod — the frontend can send any HTTP method and headers');
NOTE('Key design decision: CORS middleware must be placed BEFORE UseAuthentication and UseAuthorization in the pipeline. If reversed, the browser\'s preflight OPTIONS request gets blocked before CORS headers are added, causing all frontend requests to fail with CORS errors.');

H2('JSON Cycle Prevention (Line 44)');
CODE([
  '.AddJsonOptions(options =>',
  '    options.JsonSerializerOptions.ReferenceHandler =',
  '        System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);',
], 'C#');
B('Without this, serializing a Vehicle that includes its Readings, each of which has a back-reference to Vehicle, would cause infinite recursion and a stack overflow');
B('IgnoreCycles tells the serializer to skip already-visited object references');

H2('Auto-Migration on Startup (Lines 58–62)');
CODE([
  'using (var scope = app.Services.CreateScope()) {',
  '    var db = scope.ServiceProvider.GetRequiredService<TelemetryDbContext>();',
  '    db.Database.Migrate();',
  '}',
], 'C#');
B('Creates a temporary DI scope to resolve TelemetryDbContext');
B('db.Database.Migrate() applies any pending EF migrations — creates tables if they do not exist');
B('Zero manual SQL setup needed — the database is ready when the app starts');

H2('Middleware Pipeline Order (Lines 64–69)');
CODE([
  'app.UseHttpsRedirection();',
  'app.UseCors();',
  'app.UseAuthentication();',
  'app.UseAuthorization();',
  'app.MapControllers();',
], 'C# — Pipeline order');
B('HTTPS redirect first — forces HTTP requests to HTTPS');
B('CORS next — adds CORS headers before any auth checks');
B('Authentication — validates the JWT token and populates User.Identity');
B('Authorization — enforces [Authorize] attributes using the populated identity');
B('MapControllers — routes requests to the correct controller action');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 2 — TelemetryDbContext.cs
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('2.  Data/TelemetryDbContext.cs  —  Database Gateway', C.sectionBanner, 13);
P('This is the single file through which all database operations happen. Every query, insert, update, and delete goes through this class.');

CODE([
  'public class TelemetryDbContext : DbContext {',
  '    public TelemetryDbContext(DbContextOptions<TelemetryDbContext> options)',
  '        : base(options) { }',
  '',
  '    public DbSet<Vehicle> Vehicles => Set<Vehicle>();',
  '    public DbSet<VehicleReading> VehicleReadings => Set<VehicleReading>();',
  '    public DbSet<User> Users => Set<User>();',
  '',
  '    protected override void OnModelCreating(ModelBuilder b) {',
  '        b.Entity<VehicleReading>().HasIndex(r => new { r.VehicleId, r.Timestamp });',
  '        b.Entity<Vehicle>().Property(v => v.Name).HasMaxLength(100);',
  '        b.Entity<User>().HasIndex(u => u.Email).IsUnique();',
  '        b.Entity<User>().HasIndex(u => u.Username).IsUnique();',
  '    }',
  '}',
], 'C# — TelemetryDbContext.cs');

H2('DbSets (Lines 10–12)');
B('Each DbSet<T> maps to a SQL table — Vehicles, VehicleReadings, Users');
B('DbSet uses expression-bodied property => Set<T>() — cleaner than a full auto-property with private set');
B('These are the entry points for all LINQ queries: _db.Vehicles.Where(...), _db.Users.AnyAsync(...) etc.');

H2('OnModelCreating — Schema Rules (Lines 14–21)');
B('Composite index on (VehicleId, Timestamp): almost every query filters readings by vehicle AND time range. This index makes those queries dramatically faster on large datasets');
B('Vehicle.Name max 100 characters: enforced at DB level, not just in code');
B('Email.IsUnique(): the DB enforces uniqueness even if code misses it — prevents duplicate accounts at the storage level');
B('Username.IsUnique(): same protection for usernames');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 3 — User.cs
// ══════════════════════════════════════════════════════════════════════════════
banner('3.  Models/User.cs  —  User Entity', C.sectionBanner, 13);
CODE([
  'public class User {',
  '    public int UserId { get; set; }',
  '    [MaxLength(100)]',
  '    public string Username { get; set; } = string.Empty;',
  '    [MaxLength(200)]',
  '    public string Email { get; set; } = string.Empty;',
  '    public string PasswordHash { get; set; } = string.Empty;',
  '    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;',
  '    [MaxLength(20)]',
  '    public string Role { get; set; } = "Viewer";',
  '}',
], 'C# — User.cs');
B('UserId: auto-incremented primary key. No [Key] attribute needed because EF convention says any property named Id or ClassNameId is automatically the PK');
B('Username: max 100 chars set via data annotation — enforced both at API validation and DB column level');
B('Email: max 200 chars for typical email address lengths');
B('PasswordHash: stores the BCrypt hash — the plaintext password is NEVER stored anywhere');
B('CreatedAt: initialized to DateTime.UtcNow at object construction — always UTC, not local time');
B('Role: string "Admin" or "Viewer", defaults to "Viewer" — new users are Viewers unless they provide the admin code');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 4 — Vehicle.cs
// ══════════════════════════════════════════════════════════════════════════════
banner('4.  Models/Vehicle.cs  —  Vehicle Entity', C.sectionBanner, 13);
CODE([
  'public class Vehicle {',
  '    [Key]',
  '    public int VehicleId { get; set; }',
  '    public string Name { get; set; } = string.Empty;',
  '    public string LicensePlate { get; set; } = string.Empty;',
  '    public DateTime CreatedAt { get; set; }',
  '    public ICollection<VehicleReading> Readings { get; set; } = new List<VehicleReading>();',
  '}',
], 'C# — Vehicle.cs');
B('[Key] attribute explicitly marks VehicleId as primary key');
B('Name: display name of the vehicle, e.g. "Truck Alpha"');
B('LicensePlate: e.g. "TN 01 AB 1234"');
B('CreatedAt: set by the controller (not the client) when a vehicle is created');
B('Readings: navigation property — the "one" side of the 1:N relationship with VehicleReading');
B('Initialized to new List<VehicleReading>() so it is never null — safe to iterate without null check');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 5 — VehicleReading.cs
// ══════════════════════════════════════════════════════════════════════════════
banner('5.  Models/VehicleReading.cs  —  Telemetry Data Entity', C.sectionBanner, 13);
P('This is the most important table — every single telemetry data point from every vehicle lives here. It grows the fastest and is queried the most.');
CODE([
  'public class VehicleReading {',
  '    [Key]',
  '    public int ReadingId { get; set; }',
  '    public int VehicleId { get; set; }',
  '    public decimal Speed { get; set; }',
  '    public decimal EngineTemp { get; set; }',
  '    public decimal Lat { get; set; }',
  '    public decimal Lon { get; set; }',
  '    public DateTime Timestamp { get; set; }',
  '    public Vehicle? Vehicle { get; set; }',
  '}',
], 'C# — VehicleReading.cs');
B('ReadingId: primary key, auto-incremented');
B('VehicleId: foreign key to the Vehicles table — EF enforces the FK constraint');
B('Speed and EngineTemp are decimal type (not float or double) — avoids floating-point rounding errors. Sensor data requires precision');
B('Lat and Lon are decimal — GPS coordinates need decimal precision (e.g. 13.08274)');
B('Timestamp: always stored as UTC — the simulator sets DateTime.UtcNow');
B('Vehicle?: nullable navigation property back to the Vehicle. The ? means EF will not throw if this is not loaded during a no-tracking query');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 6 — AuthDtos.cs
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('6.  Models/DTOs/AuthDtos.cs  —  Data Transfer Objects', C.sectionBanner, 13);
P('Three classes that define the exact shape of the JSON bodies that travel in and out of the auth endpoints. DTOs separate the API contract from the database model.');

H2('RegisterRequest');
CODE([
  'public class RegisterRequest {',
  '    [Required, MaxLength(100)]',
  '    public string Username { get; set; } = string.Empty;',
  '',
  '    [Required, MaxLength(200)]',
  '    [RegularExpression(@"^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$",',
  '        ErrorMessage = "Email must be a valid address")]',
  '    public string Email { get; set; } = string.Empty;',
  '',
  '    [Required]',
  '    [RegularExpression(@"^(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d]).{8,}$",',
  '        ErrorMessage = "Password must be 8+ chars with uppercase, number, special char")]',
  '    public string Password { get; set; } = string.Empty;',
  '',
  '    [MaxLength(20)]',
  '    public string Role { get; set; } = "Viewer";',
  '    public string RoleCode { get; set; } = string.Empty;',
  '}',
], 'C#');
B('Username: Required, max 100 chars');
B('Email: regex validated — must have @, a domain, and a 2+ character TLD. Invalid emails get a 400 response before the code even runs');
B('Password regex breakdown:');
SB('(?=.*[A-Z]) — at least one uppercase letter');
SB('(?=.*\\d) — at least one digit');
SB('(?=.*[^a-zA-Z\\d]) — at least one special character');
SB('.{8,} — minimum 8 characters total');
B('Role: "Viewer" by default. The client can send "Admin" but it requires RoleCode to match');
B('RoleCode: the secret admin code — compared against appsettings.json in AuthService');

H2('LoginRequest');
B('Email: same regex validation as RegisterRequest');
B('Password: Required — no complexity check here, just existence check');
B('Deliberately simpler than RegisterRequest — complexity is for registration only');

H2('AuthResponse — what gets sent back to the client on login');
CODE([
  'public class AuthResponse {',
  '    public string Token { get; set; } = string.Empty;',
  '    public string Username { get; set; } = string.Empty;',
  '    public string Email { get; set; } = string.Empty;',
  '    public DateTime ExpiresAt { get; set; }',
  '    public string Role { get; set; } = string.Empty;',
  '}',
], 'C#');
B('Token: the JWT string — three base64 segments separated by dots');
B('Username and Email: stored in React AuthContext for display in the sidebar');
B('ExpiresAt: UTC datetime 24 hours from login — frontend can use this to pre-emptively logout');
B('Role: "Admin" or "Viewer" — the React frontend uses this to control which UI elements appear');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 7 — AuthService.cs
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('7.  Services/AuthService.cs  —  Authentication Business Logic', C.sectionBanner, 13);
P('All authentication logic lives here. The controller is kept thin — it just receives HTTP requests and delegates to this service. This separation makes the logic independently testable.');

H2('RegisterAsync(RegisterRequest req)');
CODE([
  'bool emailExists = await _db.Users.AnyAsync(u => u.Email == req.Email);',
  'if (emailExists) return (false, "Email is already registered.");',
  '',
  'bool usernameExists = await _db.Users.AnyAsync(u => u.Username == req.Username);',
  'if (usernameExists) return (false, "Username is already taken.");',
  '',
  'var adminCode = _config["RoleCodes:Admin"];',
  '',
  'string role;',
  'if (req.Role == "Admin") {',
  '    if (string.IsNullOrEmpty(req.RoleCode) || req.RoleCode != adminCode)',
  '        return (false, "Invalid admin code.");',
  '    role = "Admin";',
  '} else {',
  '    role = "Viewer";',
  '}',
  '',
  'var user = new User {',
  '    Username = req.Username,',
  '    Email = req.Email,',
  '    PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),',
  '    Role = role',
  '};',
  '_db.Users.Add(user);',
  'await _db.SaveChangesAsync();',
  'return (true, string.Empty);',
], 'C# — RegisterAsync');
B('AnyAsync is more efficient than SingleOrDefaultAsync — it stops scanning the DB as soon as it finds one match');
B('Checks email uniqueness first, then username — both produce different error messages');
B('Admin code read from _config["RoleCodes:Admin"] — value comes from appsettings.json, never hardcoded');
B('If role is "Admin" but code is wrong or missing — registration is rejected');
B('Any string other than "Admin" always results in "Viewer" role — you cannot trick the system with other strings');
B('BCrypt.HashPassword(req.Password) — automatically generates a random salt and hashes with cost factor 11');
B('Returns a (bool, string) tuple — the controller destructures this to decide the HTTP response');

H2('LoginAsync(LoginRequest req)');
CODE([
  'var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);',
  'if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))',
  '    return (false, null, "Invalid email or password.");',
  '',
  'var response = GenerateToken(user);',
  'return (true, response, string.Empty);',
], 'C# — LoginAsync');
B('Looks up user by email — returns null if not found');
B('BCrypt.Verify(plaintext, hash) — safely compares without revealing timing information');
B('Both "user not found" and "wrong password" return the SAME error message — prevents username enumeration attacks where an attacker probes which emails are registered');
B('On success, calls GenerateToken(user) to create and return the JWT');

H2('GenerateToken(User user) — private method');
CODE([
  'var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));',
  'var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);',
  'var expiry = DateTime.UtcNow.AddHours(double.Parse(jwtSection["ExpiryHours"]!));',
  '',
  'var claims = new[] {',
  '    new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),',
  '    new Claim(JwtRegisteredClaimNames.Email, user.Email),',
  '    new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),',
  '    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),',
  '    new Claim(ClaimTypes.Role, user.Role)',
  '};',
], 'C# — GenerateToken');
B('SymmetricSecurityKey: converts the string key from config into a cryptographic key object');
B('HmacSha256: the signing algorithm — same key signs and verifies');
B('Expiry: ExpiryHours read from config (24 hours) — configurable without code changes');
B('Five claims embedded in the token:');
SB('Sub (Subject): UserId — uniquely identifies the user');
SB('Email: user\'s email address');
SB('UniqueName: username for display');
SB('Jti: a new GUID for every token — unique token ID, prevents replay attacks');
SB('ClaimTypes.Role: "Admin" or "Viewer" — this is what [Authorize(Roles="Admin")] checks against');
B('JwtSecurityTokenHandler().WriteToken(token) — serializes the token to the 3-part base64 dot-separated string');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 8 — VehicleService.cs
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('8.  Services/VehicleService.cs  —  Vehicle Business Logic', C.sectionBanner, 13);

H2('VehicleSummary class');
P('Defined right inside the service file — acts as a DTO for the summary endpoint response. Contains: VehicleId, Name, PeakSpeed, AvgEngineTemp, TotalReadings, LastSeen.');

H2('ComputeSummary(int vehicleId)');
CODE([
  'var vehicle = await _db.Vehicles.FindAsync(vehicleId)',
  '    ?? throw new KeyNotFoundException($"Vehicle {vehicleId} not found");',
  '',
  'var readings = await _db.VehicleReadings',
  '    .Where(r => r.VehicleId == vehicleId)',
  '    .ToListAsync();',
  '',
  'return new VehicleSummary {',
  '    PeakSpeed   = readings.Any() ? readings.Max(r => r.Speed) : 0,',
  '    AvgEngineTemp = readings.Any() ? Math.Round(readings.Average(r => r.EngineTemp), 2) : 0,',
  '    TotalReadings = readings.Count,',
  '    LastSeen    = readings.Any() ? readings.Max(r => r.Timestamp) : null',
  '};',
], 'C# — ComputeSummary');
B('FindAsync uses the primary key index — fastest possible lookup');
B('?? throw KeyNotFoundException — controller catches this and returns 404');
B('All readings loaded into memory first (ToListAsync), then aggregated in C# — simpler and safe for typical fleet sizes');
B('readings.Any() guards prevent exceptions on vehicles with zero readings');
B('Math.Round(..., 2) rounds average temp to 2 decimal places');

H2('GetTop5ByPeakSpeedToday()');
CODE([
  'var today = DateTime.UtcNow.Date;',
  '',
  'var top = await _db.VehicleReadings',
  '    .Where(r => r.Timestamp >= today)',
  '    .GroupBy(r => r.VehicleId)',
  '    .Select(g => new { VehicleId = g.Key, PeakSpeed = g.Max(r => r.Speed) })',
  '    .Join(_db.Vehicles, g => g.VehicleId, v => v.VehicleId,',
  '          (g, v) => new { g.VehicleId, v.Name, g.PeakSpeed })',
  '    .OrderByDescending(x => x.PeakSpeed)',
  '    .Take(5)',
  '    .ToListAsync();',
], 'C# — GetTop5ByPeakSpeedToday');
B('DateTime.UtcNow.Date gets midnight UTC — filters readings from today only');
B('This entire LINQ chain runs as a SINGLE SQL query on the server — no data pulled into memory before grouping');
B('GroupBy VehicleId → Max(Speed) per vehicle — gives peak speed per vehicle today');
B('Join to Vehicles table — to get the vehicle name alongside the ID');
B('OrderByDescending + Take(5) — top 5 by peak speed');
B('Cast to List<object> after ToListAsync — done after materialization because EF cannot translate the cast to SQL');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 9 — AuthController.cs
// ══════════════════════════════════════════════════════════════════════════════
banner('9.  Controllers/AuthController.cs  —  Auth Endpoints', C.sectionBanner, 13);
CODE([
  '[ApiController]',
  '[Route("api/auth")]',
  'public class AuthController : ControllerBase {',
  '    private readonly AuthService _auth;',
  '    public AuthController(AuthService auth) => _auth = auth;',
  '',
  '    [HttpPost("register")]',
  '    public async Task<IActionResult> Register([FromBody] RegisterRequest req) {',
  '        var (success, error) = await _auth.RegisterAsync(req);',
  '        if (!success) return Conflict(new { message = error });',
  '        return StatusCode(201, new { message = "Account created successfully." });',
  '    }',
  '',
  '    [HttpPost("login")]',
  '    public async Task<IActionResult> Login([FromBody] LoginRequest req) {',
  '        var (success, response, error) = await _auth.LoginAsync(req);',
  '        if (!success) return Unauthorized(new { message = error });',
  '        return Ok(response);',
  '    }',
  '}',
], 'C# — AuthController.cs');
B('[ApiController]: enables automatic model validation — if the RegisterRequest DTO fails its regex validations, ASP.NET returns 400 Bad Request before the method is even called');
B('[Route("api/auth")]: base route for all actions in this controller');
B('No [Authorize] on the class — these endpoints are intentionally public. You cannot require auth to reach the login endpoint');
B('Register: destructures the (bool, string) tuple from RegisterAsync. Returns 409 Conflict if registration fails, 201 Created on success');
B('Login: destructures the (bool, AuthResponse?, string) tuple. Returns 401 Unauthorized on failure, 200 OK with the full AuthResponse on success');
B('Constructor injection: AuthService is injected via DI — the controller has no direct knowledge of BCrypt, JWT, or the database');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 10 — VehiclesController.cs
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('10.  Controllers/VehiclesController.cs  —  Vehicle CRUD Endpoints', C.sectionBanner, 13);
B('[Authorize] on the class: ALL actions in this controller require a valid JWT token. Unauthenticated requests get 401 Unauthorized');
B('[Route("api/[controller]")]: resolves to "api/vehicles" from the class name VehiclesController');
B('Constructor injects both TelemetryDbContext (for direct DB queries) and VehicleService (for computed/aggregated logic)');
gap(0.3);

H2('GET /api/vehicles — GetAll');
CODE([
  '[HttpGet]',
  'public async Task<IActionResult> GetAll() =>',
  '    Ok(await _db.Vehicles.AsNoTracking().ToListAsync());',
], 'C#');
B('AsNoTracking(): EF does NOT track these objects for changes — saves memory and is 15-30% faster for read-only queries');
B('Any authenticated user (Admin or Viewer) can call this');

H2('GET /api/vehicles/{id} — GetById');
CODE([
  '[HttpGet("{id}")]',
  'public async Task<IActionResult> GetById(int id) {',
  '    var v = await _db.Vehicles.AsNoTracking().FirstOrDefaultAsync(x => x.VehicleId == id);',
  '    return v is null ? NotFound() : Ok(v);',
  '}',
], 'C#');
B('Returns 404 NotFound if the vehicle does not exist — clean REST semantics');

H2('POST /api/vehicles — Create (Admin only)');
CODE([
  '[HttpPost]',
  '[Authorize(Roles = "Admin")]',
  'public async Task<IActionResult> Create(Vehicle v) {',
  '    v.CreatedAt = DateTime.UtcNow;',
  '    _db.Vehicles.Add(v);',
  '    await _db.SaveChangesAsync();',
  '    return CreatedAtAction(nameof(GetById), new { id = v.VehicleId }, v);',
  '}',
], 'C#');
B('[Authorize(Roles = "Admin")]: the Role claim in the JWT is checked. Viewer role gets 403 Forbidden');
B('v.CreatedAt = DateTime.UtcNow: server sets the creation time — client cannot fake it');
B('CreatedAtAction: returns 201 with a Location header pointing to GET /api/vehicles/{id}');

H2('PUT /api/vehicles/{id} — Update (Admin only)');
CODE([
  'public record VehicleUpdateDto(string Name, string LicensePlate);',
  '',
  '[HttpPut("{id}")]',
  '[Authorize(Roles = "Admin")]',
  'public async Task<IActionResult> Update(int id, [FromBody] VehicleUpdateDto body) {',
  '    var v = await _db.Vehicles.FindAsync(id);',
  '    if (v is null) return NotFound();',
  '    v.Name = body.Name;',
  '    v.LicensePlate = body.LicensePlate;',
  '    await _db.SaveChangesAsync();',
  '    return Ok(v);',
  '}',
], 'C#');
B('VehicleUpdateDto is a C# record — immutable, value-based, defined inline. Only Name and LicensePlate can be updated — VehicleId and CreatedAt are not in the DTO so clients cannot change them');
B('FindAsync by PK is the most efficient lookup — uses the clustered index directly');

H2('DELETE /api/vehicles/{id} — Delete (Admin only)');
B('FindAsync → 404 if not found, otherwise Remove + SaveChangesAsync → 204 No Content');

H2('GET /api/vehicles/{id}/summary — Summary (any role)');
B('Delegates entirely to VehicleService.ComputeSummary(id) — no logic in the controller');

H2('GET /api/vehicles/top5-speed-today — Top5 (any role)');
B('Delegates to VehicleService.GetTop5ByPeakSpeedToday() — returns the leaderboard data');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 11 — ReadingsController.cs
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('11.  Controllers/ReadingsController.cs  —  Telemetry Data Endpoints', C.sectionBanner, 13);
B('[Route("api/vehicles/{vehicleId}/readings")]: nested resource design — vehicleId is part of the URL, automatically bound from the route segment');
B('[Authorize]: all endpoints require authentication. No public access to telemetry data');
gap(0.3);

H2('GET / — GetReadings with optional date filter');
CODE([
  '[HttpGet]',
  'public async Task<IActionResult> GetReadings(',
  '    int vehicleId, [FromQuery] DateTime? from, [FromQuery] DateTime? to) {',
  '    var q = _db.VehicleReadings.AsNoTracking().Where(r => r.VehicleId == vehicleId);',
  '    if (from.HasValue) q = q.Where(r => r.Timestamp >= from.Value);',
  '    if (to.HasValue)   q = q.Where(r => r.Timestamp <= to.Value);',
  '    return Ok(await q.OrderBy(r => r.Timestamp).ToListAsync());',
  '}',
], 'C#');
B('Optional from/to query params — if not provided, returns all readings for the vehicle');
B('Conditional .Where() filters are added to the IQueryable — SQL is built up lazily and executed once at ToListAsync');
B('OrderBy Timestamp — always returns chronological order');
B('AsNoTracking() — read-only, no change tracking overhead');

H2('GET /latest — GetLatest');
CODE([
  '[HttpGet("latest")]',
  'public async Task<IActionResult> GetLatest(int vehicleId) {',
  '    var latest = await _db.VehicleReadings.AsNoTracking()',
  '        .Where(r => r.VehicleId == vehicleId)',
  '        .OrderByDescending(r => r.Timestamp)',
  '        .FirstOrDefaultAsync();',
  '    return latest is null ? NotFound() : Ok(latest);',
  '}',
], 'C#');
B('OrderByDescending(Timestamp).FirstOrDefaultAsync() — gets only the single most recent row');
B('Returns 404 if the vehicle has no readings at all');

H2('POST / — AddReading (Admin only)');
CODE([
  '[HttpPost]',
  '[Authorize(Roles = "Admin")]',
  'public async Task<IActionResult> AddReading(int vehicleId, VehicleReading reading) {',
  '    reading.VehicleId = vehicleId;',
  '    reading.Timestamp = DateTime.UtcNow;',
  '    _db.VehicleReadings.Add(reading);',
  '    await _db.SaveChangesAsync();',
  '    return Ok(reading);',
  '}',
], 'C#');
B('reading.VehicleId = vehicleId: overrides whatever vehicleId the client sent in the body with the one from the URL — clients cannot post a reading to a different vehicle');
B('reading.Timestamp = DateTime.UtcNow: server sets the time — clients cannot fake timestamps');

H2('DELETE /{readingId} — DeleteReading (Admin only)');
CODE([
  'var reading = await _db.VehicleReadings',
  '    .FirstOrDefaultAsync(r => r.ReadingId == readingId && r.VehicleId == vehicleId);',
  'if (reading is null) return NotFound();',
], 'C#');
B('Checks BOTH readingId AND vehicleId in the WHERE clause — prevents deleting a reading that belongs to a different vehicle even if the readingId is known');

H2('GET /avg-engine-temp-per-hour');
CODE([
  'var raw = await _db.VehicleReadings',
  '    .Where(r => r.VehicleId == vehicleId)',
  '    .GroupBy(r => r.Timestamp.Hour)',
  '    .Select(g => new { Hour = g.Key, AvgTemp = g.Average(r => r.EngineTemp) })',
  '    .OrderBy(x => x.Hour)',
  '    .ToListAsync();',
  '',
  'return raw.Select(x => (object)new { Hour = x.Hour, AvgTemp = Math.Round(x.AvgTemp, 2) }).ToList();',
], 'C#');
B('Groups all readings by the hour component of their timestamp (0–23)');
B('Calculates average EngineTemp per hour — entire query runs on SQL Server');
B('Math.Round applied AFTER ToListAsync — rounding is done in C# because SQL decimal rounding behavior differs slightly from C#');
B('Powers the hourly bar chart on the Dashboard');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 12 — SimulatorBackgroundService.cs
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('12.  Simulator/SimulatorBackgroundService.cs  —  Background Thread Manager', C.sectionBanner, 13);
CODE([
  'public class SimulatorBackgroundService : BackgroundService {',
  '    private readonly IServiceScopeFactory _scopeFactory;',
  '',
  '    public SimulatorBackgroundService(IServiceScopeFactory scopeFactory) {',
  '        _scopeFactory = scopeFactory;',
  '    }',
  '',
  '    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {',
  '        while (!stoppingToken.IsCancellationRequested) {',
  '            using var scope = _scopeFactory.CreateScope();',
  '            var db = scope.ServiceProvider.GetRequiredService<TelemetryDbContext>();',
  '            await JourneySimulator.ReplayJourney(db);',
  '            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);',
  '        }',
  '    }',
  '}',
], 'C# — SimulatorBackgroundService.cs');
B('Extends BackgroundService — ASP.NET hosted service that starts when the app starts and stops when the app shuts down');
B('IServiceScopeFactory injected in constructor — this is a CRITICAL design decision:');
SB('Background services are Singleton lifetime (one instance for the app\'s lifetime)');
SB('TelemetryDbContext is Scoped lifetime (one instance per HTTP request)');
SB('You CANNOT inject a Scoped service into a Singleton — it causes a "captive dependency" problem where the same DbContext is shared and gets into a bad state');
SB('Solution: inject IServiceScopeFactory and create a NEW scope per iteration');
B('while (!stoppingToken.IsCancellationRequested): runs forever until the app receives a shutdown signal');
B('using var scope: the using keyword ensures the scope (and its DbContext) is disposed after each iteration — no connection leaks');
B('Task.Delay(30 seconds, stoppingToken): waits 30 seconds before the next cycle. Passing stoppingToken means if the app shuts down mid-wait, the delay is cancelled immediately — no 30-second hang on shutdown');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 13 — JourneySimulator.cs
// ══════════════════════════════════════════════════════════════════════════════
banner('13.  Simulator/JourneySimulator.cs  —  Telemetry Data Generator', C.sectionBanner, 13);
CODE([
  'public static class JourneySimulator {',
  '    public static async Task ReplayJourney(TelemetryDbContext db) {',
  '        var rng = Random.Shared;',
  '        var vehicles = await db.Vehicles.ToListAsync();',
  '        if (vehicles.Count == 0) { Console.WriteLine("No vehicles."); return; }',
  '',
  '        var waypoints = new[] {',
  '            (13.0827, 80.2707), (13.0900, 80.2780),',
  '            (13.0950, 80.2830), (13.1000, 80.2900),',
  '            (13.1050, 80.2950), (13.1100, 80.3000)',
  '        };',
  '',
  '        for (int step = 0; step < waypoints.Length; step++) {',
  '            var (lat, lon) = waypoints[step];',
  '            foreach (var vehicle in vehicles) {',
  '                var reading = new VehicleReading {',
  '                    VehicleId   = vehicle.VehicleId,',
  '                    Speed       = Math.Round((decimal)(40 + rng.NextDouble() * 80), 2),',
  '                    EngineTemp  = Math.Round((decimal)(75 + rng.NextDouble() * 30), 2),',
  '                    Lat         = (decimal)(lat + rng.NextDouble() * 0.005),',
  '                    Lon         = (decimal)(lon + rng.NextDouble() * 0.005),',
  '                    Timestamp   = DateTime.UtcNow',
  '                };',
  '                db.VehicleReadings.Add(reading);',
  '            }',
  '            await db.SaveChangesAsync();',
  '            await Task.Delay(200);',
  '        }',
  '    }',
  '}',
], 'C# — JourneySimulator.cs');
B('Static class and static method — no instance needed, no dependencies to inject');
B('Random.Shared — thread-safe shared Random instance. Better than new Random() inside a loop which can produce the same sequence when called rapidly');
B('Loads all vehicles first — if none exist, logs and exits safely');
B('6 Chennai waypoints forming a real city route from Anna Salai area toward Anna Nagar');
B('For each waypoint (6 steps) × each vehicle:');
SB('Speed: 40 + (random * 80) → range 40.00–120.00 km/h, rounded to 2 decimals');
SB('EngineTemp: 75 + (random * 30) → range 75.00–105.00°C');
SB('Lat: waypoint latitude + (random * 0.005) → random perturbation of ~0–550 metres');
SB('Lon: same perturbation for longitude — simulates natural GPS drift');
SB('Timestamp: DateTime.UtcNow — server time, always UTC');
B('db.VehicleReadings.Add(reading) — adds to EF change tracker without hitting DB yet');
B('db.SaveChangesAsync() after each step — flushes all vehicles for that step in one SQL transaction');
B('Task.Delay(200) — 200ms pause between steps, simulates realistic vehicle movement pacing');
B('Result: 6 readings per vehicle per 30-second simulator cycle');

// ══════════════════════════════════════════════════════════════════════════════
//  FRONTEND SECTION DIVIDER
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('🔶  FRONTEND — vehicle-telemetry-ui (React 19 + Vite)', C.frontendBanner, 17);
P('The frontend is a React 19 single-page application built with Vite. It connects to the .NET backend through a Vite dev proxy — all /api calls are forwarded to https://localhost:7065. No CORS issues in development, no hardcoded backend URL in the frontend code.');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 14 — main.jsx
// ══════════════════════════════════════════════════════════════════════════════
banner('14.  main.jsx  —  React App Bootstrap', C.sectionBanner, 13);
CODE([
  'import { StrictMode } from "react"',
  'import { createRoot } from "react-dom/client"',
  'import "./index.css"',
  'import App from "./App.jsx"',
  'import { AuthProvider } from "./contexts/AuthContext.jsx"',
  '',
  'createRoot(document.getElementById("root")).render(',
  '  <StrictMode>',
  '    <AuthProvider>',
  '      <App />',
  '    </AuthProvider>',
  '  </StrictMode>,',
  ')',
], 'JSX — main.jsx');
B('createRoot(getElementById("root")): mounts the React app into the <div id="root"> in index.html — this is the single mount point for the entire SPA');
B('StrictMode: in development, renders components twice to catch side effects and deprecated usage. Has no effect in production');
B('AuthProvider wraps the ENTIRE app — this means any component anywhere in the tree can call useAuth() and get the logged-in user\'s data');
B('Without AuthProvider wrapping App, any useAuth() call would return the default context value (null), causing crashes');
B('index.css: global styles including CSS variables for theming, imported here so they apply to everything');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 15 — App.jsx
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('15.  App.jsx  —  Root Layout, Navigation & Theme', C.sectionBanner, 13);
P('This is the skeleton of the entire application. It renders the sidebar, manages page routing, controls the theme, and computes the live alert count badge.');

H2('State');
B('page: string — currently active page ("dashboard", "alerts", "analytics", "reports", "vehicles", "about")');
B('theme: "light" or "dark" — initialized from localStorage so preference survives page refresh');
B('alertCount: number — live count of active alerts shown as a red badge on the Alerts nav button');

H2('Theme Effect (Lines 93–96)');
CODE([
  'useEffect(() => {',
  '    document.documentElement.setAttribute("data-theme", theme);',
  '    localStorage.setItem("theme", theme);',
  '}, [theme]);',
], 'JSX');
B('Sets data-theme attribute on the <html> element — CSS variables in index.css respond to this (var(--bg), var(--text), etc.)');
B('Saves to localStorage — the theme is remembered across sessions');

H2('Alert Count Effect (Lines 99–118)');
CODE([
  'async function fetchAlertCount() {',
  '    const { data: vehicles } = await getVehicles();',
  '    let count = 0;',
  '    for (const v of vehicles) {',
  '        const { data: r } = await getLatestReading(v.vehicleId);',
  '        const minutesAgo = (Date.now() - new Date(r.timestamp).getTime()) / 60000;',
  '        if (r.engineTemp > 100) count++;',
  '        if (r.speed > 100) count++;',
  '        if (minutesAgo > 15) count++;',
  '    }',
  '    setAlertCount(count);',
  '}',
], 'JSX');
B('Only runs if user is logged in (if (!user) return)');
B('Calls getVehicles() then getLatestReading() for each — builds the alert count from live data');
B('Three alert conditions: engine temp critical, overspeed, or offline — each increments count');
B('This count appears as the badge number on the Alerts nav item in the sidebar');

H2('Auth Guard (Line 120)');
CODE(['if (!user) return <AuthPage />;'], 'JSX');
B('If the user is not logged in (user is null in AuthContext), the entire app is replaced with AuthPage');
B('No router needed — a simple conditional handles the auth gate');
B('Once login succeeds, AuthContext sets user, this condition becomes false, and the full app renders');

H2('NAV Array (Lines 124–146)');
B('Defines sidebar navigation groups: MONITOR, ANALYSE, SYSTEM');
B('canEdit() check: the Vehicles item is only added to NAV if the user is an Admin');
SB('Viewers literally do not have a Vehicles link — it is not rendered at all, not just disabled');
B('badge: alertCount on the Alerts item — shows the live alert count as a red badge');

H2('Sidebar Layout');
B('Brand row: Logo SVG + "VehicleIQ" + "Fleet Intelligence" text');
B('NAV groups rendered with section labels (MONITOR, ANALYSE, SYSTEM)');
B('Each nav item is a <button> with active class when page matches — CSS handles the highlight');
B('Sidebar user section: avatar (first letter of username), name, email, role badge, logout button');
B('Theme toggle at bottom: shows Moon icon in light mode, Sun icon in dark mode');

H2('Main Content');
B('Conditional rendering by page state: {page === "dashboard" && <Dashboard />}');
B('AlertsPage receives onCountChange={setAlertCount} — it can update the sidebar badge when alerts change status');
B('All inline SVG icons (NavIcon, SunIcon, MoonIcon, LogoutIcon) defined as sub-functions — no icon library dependency');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 16 — AuthContext.jsx
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('16.  contexts/AuthContext.jsx  —  Global Auth State', C.sectionBanner, 13);
P('This is the central nervous system for authentication on the frontend. It manages the logged-in user state and exposes login, logout, register, and role-checking helpers to every component.');

CODE([
  'const AuthContext = createContext(null);',
  '',
  'export function AuthProvider({ children }) {',
  '  const [user, setUser] = useState(() => {',
  '    try {',
  '      const saved = localStorage.getItem("auth_user");',
  '      return saved ? JSON.parse(saved) : null;',
  '    } catch { return null; }',
  '  });',
  '',
  '  const login = async (email, password) => {',
  '    const { data } = await loginUser({ email, password });',
  '    const userData = { token: data.token, username: data.username,',
  '                       email: data.email, expiresAt: data.expiresAt, role: data.role };',
  '    localStorage.setItem("auth_user", JSON.stringify(userData));',
  '    localStorage.setItem("auth_token", data.token);',
  '    setUser(userData);',
  '    return userData;',
  '  };',
  '',
  '  const logout = () => {',
  '    localStorage.removeItem("auth_user");',
  '    localStorage.removeItem("auth_token");',
  '    setUser(null);',
  '  };',
  '',
  '  const isAdmin  = () => user?.role === "Admin";',
  '  const isViewer = () => user?.role === "Viewer";',
  '  const canEdit  = () => user?.role === "Admin";',
  '}',
], 'JSX — AuthContext.jsx');

H2('State Initialization');
B('useState with initializer function — runs ONLY once on mount, not on every re-render');
B('Reads "auth_user" from localStorage — if found and valid JSON, restores the session');
B('Try-catch around JSON.parse — if localStorage data is corrupted, returns null safely');
B('This is why you stay logged in after a page refresh — the session is rehydrated from storage');

H2('login(email, password)');
B('Calls loginUser() from api.js — sends POST /api/auth/login');
B('Builds userData object with all 5 fields: token, username, email, expiresAt, role');
B('Stores in TWO localStorage keys:');
SB('"auth_user": full user object — for session restoration on page refresh');
SB('"auth_token": just the token string — for the Axios interceptor to pick up quickly');
B('setUser(userData) — triggers re-render. App.jsx sees user is no longer null and shows the full app');

H2('logout()');
B('Removes both localStorage keys — token is gone, user object is gone');
B('setUser(null) — triggers re-render. App.jsx sees null and shows AuthPage');

H2('Helper Functions');
B('isAdmin(): user?.role === "Admin" — the ?. optional chaining handles null user without throwing');
B('isViewer(): user?.role === "Viewer"');
B('canEdit(): same as isAdmin() — a semantic alias. Used in places where "edit" makes more sense contextually than "admin"');

H2('Context Provider');
B('AuthContext.Provider exposes 7 values: user, login, register, logout, isAdmin, isViewer, canEdit');
B('useAuth = () => useContext(AuthContext) — convenience hook so components import one thing instead of two');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 17 — api.js
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('17.  services/api.js  —  Centralized HTTP Layer', C.sectionBanner, 13);
P('This is the single file that handles ALL API communication. No component ever calls fetch() directly. Everything goes through this module.');

CODE([
  'import axios from "axios";',
  '',
  'const api = axios.create({ timeout: 5000 });',
  'const BASE = "/api";',
  '',
  'api.interceptors.request.use(config => {',
  '  const token = localStorage.getItem("auth_token");',
  '  if (token) config.headers.Authorization = `Bearer ${token}`;',
  '  return config;',
  '});',
  '',
  'export const loginUser    = (data) => api.post(`${BASE}/auth/login`, data);',
  'export const registerUser = (data) => api.post(`${BASE}/auth/register`, data);',
  '',
  'export const getVehicles       = ()         => api.get(`${BASE}/vehicles`);',
  'export const getLatestReading  = (id)       => api.get(`${BASE}/vehicles/${id}/readings/latest`);',
  'export const getReadings       = (id, f, t) => api.get(`${BASE}/vehicles/${id}/readings`,',
  '                                                 { params: { from: f||undefined, to: t||undefined } });',
  'export const getVehicleSummary = (id)       => api.get(`${BASE}/vehicles/${id}/summary`);',
  'export const getTop5Today      = ()         => api.get(`${BASE}/vehicles/top5-speed-today`);',
  'export const addReading        = (id, data) => api.post(`${BASE}/vehicles/${id}/readings`, data);',
  'export const getAvgTempPerHour = (id)       => api.get(`${BASE}/vehicles/${id}/readings/avg-engine-temp-per-hour`);',
  'export const createVehicle     = (data)     => api.post(`${BASE}/vehicles`, data);',
  'export const updateVehicle     = (id, data) => api.put(`${BASE}/vehicles/${id}`, data);',
  'export const deleteVehicle     = (id)       => api.delete(`${BASE}/vehicles/${id}`);',
], 'JS — services/api.js');

H2('Axios Instance');
B('axios.create({ timeout: 5000 }): creates a custom Axios instance with a 5-second timeout — all requests through this instance are automatically cancelled if the backend does not respond');
B('BASE = "/api": relative URL — Vite dev server proxy intercepts /api/* and forwards to https://localhost:7065. The frontend never hardcodes the backend URL');

H2('Request Interceptor — The Key Piece');
B('Runs before EVERY single request made through this Axios instance');
B('Reads auth_token from localStorage');
B('If token exists, adds "Authorization: Bearer {token}" header to the request config');
B('Returns the modified config — the request then proceeds with the auth header');
B('This means ZERO individual components ever handle auth headers. It is centralized here');

H2('API Functions');
B('loginUser and registerUser: the only two that work without a token (backend has no [Authorize] on those endpoints)');
B('getReadings(id, from, to): from and to passed as query params. Undefined values are omitted by Axios — so calling getReadings(1, null, null) produces GET /api/vehicles/1/readings with no query string');
B('All other functions: straightforward REST calls with the vehicleId in the URL');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 18 — Dashboard.jsx
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('18.  components/Dashboard.jsx  —  Real-Time Fleet Overview', C.sectionBanner, 13);
P('This is the most complex component in the project. It polls live data every 15 seconds, computes vehicle status, generates alerts, builds multiple chart datasets, and renders six distinct UI sections.');

H2('Critical UTC Timestamp Fix');
CODE([
  'const parseTS = ts => ts ? new Date(ts.endsWith("Z") ? ts : ts + "Z") : null;',
], 'JS');
B('SQL Server via EF Core strips the UTC "Z" suffix from ISO datetime strings when serializing to JSON');
B('JavaScript sees "2026-05-12T08:30:00" without Z and treats it as LOCAL time (IST = UTC+5:30)');
B('This inflates minutesAgo by 330 minutes — every vehicle falsely appears offline');
B('Fix: if the timestamp does not end in "Z", append it — forces JavaScript to parse as UTC');

H2('State Variables');
B('vehicles: enriched list — base vehicle data + speed, temp, status, GPS, lastSeen from latest reading');
B('stats: aggregate numbers — active count, peak speed, alert count, critical alert count');
B('alerts: top 3 active alerts shown in the Alerts panel card');
B('top5: leaderboard array for the Top 5 bar chart');
B('hourlyData: 24-slot array (hours 0–23) with reading count per hour for the bar chart');
B('trendData: { points, vehicleNames } — aligned data points for the multi-vehicle speed line chart');
B('countdown: seconds until next refresh (counts 15→14→...→1→15)');
B('expandedId: vehicleId of the expanded fleet row (null = all collapsed)');
B('summaries: cached summary data per vehicleId — loaded on demand when a row is expanded');

H2('Two Intervals (Lines 36–52)');
CODE([
  'refreshRef.current = setInterval(() => {',
  '    loadDashboard();',
  '    setCountdown(REFRESH_SEC);',
  '}, REFRESH_SEC * 1000);',
  '',
  'countdownRef.current = setInterval(() => {',
  '    setCountdown(c => (c <= 1 ? REFRESH_SEC : c - 1));',
  '}, 1000);',
  '',
  'return () => {',
  '    clearInterval(refreshRef.current);',
  '    clearInterval(countdownRef.current);',
  '};',
], 'JSX');
B('First interval: reloads all data every 15 seconds');
B('Second interval: decrements the countdown timer every second — purely visual');
B('useRef stores the interval IDs so they survive re-renders without creating new intervals');
B('Cleanup function: both intervals are cleared when the component unmounts — prevents memory leaks');

H2('loadDashboard() — Main Data Fetcher');
B('Step 1: getVehicles() — gets base vehicle list');
B('Step 2: Promise.all over all vehicles simultaneously — fetches getLatestReading for each in parallel (not sequentially)');
SB('Computes minutesAgo using parseTS to handle the UTC fix');
SB('Status logic: offline if > 15 min, warning if speed > 100 OR temp > 100, online otherwise');
SB('Enriches each vehicle: adds speed, temp, status, GPS coords, lastSeen');
B('Step 3: For each vehicle — getVehicleSummary() — accumulates totalReadings, tracks fleetwide peakSpeed');
B('Step 4: Alert generation — three types:');
SB('engineTemp > 100: type "critical", icon "temp"');
SB('speed > 100: type "warning", icon "speed"');
SB('status === "offline": type "info", icon "offline" with minutes offline');
B('Step 5: Top 3 alerts stored. Full count stored in stats');
B('Step 6: getTop5Today() — falls back to sorting enriched vehicles if API returns empty');
B('Step 7: buildReadingsData(enriched) — builds hourly and trend chart data');

H2('buildReadingsData()');
B('Creates 24-slot hours array — one entry per hour of the day');
B('For each vehicle: getReadings(vehicleId, last24h) — fetches readings from past 24 hours');
B('Counts readings per hour slot — drives the hourly bar chart');
B('Takes last 20 readings per vehicle for trend data');
B('Aligns by index: the vehicle with most readings sets the X-axis (time labels), all others align to it');
B('Each chart point: { time: "14:30", "Vehicle Alpha": 87.3, "Vehicle Beta": 72.1 } — Recharts plots a Line per key');

H2('SVG Radial Temperature Gauge (TempGauge sub-component)');
CODE([
  'const arc  = circ * 0.75;  // 270 degree sweep',
  'const progress = Math.max(0, Math.min(1, (t - MIN) / (MAX - MIN)));',
  'const fill  = arc * progress;',
  'const color = t > 100 ? "#ef4444" : t > 87 ? "#f59e0b" : "#22c55e";',
], 'JSX — TempGauge');
B('Two SVG circles drawn as arcs using strokeDasharray');
B('Track circle: full 270° arc in grey — the background gauge track');
B('Value circle: partial arc based on progress ratio (temp - 60) / (120 - 60)');
B('CSS transition on strokeDasharray: 0.7s ease — the gauge fill animates smoothly on update');
B('Color thresholds: green < 87°C, amber 87–100°C, red > 100°C');
B('Shows "offline" text centered if temp is null (vehicle offline)');

H2('PulseBadge sub-component');
B('Three status configs: Online (green), Warning (amber), Offline (grey)');
B('CSS animation class (pdot-online, pdot-warning, pdot-offline) drives the pulsing dot animation');

H2('StatCard sub-component');
B('Background image from Unsplash (vehicles/speed/alert themed photos)');
B('Dark overlay div (stat-card-overlay) ensures text stays readable over the photo');
B('--sc-accent CSS variable colors the value and icon per card');
B('Color-coded bottom bar for visual accent');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 19 — AuthPage.jsx
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('19.  components/AuthPage.jsx  —  Login & Registration UI', C.sectionBanner, 13);

H2('State');
B('mode: "login" or "register" — controls which form fields render');
B('form: controlled object with 6 fields — username, email, password, confirm, role, roleCode');
B('error: shown in a red banner above the form');
B('info: shown in a blue banner (e.g. "Account created! Please sign in.")');
B('loading: disables submit button and shows spinner while API call is in flight');

H2('set(field) helper');
CODE(['const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));'], 'JSX');
B('Returns an onChange handler for any field. set("username") returns a function that updates just the username');
B('Avoids writing a separate handler function for each of the 6 form fields');

H2('switchMode(m)');
B('Changes mode AND resets form + error + info — clean slate when switching between Sign In and Create Account tabs');

H2('handleSubmit — Client-Side Validation');
B('Prevents default form submission (e.preventDefault())');
B('For register mode, validates IN ORDER:');
SB('Username not empty');
SB('Email not empty');
SB('Email regex — same pattern as the backend DTO');
SB('Password regex — same pattern as the backend DTO (min 8 chars, uppercase, digit, special)');
SB('Passwords match (form.password === form.confirm)');
SB('If role is "Admin" and roleCode is empty — shows error');
B('For login mode: email not empty, valid email regex, password not empty');
B('If any validation fails: setError() is called and function returns — no API call made');
B('Client-side validation mirrors server-side DTO validation — provides instant feedback without a round-trip');

H2('Layout — Split Panel Design');
B('Left panel (auth-brand): Logo + "VehicleIQ" + "Fleet Intelligence Platform" + feature bullet list. Pure branding, no logic');
B('Right panel (auth-form-panel): all the interactive form content');
B('Tab switcher: Sign In / Create Account buttons. Active tab has visual highlight via CSS class');
B('Conditional fields: username, confirm password, role dropdown, and admin code field only appear in register mode');
B('Admin code field appears only when role dropdown is set to "Admin" — conditional rendering based on form.role');
B('Submit button: disabled={loading} prevents double-submits. Shows <span className="auth-spinner" /> while loading');
B('Switch hint at bottom: "Don\'t have an account? Create one" — link calls switchMode()');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 20 — AlertsPage.jsx
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('20.  components/AlertsPage.jsx  —  Alert Management', C.sectionBanner, 13);

H2('Alert Generation (loadAlerts)');
B('Calls getVehicles() — then for each vehicle sequentially:');
SB('getLatestReading(vehicleId) — to check current speed, temp, timestamp');
SB('getVehicleSummary(vehicleId) — to check totalReadings (used for GPS accuracy alert)');
B('minutesAgo computed using parseTS (same UTC fix as Dashboard)');
gap(0.2);
B('Five alert types generated:');
SB('engineTemp > 95: severity "warning". engineTemp > 100: severity "critical". Alert: "Engine overheating"');
SB('engineTemp > 90 (and not > 95): severity "info". Alert: "High engine temp"');
SB('speed > 100: severity "warning". speed > 115: severity "critical". Alert: "Overspeed"');
SB('minutesAgo > 15: severity based on duration, status always "active". Alert: "Vehicle offline"');
SB('totalReadings < 50 and has GPS: severity "info", status "resolved". Alert: "Low GPS accuracy" (simulated)');
B('Status logic for temp and speed alerts:');
SB('If minutesAgo < 10: status = "active" (recent alert, still relevant)');
SB('If minutesAgo >= 10: status = "resolved" (alert condition may have passed)');
B('Line 112–114: every 3rd resolved alert is changed to "acknowledged" — creates a realistic mix of statuses for demo');

H2('Alert Status Handlers (Client-side only)');
CODE([
  'function handleAcknowledge(id) {',
  '    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "acknowledged" } : a));',
  '}',
  'function handleReopen(id) {',
  '    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "active" } : a));',
  '}',
], 'JSX');
B('Uses immutable update pattern — maps over alerts and replaces the matching one');
B('These changes are client-side only — not persisted to the backend database');
B('Real production systems would call a PATCH /api/alerts/{id} endpoint');

H2('Filters and Sorting');
B('statusFilter: "all", "active", "acknowledged", "resolved" — filter chips at top');
B('typeFilter: "all", "critical", "warning", "info" — severity filter chips');
B('sort: "newest" sorts by ascending minutesAgo (smaller = more recent), "oldest" reverses');
B('All three applied in sequence: filter by status → filter by severity → sort');

H2('Table Layout');
B('7 columns: Severity badge, Vehicle name + plate, Alert type, Value + threshold text, Time, Status badge, Action button');
B('Action buttons:');
SB('"Acknowledge" button shown for active alerts — calls handleAcknowledge');
SB('"Acknowledged" disabled button shown for acknowledged alerts');
SB('"Re-open" button shown for resolved alerts — calls handleReopen');
B('onCountChange prop: called whenever alerts change — updates the sidebar badge count in App.jsx');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 21 — VehiclesPage.jsx
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('21.  components/VehiclesPage.jsx  —  Admin Fleet Management', C.sectionBanner, 13);

H2('Sub-Components');
B('CarIconLarge: large SVG car illustration used in the empty state');
B('EditIcon / TrashIcon / WarningIcon: inline SVG icons for action buttons — no icon library');
B('VehicleCard: renders one vehicle card with icon, name, license plate badge, ID, and optional Edit/Delete buttons');
SB('onEdit and onDelete are optional props — if null, the button is not rendered');
SB('Same card component works for Admin (both buttons visible) and any future role that can only edit');
B('VehicleModal: shared modal for both Add and Edit — title prop switches the heading');
SB('Controlled form with name and licensePlate fields');
SB('Close on overlay click: e.target === e.currentTarget check prevents closing when clicking inside the modal box');
SB('Buttons are disabled while saving is true — prevents double-submit');
B('DeleteModal: confirms deletion with vehicle name and plate shown in warning text');
SB('Two buttons: Cancel and Delete Vehicle (styled danger/red)');

H2('Main VehiclesPage Logic');
B('loadVehicles(): calls getVehicles() → setVehicles(data). Shows error banner with Retry button on failure');
B('openAdd(): clears form to empty strings, clears formError, opens add modal');
B('openEdit(vehicle): pre-fills form with vehicle\'s existing name and licensePlate, opens edit modal');

H2('CRUD Handlers');
CODE([
  'async function handleAdd() {',
  '    if (!form.name.trim() || !form.licensePlate.trim()) {',
  '        setFormError("Both fields are required."); return;',
  '    }',
  '    setSaving(true);',
  '    try {',
  '        await createVehicle({ name: form.name.trim(), licensePlate: form.licensePlate.trim() });',
  '        setAddModal(false);',
  '        loadVehicles();',
  '    } catch { setFormError("Failed to add vehicle. Please try again."); }',
  '    finally { setSaving(false); }',
  '}',
], 'JSX');
B('.trim() on both fields: removes leading/trailing whitespace before validation and before sending');
B('setSaving(true) disables buttons during the API call');
B('On success: closes modal, reloads vehicle list from server');
B('handleEdit: same pattern — calls updateVehicle(editModal.vehicleId, form)');
B('handleDelete: calls deleteVehicle(deleteModal.vehicleId). Best-effort — no error handling, modal closes regardless');

H2('UI States');
B('Loading: spinner with "Loading vehicles..."');
B('Error: red banner with error message and Retry button');
B('Empty (no vehicles): CarIconLarge + descriptive text + "Add Vehicle" CTA button');
B('Has vehicles: grid of VehicleCard components');
B('canEdit() check gates the Add Vehicle button — Viewers never see it');
B('isAdmin() check gates the Delete button on each card — more granular than canEdit()');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 22 — AnalyticsPage.jsx
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('22.  components/AnalyticsPage.jsx  —  Historical Trends & GPS Map', C.sectionBanner, 13);

H2('Two Independent Data Effects');
B('Effect 1 — re-runs every time the range state changes (24h, 7d, 30d):');
SB('Parallel: getVehicles() + getTop5Today() with Promise.all');
SB('Then: getReadings(vehicleId, from, to) for every vehicle simultaneously');
SB('Combines all readings into one array → passes to bucketReadings()');
SB('Computes summary: totalReadings, avgSpeed, avgTemp across all vehicles and the selected time range');
SB('cancelled flag prevents stale state updates if the user changes range before the previous load finishes');
B('Effect 2 — GPS locations, runs once then polls every 10 seconds:');
SB('getVehicles() → getLatestReading() for each vehicle');
SB('Builds locations array: [{ vehicleId, name, color, data: [{lat, lon}] }]');
SB('Color assigned from COLORS palette by vehicle index');
SB('setInterval(fetchLocations, 10000) — updates GPS positions every 10s independently of the chart data');
SB('Cleanup: clearInterval on unmount — no lingering intervals');

H2('bucketReadings() — Data Aggregation');
CODE([
  'function bucketReadings(readings, range) {',
  '  const fmt = (d) => range === "24h" ? `${d.getHours()}:00` : `${d.getMonth()+1}/${d.getDate()}`;',
  '  const buckets = {};',
  '  for (const r of readings) {',
  '    const d = new Date(r.timestamp);',
  '    const key = range === "24h"',
  '      ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).getTime()',
  '      : new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();',
  '    if (!buckets[key]) buckets[key] = { label: fmt(new Date(key)), speeds: [], temps: [] };',
  '    buckets[key].speeds.push(r.speed);',
  '    buckets[key].temps.push(r.engineTemp);',
  '  }',
  '  return Object.values(buckets).sort(...).map(b => ({',
  '    label: b.label,',
  '    "Avg Speed": +(average of speeds).toFixed(1),',
  '    "Avg Temp":  +(average of temps).toFixed(1),',
  '  }));',
  '}',
], 'JSX');
B('Groups all readings (from ALL vehicles combined) into time buckets');
B('24h mode: buckets by hour — label is "14:00"');
B('7d/30d mode: buckets by day — label is "5/12" (month/day)');
B('Each bucket accumulates all speed and temp values for that period, then averages them');
B('Output: array of { label, "Avg Speed", "Avg Temp" } — directly used by Recharts LineChart');

H2('Custom GPS Map (GpsMap component)');
B('Pure SVG — no Google Maps, Leaflet, or any map library');
B('Coordinate projection:');
SB('toX(lon): linear mapping from lon range → pixel X within padded SVG area');
SB('toY(lat): inverted — SVG Y increases downward, but latitude increases upward, so Y is inverted');
SB('25% padding added around bounding box — edge vehicles have breathing room');
B('Map tiles: 4×4 checkerboard of dark rectangles — creates the map tile aesthetic');
B('Grid lines: dashed SVG lines at 5 evenly-spaced lat/lon values with coordinate labels');
B('Vehicle pins:');
SB('Two SVG <animate> elements — expanding ring effect (r: 8→20→8 over 2.4s, staggered)');
SB('Pin shape: SVG <path> with bezier curves forming a teardrop/map-pin shape');
SB('feDropShadow filter: colored glow shadow matching the vehicle\'s assigned color');
SB('Centre hole: small dark circle');
SB('Label: vehicle name below pin, highlighted on hover');
B('Compass rose: top-right corner with N label');
B('"GPS LIVE" badge: top-left with animated pulsing green dot');
B('Hover tooltip: position:absolute div at bottom-left showing vehicle name + precise lat/lon');

// ══════════════════════════════════════════════════════════════════════════════
//  FILE 23 — ReportsPage.jsx
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('23.  components/ReportsPage.jsx  —  Report Generation & CSV Export', C.sectionBanner, 13);

H2('generateReports() — runs on mount');
B('getVehicles() — gets full vehicle list');
B('For each vehicle in parallel (Promise.all):');
SB('getVehicleSummary() → totalReadings, peakSpeed');
SB('getLatestReading() → currentSpeed, currentTemp, lastReading');
SB('status computed: "Active" if latestReading exists, "Offline" if API threw');
B('getTop5Today() for top speed data');
B('Fallback if getTop5Today() fails: sorts vehicleSummaries by peakSpeed client-side, takes top 5');
B('Two report objects created: "vehicle-summary" and "top-speed" — stored in reports state');

H2('downloadReport(report) — CSV Export');
CODE([
  'const downloadReport = (report) => {',
  '    let csvContent = "";',
  '    if (report.id === "vehicle-summary") {',
  '        csvContent = "Vehicle ID,Name,License Plate,Total Readings,Peak Speed,...\\n";',
  '        report.data.forEach(v => { csvContent += `${v.vehicleId},${v.name},...\\n`; });',
  '    }',
  '    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });',
  '    const link = document.createElement("a");',
  '    link.setAttribute("href", URL.createObjectURL(blob));',
  '    link.setAttribute("download", `${report.title}_2026-05-12.csv`);',
  '    link.style.visibility = "hidden";',
  '    document.body.appendChild(link);',
  '    link.click();',
  '    document.body.removeChild(link);',
  '};',
], 'JSX');
B('Builds CSV string row by row with a header row first');
B('vehicle-summary CSV columns: Vehicle ID, Name, License Plate, Total Readings, Peak Speed, Current Speed, Engine Temp, Status');
B('top-speed CSV columns: Rank, Vehicle ID, Name, Peak Speed');
B('Blob trick: creates an in-memory file object with the CSV data');
B('Invisible <a> element: created, href set to the blob URL, download attribute sets the filename');
B('Programmatic click: triggers the browser\'s native file download dialog');
B('Cleanup: element removed from DOM immediately after click');
B('Filename: spaces in report title replaced with underscores, date appended — e.g. "Vehicle_Summary_Report_2026-05-12.csv"');

H2('viewReportDetails(report) — Modal');
B('setSelectedReport(report) → triggers modal render');
B('Modal overlay click: onClick on overlay closes it. e.stopPropagation() on modal box prevents clicks inside from closing');
B('vehicle-summary modal: 7-column table — Vehicle, License Plate, Total Readings, Peak Speed, Current Speed, Engine Temp, Status');
B('top-speed modal: 4-column table — Rank, Vehicle, Peak Speed, Recorded At');

// ══════════════════════════════════════════════════════════════════════════════
//  QUICK REFERENCE TABLE
// ══════════════════════════════════════════════════════════════════════════════
doc.addPage();
banner('Quick Reference — All Files at a Glance', '#1e293b', 14);
gap(0.3);
TABLE(
  ['#', 'File', 'Purpose', 'Key Concept'],
  [
    ['1',  'Program.cs',                  'App bootstrap & DI',          'Middleware order matters'],
    ['2',  'TelemetryDbContext.cs',        'Database gateway',             'Composite index (VehicleId, Timestamp)'],
    ['3',  'User.cs',                      'User entity',                  'BCrypt hash stored, not plaintext'],
    ['4',  'Vehicle.cs',                   'Vehicle entity',               '1:N to VehicleReading'],
    ['5',  'VehicleReading.cs',            'Telemetry data entity',        'decimal type for precision'],
    ['6',  'AuthDtos.cs',                  'Request/response shapes',      'Password regex validation'],
    ['7',  'AuthService.cs',               'Auth business logic',          'BCrypt + JWT with 5 claims'],
    ['8',  'VehicleService.cs',            'Vehicle aggregations',         'Server-side GROUP BY via LINQ'],
    ['9',  'AuthController.cs',            'Auth endpoints',               'No [Authorize] — public'],
    ['10', 'VehiclesController.cs',        'Vehicle CRUD',                 'AsNoTracking on reads'],
    ['11', 'ReadingsController.cs',        'Telemetry endpoints',          'Nested route with vehicleId'],
    ['12', 'SimulatorBackgroundService.cs','Background thread manager',    'IServiceScopeFactory for Scoped DI'],
    ['13', 'JourneySimulator.cs',          'Fake data generator',          'Chennai waypoints + random drift'],
    ['14', 'main.jsx',                     'React mount point',            'AuthProvider wraps entire tree'],
    ['15', 'App.jsx',                      'Layout + routing',             'canEdit() hides Vehicles nav'],
    ['16', 'AuthContext.jsx',              'Global auth state',            'localStorage persistence + helpers'],
    ['17', 'api.js',                       'HTTP layer',                   'Axios interceptor adds Bearer token'],
    ['18', 'Dashboard.jsx',               'Live monitoring',              'parseTS UTC fix, 15s polling, SVG gauges'],
    ['19', 'AuthPage.jsx',                'Login/register UI',            'Client + server-side validation mirror'],
    ['20', 'AlertsPage.jsx',              'Alert management',             'Client-side threshold evaluation'],
    ['21', 'VehiclesPage.jsx',            'Fleet CRUD UI',                'Admin-gated, 3 modal types'],
    ['22', 'AnalyticsPage.jsx',           'Charts + GPS map',             'Custom SVG map, 10s GPS polling'],
    ['23', 'ReportsPage.jsx',             'Reports + CSV download',       'Blob download trick'],
  ]
);

// ─── page numbers ─────────────────────────────────────────────────────────────
pageNumbers();
doc.end();
console.log('Done → VehicleTelemetry_Files_Explained.pdf');
