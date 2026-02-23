using Waypoint.Core.DTOs;
using Waypoint.Core.Interfaces;

namespace Waypoint.Infrastructure.Services;

public class UnifiedDebtService : IUnifiedDebtService
{
    private readonly ICreditCardService _cardService;
    private readonly IDebtService _debtService;
    private readonly ICreditCardCalculatorService _cardCalc;
    private readonly IDebtCalculatorService _debtCalc;

    public UnifiedDebtService(
        ICreditCardService cardService,
        IDebtService debtService,
        ICreditCardCalculatorService cardCalc,
        IDebtCalculatorService debtCalc)
    {
        _cardService = cardService;
        _debtService = debtService;
        _cardCalc = cardCalc;
        _debtCalc = debtCalc;
    }

    public async Task<UnifiedDebtDashboard> GetUnifiedDashboardAsync()
    {
        var cardMetrics = await _cardService.GetAllCardMetricsAsync();
        var debtSummary = await _debtService.GetDebtSummaryAsync();

        var totalCardBalance = cardMetrics.Sum(c => c.CurrentBalance);
        var totalCardLimit = cardMetrics.Sum(c => c.CreditLimit);
        var cardWeightedApr = totalCardBalance > 0
            ? cardMetrics.Sum(c => c.CurrentBalance * c.APR) / totalCardBalance
            : 0;

        var creditCardSummary = new CreditCardSummary
        {
            TotalCards = cardMetrics.Count,
            TotalBalance = Math.Round(totalCardBalance, 2),
            TotalCreditLimit = Math.Round(totalCardLimit, 2),
            OverallUtilization = totalCardLimit > 0
                ? Math.Round(totalCardBalance / totalCardLimit * 100, 1)
                : 0,
            TotalMinimumPayments = Math.Round(cardMetrics.Sum(c => c.MinimumPayment), 2),
            WeightedAverageAPR = Math.Round(cardWeightedApr, 2),
            Cards = cardMetrics
        };

        var overallBalance = totalCardBalance + debtSummary.TotalBalance;
        var overallMonthly = creditCardSummary.TotalMinimumPayments + debtSummary.TotalMonthlyPayments;
        var overallWeightedApr = overallBalance > 0
            ? (totalCardBalance * cardWeightedApr + debtSummary.TotalBalance * debtSummary.WeightedAverageAPR) / overallBalance
            : 0;

        var cardTotalInterest = cardMetrics.Sum(c => c.TotalInterestAtMinimum);

        var overall = new OverallDebtSummary
        {
            TotalAccounts = cardMetrics.Count + debtSummary.TotalDebts,
            TotalBalance = Math.Round(overallBalance, 2),
            TotalMonthlyPayments = Math.Round(overallMonthly, 2),
            WeightedAverageAPR = Math.Round(overallWeightedApr, 2),
            TotalInterestRemaining = Math.Round(cardTotalInterest + debtSummary.TotalInterestRemaining, 2),
            DebtToIncomeRatio = 0 // Would need income data
        };

        return new UnifiedDebtDashboard
        {
            CreditCards = creditCardSummary,
            OtherDebts = debtSummary,
            Overall = overall
        };
    }

    public async Task<UnifiedPayoffComparison> GetUnifiedPayoffComparisonAsync(decimal extraMonthlyPayment)
    {
        var cards = await _cardService.GetAllCardsAsync();
        var debts = await _debtService.GetAllDebtsAsync();

        // Build unified account list
        var accounts = new List<UnifiedAccount>();

        foreach (var card in cards)
        {
            accounts.Add(new UnifiedAccount
            {
                Id = card.Id,
                Name = card.Name,
                Type = AccountType.CreditCard,
                Balance = card.CurrentBalance,
                APR = card.APR,
                MinimumPayment = card.MinimumPayment
            });
        }

        foreach (var debt in debts)
        {
            accounts.Add(new UnifiedAccount
            {
                Id = debt.Id,
                Name = debt.Name,
                Type = AccountType.Debt,
                Balance = debt.CurrentBalance,
                APR = debt.APR,
                MinimumPayment = debt.MinimumPayment
            });
        }

        var avalanche = ProjectWithStrategy(accounts, extraMonthlyPayment, PayoffStrategy.Avalanche);
        var snowball = ProjectWithStrategy(accounts, extraMonthlyPayment, PayoffStrategy.Snowball);

        var interestSaved = snowball.TotalInterestPaid - avalanche.TotalInterestPaid;
        var monthsSaved = snowball.TotalMonths - avalanche.TotalMonths;

        return new UnifiedPayoffComparison
        {
            RecommendedStrategy = interestSaved >= 0 ? PayoffStrategy.Avalanche : PayoffStrategy.Snowball,
            Avalanche = avalanche,
            Snowball = snowball,
            Summary = new ComparisonSummary
            {
                InterestSaved = Math.Round(Math.Abs(interestSaved), 2),
                MonthsSaved = Math.Abs(monthsSaved),
                Recommendation = BuildRecommendation(interestSaved, monthsSaved)
            }
        };
    }

