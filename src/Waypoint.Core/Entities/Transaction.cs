namespace Waypoint.Core.Entities;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid UploadBatchId { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string OriginalCategory { get; set; } = string.Empty;
    public string NormalizedCategory { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsDebit { get; set; }
    public DateTime CreatedAt { get; set; }

    public UploadBatch UploadBatch { get; set; } = null!;
}
