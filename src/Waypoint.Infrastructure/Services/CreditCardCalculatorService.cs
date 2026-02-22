using Waypoint.Core.DTOs;
using Waypoint.Core.Entities;
using Waypoint.Core.Interfaces;

namespace Waypoint.Infrastructure.Services;

public class CreditCardCalculatorService : ICreditCardCalculatorService
{
    public decimal CalculateDailyInterest(decimal balance, decimal apr)
    {
        if (balance <= 0 || apr <= 0) return 0;
        var dailyRate = apr / 100m / 365m;
        return Math.Round(balance * dailyRate, 2);
    }

    public decimal CalculateMinimumPayment(decimal balance)
    {
        if (balance <= 0) return 0;
        return Math.Max(25m, Math.Round(balance * 0.02m, 2));
    }

    public int CalculateMonthsToPayoff(decimal balance, decimal apr, decimal monthlyPayment)
    {
        if (balance <= 0) return 0;
        var projection = ProjectSingleCardPayoff(balance, apr, monthlyPayment);
        return projection.TotalMonths;
    }

    public decimal CalculateTotalInterest(decimal balance, decimal apr, decimal monthlyPayment)
    {
        if (balance <= 0) return 0;
        var projection = ProjectSingleCardPayoff(balance, apr, monthlyPayment);
        return projection.TotalInterestPaid;
    }

    public PayoffProjection ProjectSingleCardPayoff(decimal balance, decimal apr, decimal monthlyPayment, int maxMonths = 360)
    {
        var schedule = new List<PayoffMonth>();
        var currentBalance = balance;
        decimal cumulativeInterest = 0;
        var monthNumber = 0;
        var currentDate = DateTime.Today;

        // If payment can't cover interest, it'll never pay off
        var firstMonthInterest = CalculateMonthlyInterest(currentBalance, apr);
        if (monthlyPayment <= firstMonthInterest && apr > 0)
        {
            return new PayoffProjection
            {
                Schedule = [],
                TotalMonths = maxMonths,
                TotalInterestPaid = 0,
                PayoffDate = currentDate.AddMonths(maxMonths),
                TotalPaid = 0
            };
        }

        while (currentBalance > 0 && monthNumber < maxMonths)
        {
            monthNumber++;
            currentDate = currentDate.AddMonths(1);

            var openingBalance = currentBalance;
            var monthlyInterest = CalculateMonthlyInterest(currentBalance, apr);
            var payment = Math.Min(monthlyPayment, currentBalance + monthlyInterest);
            var principalApplied = payment - monthlyInterest;
            var closingBalance = Math.Max(0, currentBalance + monthlyInterest - payment);

            cumulativeInterest += monthlyInterest;

            schedule.Add(new PayoffMonth
            {
                MonthNumber = monthNumber,
                Month = currentDate.Month,
                Year = currentDate.Year,
                OpeningBalance = Math.Round(openingBalance, 2),
                InterestCharged = Math.Round(monthlyInterest, 2),
                PaymentMade = Math.Round(payment, 2),
                PrincipalApplied = Math.Round(principalApplied, 2),
                ClosingBalance = Math.Round(closingBalance, 2),
                CumulativeInterestPaid = Math.Round(cumulativeInterest, 2)
            });

            currentBalance = closingBalance;
        }

        return new PayoffProjection
        {
            Schedule = schedule,
            TotalMonths = monthNumber,
            TotalInterestPaid = Math.Round(cumulativeInterest, 2),
            PayoffDate = currentDate,
            TotalPaid = Math.Round(balance + cumulativeInterest, 2)
        };
    }

    public MultiCardPayoffComparison ProjectMultiCardPayoff(List<CreditCard> cards, decimal extraMonthlyPayment)
    {
        var avalancheResult = ProjectWithStrategy(cards, extraMonthlyPayment, PayoffStrategy.Avalanche);
        var snowballResult = ProjectWithStrategy(cards, extraMonthlyPayment, PayoffStrategy.Snowball);

        var interestSaved = snowballResult.TotalInterestPaid - avalancheResult.TotalInterestPaid;
        var monthsSaved = snowballResult.TotalMonths - avalancheResult.TotalMonths;

        return new MultiCardPayoffComparison
        {
            RecommendedStrategy = interestSaved >= 0 ? PayoffStrategy.Avalanche : PayoffStrategy.Snowball,
            Avalanche = avalancheResult,
            Snowball = snowballResult,
            Summary = new ComparisonSummary
            {
                InterestSaved = Math.Round(Math.Abs(interestSaved), 2),
                MonthsSaved = Math.Abs(monthsSaved),
                Recommendation = BuildRecommendation(interestSaved, monthsSaved)
            }
        };
    }