    private UnifiedStrategyResult ProjectWithStrategy(List<UnifiedAccount> accounts, decimal extraMonthlyPayment, PayoffStrategy strategy)
    {
        if (accounts.Count == 0)
        {
            return new UnifiedStrategyResult
            {
                AccountSchedules = [],
                TotalMonths = 0,
                TotalInterestPaid = 0,
                PayoffDate = DateTime.Today
            };
        }

        var sortedAccounts = strategy == PayoffStrategy.Avalanche
            ? accounts.OrderByDescending(a => a.APR).ToList()
            : accounts.OrderBy(a => a.Balance).ToList();

        var states = sortedAccounts.Select(a => new AccountState
        {
            Account = a,
            Balance = a.Balance,
            Schedule = new List<DebtPayoffMonth>(),
            CumulativeInterest = 0
        }).ToList();

        var maxMonths = 360;

        for (int month = 1; month <= maxMonths; month++)
        {
            var active = states.Where(s => s.Balance > 0.01m).ToList();
            if (active.Count == 0) break;

            var currentDate = DateTime.Today.AddMonths(month);
            var extraRemaining = extraMonthlyPayment;

            // First pass: pay minimums and accrue interest
            foreach (var s in active)
            {
                var interest = CalculateInterest(s.Account, s.Balance);
                var minPayment = Math.Min(s.Account.MinimumPayment, s.Balance + interest);
                s.MonthInterest = interest;
                s.MonthPayment = minPayment;
                s.Balance = Math.Max(0, s.Balance + interest - minPayment);
                s.CumulativeInterest += interest;
            }

            // Second pass: apply extra to priority account
            var target = active.FirstOrDefault(s => s.Balance > 0);
            if (target is not null && extraRemaining > 0)
            {
                var extra = Math.Min(extraRemaining, target.Balance);
                target.MonthPayment += extra;
                target.Balance = Math.Max(0, target.Balance - extra);
                extraRemaining -= extra;

                while (extraRemaining > 0)
                {
                    var next = active.FirstOrDefault(s => s.Balance > 0 && s != target);
                    if (next is null) break;
                    var cascade = Math.Min(extraRemaining, next.Balance);
                    next.MonthPayment += cascade;
                    next.Balance = Math.Max(0, next.Balance - cascade);
                    extraRemaining -= cascade;
                    target = next;
                }
            }

            // Record schedule
            foreach (var s in active)
            {
                s.Schedule.Add(new DebtPayoffMonth
                {
                    MonthNumber = month,
                    Month = currentDate.Month,
                    Year = currentDate.Year,
                    OpeningBalance = Math.Round(s.Schedule.Count > 0 ? s.Schedule[^1].ClosingBalance : s.Account.Balance, 2),
                    InterestCharged = Math.Round(s.MonthInterest, 2),
                    PaymentMade = Math.Round(s.MonthPayment, 2),
                    PrincipalApplied = Math.Round(s.MonthPayment - s.MonthInterest, 2),
                    ClosingBalance = Math.Round(s.Balance, 2),
                    CumulativeInterestPaid = Math.Round(s.CumulativeInterest, 2)
                });
            }
        }

        var schedules = states.Select(s => new AccountPayoffSchedule
        {
            AccountId = s.Account.Id,
            AccountName = s.Account.Name,
            Type = s.Account.Type,
            Schedule = s.Schedule,
            PayoffDate = s.Schedule.Count > 0
                ? new DateTime(s.Schedule[^1].Year, s.Schedule[^1].Month, 1)
                : DateTime.Today
        }).ToList();

        var totalMonths = schedules.Count > 0 ? schedules.Max(s => s.Schedule.Count) : 0;

        return new UnifiedStrategyResult
        {
            AccountSchedules = schedules,
            TotalMonths = totalMonths,
            TotalInterestPaid = Math.Round(states.Sum(s => s.CumulativeInterest), 2),
            PayoffDate = DateTime.Today.AddMonths(totalMonths)
        };
    }

    private static decimal CalculateInterest(UnifiedAccount account, decimal balance)
    {
        if (balance <= 0 || account.APR <= 0) return 0;

        if (account.Type == AccountType.CreditCard)
        {
            // Daily compounding for credit cards
            var dailyRate = account.APR / 100m / 365m;
            return balance * (decimal)Math.Pow((double)(1 + dailyRate), 30) - balance;
        }
        else
        {
            // Simple monthly interest for installment loans
            return balance * (account.APR / 100m / 12m);
        }
    }

    private static string BuildRecommendation(decimal interestSaved, int monthsSaved)
    {
        if (Math.Abs(interestSaved) < 1 && Math.Abs(monthsSaved) < 1)
            return "Both strategies perform nearly identically for your debts.";

        var better = interestSaved >= 0 ? "Avalanche" : "Snowball";
        var action = better == "Avalanche"
            ? "attacking the highest APR accounts first"
            : "paying off the smallest balances first for quick wins";

        return $"You'll save ${Math.Abs(interestSaved):N2} and pay off debt {Math.Abs(monthsSaved)} month(s) faster with the {better} method by {action}.";
    }

    private class UnifiedAccount
    {
        public Guid Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public AccountType Type { get; init; }
        public decimal Balance { get; init; }
        public decimal APR { get; init; }
        public decimal MinimumPayment { get; init; }
    }

    private class AccountState
    {
        public UnifiedAccount Account { get; init; } = null!;
        public decimal Balance { get; set; }
        public List<DebtPayoffMonth> Schedule { get; init; } = [];
        public decimal MonthInterest { get; set; }
        public decimal MonthPayment { get; set; }
        public decimal CumulativeInterest { get; set; }
    }
}
