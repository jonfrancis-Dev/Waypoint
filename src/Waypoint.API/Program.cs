using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Waypoint.Core.Interfaces;
using Waypoint.Infrastructure.Data;
using Waypoint.Infrastructure.Repositories;
using Waypoint.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// EF Core
builder.Services.AddDbContext<WaypointDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositories
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IUploadBatchRepository, UploadBatchRepository>();
builder.Services.AddScoped<ICreditCardRepository, CreditCardRepository>();
builder.Services.AddScoped<IDebtRepository, DebtRepository>();
builder.Services.AddScoped<ISavingsRepository, SavingsRepository>();
builder.Services.AddScoped<IBudgetRepository, BudgetRepository>();

// Services
builder.Services.AddScoped<ICsvImportService, CsvImportService>();

// OpenAPI / Scalar
builder.Services.AddOpenApi();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("AllowAngularDev");

// API Endpoints
var transactions = app.MapGroup("/api/transactions");

transactions.MapPost("/upload", async (IFormFile file, ICsvImportService csvImportService) =>
{
    if (file is null || file.Length == 0)
        return Results.BadRequest("No file uploaded.");

    using var stream = file.OpenReadStream();
    var batch = await csvImportService.ImportCsvAsync(stream, file.FileName);

    return Results.Ok(new
    {
        batch.Id,
        batch.FileName,
        batch.StatementMonth,
        batch.StatementYear,
        batch.TransactionCount,
        batch.UploadedAt
    });
})
.DisableAntiforgery()
.WithName("UploadTransactions");

transactions.MapGet("/", async (int month, int year, ITransactionRepository repo) =>
{
    var results = await repo.GetByMonthAndYearAsync(month, year);
    return Results.Ok(results.Select(t => new
    {
        t.Id,
        t.Date,
        t.Description,
        t.OriginalCategory,
        Category = t.NormalizedCategory,
        t.Amount,
        t.IsDebit
    }));
})
.WithName("GetTransactions");

app.Run();
