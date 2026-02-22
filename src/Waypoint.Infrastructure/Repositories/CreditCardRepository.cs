using Microsoft.EntityFrameworkCore;
using Waypoint.Core.Entities;
using Waypoint.Core.Interfaces;
using Waypoint.Infrastructure.Data;

namespace Waypoint.Infrastructure.Repositories;

public class CreditCardRepository : ICreditCardRepository
{
    private readonly WaypointDbContext _context;

    public CreditCardRepository(WaypointDbContext context)
    {
        _context = context;
    }

    public async Task<List<CreditCard>> GetAllAsync()
    {
        return await _context.CreditCards.ToListAsync();
    }

    public async Task<CreditCard?> GetByIdAsync(Guid id)
    {
        return await _context.CreditCards.FindAsync(id);
    }

    public async Task<CreditCard?> GetByIdWithRelatedAsync(Guid id)
    {
        return await _context.CreditCards
            .Include(c => c.Payments)
            .Include(c => c.Statements)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task AddAsync(CreditCard creditCard)
    {
        await _context.CreditCards.AddAsync(creditCard);
    }

    public void Delete(CreditCard creditCard)
    {
        _context.CreditCards.Remove(creditCard);
    }

    public async Task AddPaymentAsync(CreditCardPayment payment)
    {
        await _context.CreditCardPayments.AddAsync(payment);
    }

    public async Task<List<CreditCardPayment>> GetPaymentsAsync(Guid cardId)
    {
        return await _context.CreditCardPayments
            .Where(p => p.CreditCardId == cardId)
            .OrderByDescending(p => p.PaidOn)
            .ToListAsync();
    }

    public async Task AddStatementAsync(CreditCardStatement statement)
    {
        await _context.CreditCardStatements.AddAsync(statement);
    }

    public async Task<List<CreditCardStatement>> GetStatementsAsync(Guid cardId)
    {
        return await _context.CreditCardStatements
            .Where(s => s.CreditCardId == cardId)
            .OrderByDescending(s => s.StatementYear)
            .ThenByDescending(s => s.StatementMonth)
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
