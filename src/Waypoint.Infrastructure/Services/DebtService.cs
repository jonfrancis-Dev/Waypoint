using Waypoint.Core.DTOs;
using Waypoint.Core.Entities;
using Waypoint.Core.Interfaces;

namespace Waypoint.Infrastructure.Services;

public class DebtService : IDebtService
{
    private readonly IDebtRepository _repo;
    private readonly IDebtCalculatorService _calculator;

    public DebtService(IDebtRepository repo, IDebtCalculatorService calculator)
    {
        _repo = repo;
        _calculator = calculator;
    }

    public async Task<Debt> CreateDebtAsync(CreateDebtDto dto)
    {
        var debt = new Debt
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            DebtType = dto.DebtType,
            OriginalBalance = dto.OriginalBalance,
            CurrentBalance = dto.CurrentBalance,
            APR = dto.APR,
            MinimumPayment = dto.MinimumPayment,
            StartDate = dto.StartDate,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(debt);
        await _repo.SaveChangesAsync();
        return debt;
    }

    public async Task<Debt> UpdateDebtAsync(Guid id, UpdateDebtDto dto)
    {
        var debt = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Debt {id} not found");

        debt.Name = dto.Name;
        debt.DebtType = dto.DebtType;
        debt.OriginalBalance = dto.OriginalBalance;
        debt.CurrentBalance = dto.CurrentBalance;
        debt.APR = dto.APR;
        debt.MinimumPayment = dto.MinimumPayment;
        debt.StartDate = dto.StartDate;

        await _repo.SaveChangesAsync();
        return debt;
    }

    public async Task<Debt?> GetDebtAsync(Guid id)
    {
        return await _repo.GetByIdAsync(id);
    }

    public async Task<List<Debt>> GetAllDebtsAsync()
    {
        return await _repo.GetAllAsync();
    }

    public async Task<bool> DeleteDebtAsync(Guid id)
    {
        var debt = await _repo.GetByIdAsync(id);
        if (debt is null) return false;

        _repo.Delete(debt);
        await _repo.SaveChangesAsync();
        return true;
    }

    public async Task<DebtPayment> LogPaymentAsync(Guid debtId, LogDebtPaymentDto dto)
    {
        var debt = await _repo.GetByIdAsync(debtId)
            ?? throw new KeyNotFoundException($"Debt {debtId} not found");

        var payment = new DebtPayment
        {
            Id = Guid.NewGuid(),
            DebtId = debtId,
            Amount = dto.Amount,
            PaidOn = dto.PaidOn,
            Note = dto.Note
        };

        // Update balance: subtract principal portion (payment minus interest)
        var monthlyInterest = _calculator.CalculateMonthlyInterest(debt.CurrentBalance, debt.APR);
        var principalApplied = Math.Max(0, dto.Amount - monthlyInterest);
        debt.CurrentBalance = Math.Max(0, debt.CurrentBalance - principalApplied);

        await _repo.AddPaymentAsync(payment);
        await _repo.SaveChangesAsync();
        return payment;
    }

    public async Task<List<DebtPayment>> GetPaymentHistoryAsync(Guid debtId)
    {
        return await _repo.GetPaymentsAsync(debtId);
    }

    public async Task<DebtMetrics> GetDebtMetricsAsync(Guid id)
    {
        var debt = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Debt {id} not found");

        return await BuildMetrics(debt);
    }

    public async Task<List<DebtMetrics>> GetAllDebtMetricsAsync()
    {
        var debts = await _repo.GetAllAsync();
        var metricsList = new List<DebtMetrics>();
        foreach (var debt in debts)
        {
            metricsList.Add(await BuildMetrics(debt));
        }
        return metricsList;
    }

    public async Task<DebtSummary> GetDebtSummaryAsync()
    {
        var debts = await _repo.GetAllAsync();
        var metricsList = new List<DebtMetrics>();
        foreach (var debt in debts)
        {
            metricsList.Add(await BuildMetrics(debt));
        }

        var totalBalance = metricsList.Sum(m => m.CurrentBalance);
        var weightedApr = totalBalance > 0
            ? metricsList.Sum(m => m.CurrentBalance * m.APR) / totalBalance
            : 0;

        return new DebtSummary
        {
            TotalDebts = metricsList.Count,
            TotalBalance = Math.Round(totalBalance, 2),
            TotalMonthlyPayments = Math.Round(metricsList.Sum(m => m.MonthlyPayment), 2),
            WeightedAverageAPR = Math.Round(weightedApr, 2),
            TotalInterestRemaining = Math.Round(metricsList.Sum(m => m.TotalInterestRemaining), 2),
            Debts = metricsList
        };
    }

    private async Task<DebtMetrics> BuildMetrics(Debt debt)
    {
        var payments = await _repo.GetPaymentsAsync(debt.Id);
        var totalPaid = payments.Sum(p => p.Amount);

        var monthlyInterest = _calculator.CalculateMonthlyInterest(debt.CurrentBalance, debt.APR);
        var monthsRemaining = (int)_calculator.CalculateRemainingMonths(debt.CurrentBalance, debt.APR, debt.MinimumPayment);
        var totalInterestRemaining = _calculator.CalculateTotalInterest(debt.CurrentBalance, debt.APR, debt.MinimumPayment);

        var percentagePaid = debt.OriginalBalance > 0
            ? Math.Round((debt.OriginalBalance - debt.CurrentBalance) / debt.OriginalBalance * 100, 1)
            : 0;

        return new DebtMetrics
        {
            DebtId = debt.Id,
            Name = debt.Name,
            Type = debt.DebtType,
            CurrentBalance = debt.CurrentBalance,
            OriginalBalance = debt.OriginalBalance,
            PercentagePaid = percentagePaid,
            APR = debt.APR,
            MonthlyPayment = debt.MinimumPayment,
            MonthlyInterest = Math.Round(monthlyInterest, 2),
            MonthsRemaining = monthsRemaining,
            TotalInterestRemaining = Math.Round(totalInterestRemaining, 2),
            EstimatedPayoffDate = DateTime.Today.AddMonths(monthsRemaining),
            TotalPaid = Math.Round(totalPaid, 2)
        };
    }
}
