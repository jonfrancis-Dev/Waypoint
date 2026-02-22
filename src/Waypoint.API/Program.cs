using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Waypoint.Core.DTOs;
using Waypoint.Core.Interfaces;
using Waypoint.Infrastructure.Data;
using Waypoint.Infrastructure.Repositories;
using Waypoint.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

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
builder.Services.AddScoped<IBudgetService, BudgetService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ICreditCardService, CreditCardService>();
builder.Services.AddSingleton<ICreditCardCalculatorService, CreditCardCalculatorService>();

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

// Budget Endpoints
var budget = app.MapGroup("/api/budget");

budget.MapPost("/", async (BudgetCreateRequest request, IBudgetService budgetService) =>
{
    var result = await budgetService.CreateOrUpdateBudgetAsync(request.Month, request.Year, request.LineItems);
    return Results.Ok(result);
})
.WithName("CreateOrUpdateBudget");

budget.MapGet("/", async (int month, int year, IBudgetService budgetService) =>
{
    var result = await budgetService.GetBudgetAsync(month, year);
    return result is null ? Results.NotFound() : Results.Ok(result);
})
.WithName("GetBudget");

budget.MapGet("/summary", async (int month, int year, IBudgetService budgetService) =>
{
    var result = await budgetService.GetBudgetSummaryAsync(month, year);
    return result is null ? Results.NotFound() : Results.Ok(result);
})
.WithName("GetBudgetSummary");

budget.MapDelete("/{id:guid}", async (Guid id, IBudgetService budgetService) =>
{
    var deleted = await budgetService.DeleteBudgetAsync(id);
    return deleted ? Results.NoContent() : Results.NotFound();
})
.WithName("DeleteBudget");

// Dashboard Endpoints
var dashboard = app.MapGroup("/api/dashboard");

dashboard.MapGet("/summary", async (int month, int year, IDashboardService dashboardService) =>
{
    var result = await dashboardService.GetDashboardSummaryAsync(month, year);
    return Results.Ok(result);
})
.WithName("GetDashboardSummary");

dashboard.MapGet("/trends", async (int? months, IDashboardService dashboardService) =>
{
    var result = await dashboardService.GetTrendsAsync(months ?? 6);
    return Results.Ok(result);
})
.WithName("GetTrends");

// Credit Card Endpoints
var creditCards = app.MapGroup("/api/creditcards");

creditCards.MapGet("/", async (ICreditCardService svc) =>
    Results.Ok(await svc.GetAllCardsAsync()))
.WithName("GetAllCreditCards");

creditCards.MapGet("/{id:guid}", async (Guid id, ICreditCardService svc) =>
{
    var card = await svc.GetCardAsync(id);
    return card is null ? Results.NotFound() : Results.Ok(card);
})
.WithName("GetCreditCard");

creditCards.MapPost("/", async (CreateCreditCardDto dto, ICreditCardService svc) =>
{
    var card = await svc.CreateCardAsync(dto);
    return Results.Created($"/api/creditcards/{card.Id}", card);
})
.WithName("CreateCreditCard");

creditCards.MapPut("/{id:guid}", async (Guid id, UpdateCreditCardDto dto, ICreditCardService svc) =>
{
    try { return Results.Ok(await svc.UpdateCardAsync(id, dto)); }
    catch (KeyNotFoundException) { return Results.NotFound(); }
})
.WithName("UpdateCreditCard");

creditCards.MapDelete("/{id:guid}", async (Guid id, ICreditCardService svc) =>
{
    var deleted = await svc.DeleteCardAsync(id);
    return deleted ? Results.NoContent() : Results.NotFound();
})
.WithName("DeleteCreditCard");

creditCards.MapGet("/{id:guid}/metrics", async (Guid id, ICreditCardService svc) =>
{
    try { return Results.Ok(await svc.GetCardMetricsAsync(id)); }
    catch (KeyNotFoundException) { return Results.NotFound(); }
})
.WithName("GetCreditCardMetrics");

creditCards.MapGet("/metrics/all", async (ICreditCardService svc) =>
    Results.Ok(await svc.GetAllCardMetricsAsync()))
.WithName("GetAllCreditCardMetrics");

creditCards.MapPost("/{id:guid}/payments", async (Guid id, LogPaymentDto dto, ICreditCardService svc) =>
{
    try
    {
        var payment = await svc.LogPaymentAsync(id, dto);
        return Results.Ok(payment);
    }
    catch (KeyNotFoundException) { return Results.NotFound(); }
})
.WithName("LogCreditCardPayment");

creditCards.MapGet("/{id:guid}/payments", async (Guid id, ICreditCardService svc) =>
    Results.Ok(await svc.GetPaymentHistoryAsync(id)))
.WithName("GetCreditCardPayments");

creditCards.MapPost("/{id:guid}/statements", async (Guid id, CreateStatementDto dto, ICreditCardService svc) =>
{
    try
    {
        var statement = await svc.CreateStatementAsync(id, dto);
        return Results.Ok(statement);
    }
    catch (KeyNotFoundException) { return Results.NotFound(); }
})
.WithName("CreateCreditCardStatement");

creditCards.MapGet("/{id:guid}/statements", async (Guid id, ICreditCardService svc) =>
    Results.Ok(await svc.GetStatementsAsync(id)))
.WithName("GetCreditCardStatements");

creditCards.MapGet("/{id:guid}/payoff", async (Guid id, decimal monthlyPayment, ICreditCardService svc, ICreditCardCalculatorService calc) =>
{
    var card = await svc.GetCardAsync(id);
    if (card is null) return Results.NotFound();
    return Results.Ok(calc.ProjectSingleCardPayoff(card.CurrentBalance, card.APR, monthlyPayment));
})
.WithName("GetCreditCardPayoff");

creditCards.MapGet("/payoff-comparison", async (decimal extraPayment, ICreditCardService svc, ICreditCardCalculatorService calc) =>
{
    var cards = await svc.GetAllCardsAsync();
    if (cards.Count == 0) return Results.NotFound();
    return Results.Ok(calc.ProjectMultiCardPayoff(cards, extraPayment));
})
.WithName("GetPayoffComparison");

app.Run();

// Request DTOs
record BudgetCreateRequest(int Month, int Year, List<BudgetLineItemDto> LineItems);
