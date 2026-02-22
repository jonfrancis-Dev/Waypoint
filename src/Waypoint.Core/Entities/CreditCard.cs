namespace Waypoint.Core.Entities;

public class CreditCard
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal CurrentBalance { get; set; }
    public decimal CreditLimit { get; set; }
    public decimal APR { get; set; }
    public decimal MinimumPayment { get; set; }
    public int StatementClosingDay { get; set; }
    public int DueDay { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<CreditCardPayment> Payments { get; set; } = new List<CreditCardPayment>();
    public ICollection<CreditCardStatement> Statements { get; set; } = new List<CreditCardStatement>();
}
