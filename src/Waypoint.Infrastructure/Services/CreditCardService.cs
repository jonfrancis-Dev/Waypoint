using Waypoint.Core.DTOs;
using Waypoint.Core.Entities;
using Waypoint.Core.Interfaces;

namespace Waypoint.Infrastructure.Services;

public class CreditCardService : ICreditCardService
{
    private readonly ICreditCardRepository _repo;
    private readonly ICreditCardCalculatorService _calculator;

    public CreditCardService(ICreditCardRepository repo, ICreditCardCalculatorService calculator)
    {
        _repo = repo;
        _calculator = calculator;
    }

    public async Task<CreditCard> CreateCardAsync(CreateCreditCardDto dto)
    {
        var card = new CreditCard
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            CreditLimit = dto.CreditLimit,
            CurrentBalance = dto.CurrentBalance,
            APR = dto.APR,
            MinimumPayment = _calculator.CalculateMinimumPayment(dto.CurrentBalance),
            StatementClosingDay = dto.StatementClosingDay,
            DueDay = dto.DueDay,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(card);
        await _repo.SaveChangesAsync();
        return card;
    }

    public async Task<CreditCard> UpdateCardAsync(Guid id, UpdateCreditCardDto dto)
    {
        var card = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Credit card {id} not found");

        card.Name = dto.Name;
        card.CreditLimit = dto.CreditLimit;
        card.CurrentBalance = dto.CurrentBalance;
        card.APR = dto.APR;
        card.MinimumPayment = _calculator.CalculateMinimumPayment(dto.CurrentBalance);
        card.StatementClosingDay = dto.StatementClosingDay;
        card.DueDay = dto.DueDay;

        await _repo.SaveChangesAsync();
        return card;
    }

    public async Task<CreditCard?> GetCardAsync(Guid id)
    {
        return await _repo.GetByIdAsync(id);
    }

    public async Task<List<CreditCard>> GetAllCardsAsync()
    {
        return await _repo.GetAllAsync();
    }

    public async Task<bool> DeleteCardAsync(Guid id)
    {
        var card = await _repo.GetByIdAsync(id);
        if (card is null) return false;

        _repo.Delete(card);
        await _repo.SaveChangesAsync();
        return true;
    }

    public async Task<CreditCardPayment> LogPaymentAsync(Guid cardId, LogPaymentDto dto)
    {
        var card = await _repo.GetByIdAsync(cardId)
            ?? throw new KeyNotFoundException($"Credit card {cardId} not found");

        var monthlyInterest = card.APR > 0
            ? card.CurrentBalance * (decimal)Math.Pow((double)(1 + card.APR / 100m / 365m), 30) - card.CurrentBalance
            : 0m;
        var interestPortion = Math.Min(dto.Amount, monthlyInterest);
        var principalPortion = dto.Amount - interestPortion;

        var payment = new CreditCardPayment
        {
            Id = Guid.NewGuid(),
            CreditCardId = cardId,
            Amount = dto.Amount,
            PrincipalApplied = Math.Round(principalPortion, 2),
            InterestApplied = Math.Round(interestPortion, 2),
            PaidOn = dto.PaidOn,
            Note = dto.Note
        };

        card.CurrentBalance = Math.Max(0, card.CurrentBalance - principalPortion);
        card.MinimumPayment = _calculator.CalculateMinimumPayment(card.CurrentBalance);

        await _repo.AddPaymentAsync(payment);
        await _repo.SaveChangesAsync();
        return payment;
    }

    public async Task<List<CreditCardPayment>> GetPaymentHistoryAsync(Guid cardId)
    {
        return await _repo.GetPaymentsAsync(cardId);
    }

    public async Task<CreditCardStatement> CreateStatementAsync(Guid cardId, CreateStatementDto dto)
    {
        _ = await _repo.GetByIdAsync(cardId)
            ?? throw new KeyNotFoundException($"Credit card {cardId} not found");

        var statement = new CreditCardStatement
        {
            Id = Guid.NewGuid(),
            CreditCardId = cardId,
            StatementMonth = dto.StatementMonth,
            StatementYear = dto.StatementYear,
            OpeningBalance = dto.OpeningBalance,
            ClosingBalance = dto.ClosingBalance,
            InterestCharged = dto.InterestCharged,
            MinimumDue = dto.MinimumDue
        };

        await _repo.AddStatementAsync(statement);
        await _repo.SaveChangesAsync();
        return statement;
    }

    public async Task<List<CreditCardStatement>> GetStatementsAsync(Guid cardId)
    {
        return await _repo.GetStatementsAsync(cardId);
    }

    public async Task<CreditCardMetrics> GetCardMetricsAsync(Guid cardId)
    {
        var card = await _repo.GetByIdAsync(cardId)
            ?? throw new KeyNotFoundException($"Credit card {cardId} not found");

        return BuildMetrics(card);
    }

    public async Task<List<CreditCardMetrics>> GetAllCardMetricsAsync()
    {
        var cards = await _repo.GetAllAsync();
        return cards.Select(BuildMetrics).ToList();
    }

    private CreditCardMetrics BuildMetrics(CreditCard card)
    {
        var utilization = card.CreditLimit > 0
            ? Math.Round(card.CurrentBalance / card.CreditLimit * 100, 1)
            : 0;

        var minPayment = _calculator.CalculateMinimumPayment(card.CurrentBalance);
        var monthsToPayoff = _calculator.CalculateMonthsToPayoff(card.CurrentBalance, card.APR, minPayment);
        var totalInterest = _calculator.CalculateTotalInterest(card.CurrentBalance, card.APR, minPayment);

        var healthStatus = utilization switch
        {
            <= 30 => "Good",
            <= 70 => "Warning",
            _ => "Critical"
        };

        return new CreditCardMetrics
        {
            CardId = card.Id,
            Name = card.Name,
            CurrentBalance = card.CurrentBalance,
            CreditLimit = card.CreditLimit,
            UtilizationPercentage = utilization,
            APR = card.APR,
            MinimumPayment = minPayment,
            DailyInterest = _calculator.CalculateDailyInterest(card.CurrentBalance, card.APR),
            MonthsToPayoffAtMinimum = monthsToPayoff,
            TotalInterestAtMinimum = totalInterest,
            HealthStatus = healthStatus
        };
    }
}
