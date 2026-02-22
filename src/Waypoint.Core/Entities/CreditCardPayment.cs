namespace Waypoint.Core.Entities;

public class CreditCardPayment
{
    public Guid Id { get; set; }
    public Guid CreditCardId { get; set; }
    public decimal Amount { get; set; }
    public decimal PrincipalApplied { get; set; }
    public decimal InterestApplied { get; set; }
    public DateTime PaidOn { get; set; }
    public string? Note { get; set; }

    public CreditCard CreditCard { get; set; } = null!;
}
