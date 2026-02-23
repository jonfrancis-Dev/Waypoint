using Waypoint.Core.Enums;

namespace Waypoint.Core.DTOs;

// Request DTOs
public record CreateDebtDto(string Name, DebtType DebtType, decimal OriginalBalance, decimal CurrentBalance, decimal APR, decimal MinimumPayment, DateTime StartDate);
public record UpdateDebtDto(string Name, DebtType DebtType, decimal OriginalBalance, decimal CurrentBalance, decimal APR, decimal MinimumPayment, DateTime StartDate);
public record LogDebtPaymentDto(decimal Amount, DateTime PaidOn, string? Note);

// Response DTOs
public record DebtMetrics
{
    public Guid DebtId { get; init; }
    public string Name { get; init; } = string.Empty;
    public DebtType Type { get; init; }
    public decimal CurrentBalance { get; init; }
    public decimal OriginalBalance { get; init; }
    public decimal PercentagePaid { get; init; }
    public decimal APR { get; init; }
    public decimal MonthlyPayment { get; init; }
    public decimal MonthlyInterest { get; init; }
    public int MonthsRemaining { get; init; }
    public decimal TotalInterestRemaining { get; init; }
    public DateTime EstimatedPayoffDate { get; init; }
    public decimal TotalPaid { get; init; }
}

public record DebtPayoffProjection
{
    public List<DebtPayoffMonth> Schedule { get; init; } = [];
    public int TotalMonths { get; init; }
    public decimal TotalInterestPaid { get; init; }
    public DateTime PayoffDate { get; init; }
    public decimal TotalPaid { get; init; }
}

public record DebtPayoffMonth
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

public record DebtSummary
{
    public int TotalDebts { get; init; }
    public decimal TotalBalance { get; init; }
    public decimal TotalMonthlyPayments { get; init; }
    public decimal WeightedAverageAPR { get; init; }
    public decimal TotalInterestRemaining { get; init; }
    public List<DebtMetrics> Debts { get; init; } = [];
}

// Unified DTOs
public record UnifiedDebtDashboard
{
    public CreditCardSummary CreditCards { get; init; } = null!;
    public DebtSummary OtherDebts { get; init; } = null!;
    public OverallDebtSummary Overall { get; init; } = null!;
}

public record CreditCardSummary
{
    public int TotalCards { get; init; }
    public decimal TotalBalance { get; init; }
    public decimal TotalCreditLimit { get; init; }
    public decimal OverallUtilization { get; init; }
    public decimal TotalMinimumPayments { get; init; }
    public decimal WeightedAverageAPR { get; init; }
    public List<CreditCardMetrics> Cards { get; init; } = [];
}

public record OverallDebtSummary
{
    public int TotalAccounts { get; init; }
    public decimal TotalBalance { get; init; }
    public decimal TotalMonthlyPayments { get; init; }
    public decimal WeightedAverageAPR { get; init; }
    public decimal TotalInterestRemaining { get; init; }
    public decimal DebtToIncomeRatio { get; init; }
}

public record UnifiedPayoffComparison
{
    public PayoffStrategy RecommendedStrategy { get; init; }
    public UnifiedStrategyResult Avalanche { get; init; } = null!;
    public UnifiedStrategyResult Snowball { get; init; } = null!;
    public ComparisonSummary Summary { get; init; } = null!;
}

public record UnifiedStrategyResult
{
    public List<AccountPayoffSchedule> AccountSchedules { get; init; } = [];
    public int TotalMonths { get; init; }
    public decimal TotalInterestPaid { get; init; }
    public DateTime PayoffDate { get; init; }
}

public record AccountPayoffSchedule
{
    public Guid AccountId { get; init; }
    public string AccountName { get; init; } = string.Empty;
    public AccountType Type { get; init; }
    public List<DebtPayoffMonth> Schedule { get; init; } = [];
    public DateTime PayoffDate { get; init; }
}

public enum AccountType
{
    CreditCard,
    Debt
}
