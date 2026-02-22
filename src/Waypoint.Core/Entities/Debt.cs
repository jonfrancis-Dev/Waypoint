using Waypoint.Core.Enums;

namespace Waypoint.Core.Entities;

public class Debt
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal CurrentBalance { get; set; }
    public decimal OriginalBalance { get; set; }
    public decimal APR { get; set; }
    public decimal MinimumPayment { get; set; }
    public DebtType DebtType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<DebtPayment> Payments { get; set; } = new List<DebtPayment>();
}
