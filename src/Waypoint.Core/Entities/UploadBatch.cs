namespace Waypoint.Core.Entities;

public class UploadBatch
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public int StatementMonth { get; set; }
    public int StatementYear { get; set; }
    public DateTime UploadedAt { get; set; }
    public int TransactionCount { get; set; }

    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
