namespace Waypoint.Core.Entities;

public class DebtPayment
{
    public Guid Id { get; set; }
    public Guid DebtId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaidOn { get; set; }
    public string? Note { get; set; }

    public Debt Debt { get; set; } = null!;
}
