using Microsoft.EntityFrameworkCore;
using Waypoint.Core.Entities;

namespace Waypoint.Infrastructure.Data;

public class WaypointDbContext : DbContext
{
    public WaypointDbContext(DbContextOptions<WaypointDbContext> options) : base(options) { }

    public DbSet<UploadBatch> UploadBatches => Set<UploadBatch>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<BudgetPlan> BudgetPlans => Set<BudgetPlan>();
    public DbSet<BudgetLineItem> BudgetLineItems => Set<BudgetLineItem>();
    public DbSet<CreditCard> CreditCards => Set<CreditCard>();
    public DbSet<CreditCardPayment> CreditCardPayments => Set<CreditCardPayment>();
    public DbSet<CreditCardStatement> CreditCardStatements => Set<CreditCardStatement>();
    public DbSet<Debt> Debts => Set<Debt>();
    public DbSet<DebtPayment> DebtPayments => Set<DebtPayment>();
    public DbSet<SavingsGoal> SavingsGoals => Set<SavingsGoal>();
    public DbSet<SavingsContribution> SavingsContributions => Set<SavingsContribution>();
    public DbSet<MonthlyReport> MonthlyReports => Set<MonthlyReport>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(WaypointDbContext).Assembly);
    }
}