    private StrategyResult ProjectWithStrategy(List<CreditCard> cards, decimal extraMonthlyPayment, PayoffStrategy strategy)
    {
        var sortedCards = strategy == PayoffStrategy.Avalanche
            ? cards.OrderByDescending(c => c.APR).ToList()
            : cards.OrderBy(c => c.CurrentBalance).ToList();

        // Track state per card
        var cardStates = sortedCards.Select(c => new CardState
        {
            Card = c,
            Balance = c.CurrentBalance,
            MinPayment = CalculateMinimumPayment(c.CurrentBalance),
            Schedule = new List<PayoffMonth>()
        }).ToList();

        var currentDate = DateTime.Today;
        var maxMonths = 360;

        for (int month = 1; month <= maxMonths; month++)
        {
            var activeCards = cardStates.Where(cs => cs.Balance > 0).ToList();
            if (activeCards.Count == 0) break;

            currentDate = DateTime.Today.AddMonths(month);
            var extraRemaining = extraMonthlyPayment;

            // First pass: pay minimums and accrue interest on all active cards
            foreach (var cs in activeCards)
            {
                var interest = CalculateMonthlyInterest(cs.Balance, cs.Card.APR);
                var minPayment = Math.Min(cs.MinPayment, cs.Balance + interest);
                var payment = minPayment;
                var principal = payment - interest;
                var closing = Math.Max(0, cs.Balance + interest - payment);

                cs.MonthInterest = interest;
                cs.MonthPayment = payment;
                cs.Balance = closing;
                cs.CumulativeInterest += interest;
            }

            // Second pass: apply extra payment to priority card
            var targetCard = activeCards.FirstOrDefault(cs => cs.Balance > 0);
            if (targetCard is not null && extraRemaining > 0)
            {
                var extraPayment = Math.Min(extraRemaining, targetCard.Balance);
                targetCard.MonthPayment += extraPayment;
                targetCard.Balance = Math.Max(0, targetCard.Balance - extraPayment);
                extraRemaining -= extraPayment;

                // If target card paid off, cascade remaining extra to next card
                while (extraRemaining > 0)
                {
                    var nextCard = activeCards.FirstOrDefault(cs => cs.Balance > 0 && cs != targetCard);
                    if (nextCard is null) break;
                    var cascadePayment = Math.Min(extraRemaining, nextCard.Balance);
                    nextCard.MonthPayment += cascadePayment;
                    nextCard.Balance = Math.Max(0, nextCard.Balance - cascadePayment);
                    extraRemaining -= cascadePayment;
                    targetCard = nextCard;
                }
            }

            // Record schedule for each active card
            foreach (var cs in activeCards)
            {
                cs.Schedule.Add(new PayoffMonth
                {
                    MonthNumber = month,
                    Month = currentDate.Month,
                    Year = currentDate.Year,
                    OpeningBalance = Math.Round(cs.Schedule.Count > 0 ? cs.Schedule[^1].ClosingBalance : cs.Card.CurrentBalance, 2),
                    InterestCharged = Math.Round(cs.MonthInterest, 2),
                    PaymentMade = Math.Round(cs.MonthPayment, 2),
                    PrincipalApplied = Math.Round(cs.MonthPayment - cs.MonthInterest, 2),
                    ClosingBalance = Math.Round(cs.Balance, 2),
                    CumulativeInterestPaid = Math.Round(cs.CumulativeInterest, 2)
                });
            }
        }

        var cardSchedules = cardStates.Select(cs => new CardPayoffSchedule
        {
            CardId = cs.Card.Id,
            CardName = cs.Card.Name,
            Schedule = cs.Schedule,
            PayoffDate = cs.Schedule.Count > 0
                ? new DateTime(cs.Schedule[^1].Year, cs.Schedule[^1].Month, 1)
                : DateTime.Today
        }).ToList();

        var totalMonths = cardSchedules.Max(s => s.Schedule.Count);

        return new StrategyResult
        {
            CardSchedules = cardSchedules,
            TotalMonths = totalMonths,
            TotalInterestPaid = Math.Round(cardStates.Sum(cs => cs.CumulativeInterest), 2),
            PayoffDate = DateTime.Today.AddMonths(totalMonths)
        };
    }

    private static decimal CalculateMonthlyInterest(decimal balance, decimal apr)
    {
        if (balance <= 0 || apr <= 0) return 0;
        var dailyRate = apr / 100m / 365m;
        return balance * (decimal)Math.Pow((double)(1 + dailyRate), 30) - balance;
    }

    private static string BuildRecommendation(decimal interestSaved, int monthsSaved)
    {
        if (Math.Abs(interestSaved) < 1 && Math.Abs(monthsSaved) < 1)
            return "Both strategies perform nearly identically for your cards.";

        var better = interestSaved >= 0 ? "Avalanche" : "Snowball";
        var action = better == "Avalanche"
            ? "attacking the highest APR card first"
            : "paying off the smallest balance first for quick wins";

        return $"You'll save ${Math.Abs(interestSaved):N2} and pay off debt {Math.Abs(monthsSaved)} month(s) faster with the {better} method by {action}.";
    }

    private class CardState
    {
        public CreditCard Card { get; init; } = null!;
        public decimal Balance { get; set; }
        public decimal MinPayment { get; init; }
        public List<PayoffMonth> Schedule { get; init; } = [];
        public decimal MonthInterest { get; set; }
        public decimal MonthPayment { get; set; }
        public decimal CumulativeInterest { get; set; }
    }
}
