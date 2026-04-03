using Microsoft.EntityFrameworkCore;
using VehicleTelemetryAPI.Data;
using VehicleTelemetryAPI.Services;
using VehicleTelemetryAPI.Simulator;

var builder = WebApplication.CreateBuilder(args);

// EF Core + VehicleService
builder.Services.AddDbContext<TelemetryDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<VehicleService>();

// CORS
builder.Services.AddCors(opt => opt.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();          // must come before UseAuthorization and MapControllers
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TelemetryDbContext>();
    await JourneySimulator.ReplayJourney(db);
}

app.Run();