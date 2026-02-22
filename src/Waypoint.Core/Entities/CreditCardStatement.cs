namespace Waypoint.Core.Entities;

public class CreditCardStatement
{
    public Guid Id { get; set; }
    public Guid CreditCardId { get; set; }
    public int StatementMonth { get; set; }
    public int StatementYear { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal ClosingBalance { get; set; }
    public decimal InterestCharged { get; set; }
    public decimal MinimumDue { get; set; }

    public CreditCard CreditCard { get; set; } = null!;
}
