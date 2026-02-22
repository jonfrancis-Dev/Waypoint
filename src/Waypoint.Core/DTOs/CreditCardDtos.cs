namespace Waypoint.Core.DTOs;

// Request DTOs
public record CreateCreditCardDto(
    string Name,
    decimal CreditLimit,
    decimal CurrentBalance,
    decimal APR,
    int StatementClosingDay,
    int DueDay);

public record UpdateCreditCardDto(
    string Name,
    decimal CreditLimit,
    decimal CurrentBalance,
    decimal APR,
    int StatementClosingDay,
    int DueDay);

public record LogPaymentDto(
    decimal Amount,
    DateTime PaidOn,
    string? Note);

public record CreateStatementDto(
    int StatementMonth,
    int StatementYear,
    decimal OpeningBalance,
    decimal ClosingBalance,
    decimal InterestCharged,
    decimal MinimumDue);

// Response DTOs
public record CreditCardMetrics
{
    public Guid CardId { get; init; }
    public string Name { get; init; } = string.Empty;
    public decimal CurrentBalance { get; init; }
    public decimal CreditLimit { get; init; }
    public decimal UtilizationPercentage { get; init; }
    public decimal APR { get; init; }
    public decimal MinimumPayment { get; init; }
    public decimal DailyInterest { get; init; }
    public int MonthsToPayoffAtMinimum { get; init; }
    public decimal TotalInterestAtMinimum { get; init; }
    public string HealthStatus { get; init; } = string.Empty;
}

public record PayoffMonth
{
    public int MonthNumber { get; init; }
    public int Month { get; init; }
    public int Year { get; init; }
    public decimal OpeningBalance { get; init; }
    public decimal InterestCharged { get; init; }
    public decimal PaymentMade { get; init; }
    public decimal PrincipalApplied { get; init; }
    public decimal ClosingBalance { get; init; }
    public decimal CumulativeInterestPaid { get; init; }
}

public record PayoffProjection
{
    public List<PayoffMonth> Schedule { get; init; } = [];
    public int TotalMonths { get; init; }
    public decimal TotalInterestPaid { get; init; }
    public DateTime PayoffDate { get; init; }
    public decimal TotalPaid { get; init; }
}

public record MultiCardPayoffComparison
{
    public PayoffStrategy RecommendedStrategy { get; init; }
    public StrategyResult Avalanche { get; init; } = null!;
    public StrategyResult Snowball { get; init; } = null!;
    public ComparisonSummary Summary { get; init; } = null!;
}

public record StrategyResult
{
    public List<CardPayoffSchedule> CardSchedules { get; init; } = [];
    public int TotalMonths { get; init; }
    public decimal TotalInterestPaid { get; init; }
    public DateTime PayoffDate { get; init; }
}

public record CardPayoffSchedule
{
    public Guid CardId { get; init; }
    public string CardName { get; init; } = string.Empty;
    public List<PayoffMonth> Schedule { get; init; } = [];
    public DateTime PayoffDate { get; init; }
}

public record ComparisonSummary
{
    public decimal InterestSaved { get; init; }
    public int MonthsSaved { get; init; }
    public string Recommendation { get; init; } = string.Empty;
}

public enum PayoffStrategy
{
    Avalanche,
    Snowball
}
