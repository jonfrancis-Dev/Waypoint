using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using Waypoint.Core.Entities;
using Waypoint.Core.Interfaces;

namespace Waypoint.Infrastructure.Services;

public class CsvImportService : ICsvImportService
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IUploadBatchRepository _uploadBatchRepository;

    public CsvImportService(
        ITransactionRepository transactionRepository,
        IUploadBatchRepository uploadBatchRepository)
    {
        _transactionRepository = transactionRepository;
        _uploadBatchRepository = uploadBatchRepository;
    }

    public async Task<UploadBatch> ImportCsvAsync(Stream csvStream, string fileName)
    {
        using var reader = new StreamReader(csvStream);
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            TrimOptions = TrimOptions.Trim,
        });

        var records = csv.GetRecords<FirstHorizonCsvRow>().ToList();

        var batch = new UploadBatch
        {
            Id = Guid.NewGuid(),
            FileName = fileName,
            UploadedAt = DateTime.UtcNow,
        };

        var transactionsToAdd = new List<Transaction>();

        foreach (var row in records)
        {
            var date = DateTime.Parse(row.Date, CultureInfo.InvariantCulture);
            var isDebit = !string.IsNullOrWhiteSpace(row.Debit);
            var amount = isDebit
                ? Math.Abs(decimal.Parse(row.Debit, CultureInfo.InvariantCulture))
                : decimal.Parse(row.Credit, CultureInfo.InvariantCulture);

            var description = row.Description?.Trim() ?? string.Empty;
            var originalCategory = row.Category?.Trim() ?? string.Empty;

            // Deduplication: check database
            if (await _transactionRepository.ExistsAsync(date, amount, description))
                continue;

            // Deduplication: check within current batch
            if (transactionsToAdd.Any(t => t.Date == date && t.Amount == amount && t.Description == description))
                continue;

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                UploadBatchId = batch.Id,
                Date = date,
                Description = description,
                OriginalCategory = originalCategory,
                NormalizedCategory = CategoryNormalizationService.Normalize(description, originalCategory),
                Amount = amount,
                IsDebit = isDebit,
                CreatedAt = DateTime.UtcNow,
            };

            transactionsToAdd.Add(transaction);
        }

        // Determine statement month/year from the earliest transaction date
        if (transactionsToAdd.Count > 0)
        {
            var firstDate = transactionsToAdd.Min(t => t.Date);
            batch.StatementMonth = firstDate.Month;
            batch.StatementYear = firstDate.Year;
        }
        else if (records.Count > 0)
        {
            var firstDate = DateTime.Parse(records[0].Date, CultureInfo.InvariantCulture);
            batch.StatementMonth = firstDate.Month;
            batch.StatementYear = firstDate.Year;
        }

        batch.TransactionCount = transactionsToAdd.Count;

        await _uploadBatchRepository.AddAsync(batch);
        await _transactionRepository.AddRangeAsync(transactionsToAdd);
        await _transactionRepository.SaveChangesAsync();

        return batch;
    }
}

public class FirstHorizonCsvRow
{
    public string Date { get; set; } = string.Empty;
    public string Account { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    [Name("Check #")]
    public string? CheckNumber { get; set; }

    public string Category { get; set; } = string.Empty;
    public string Credit { get; set; } = string.Empty;
    public string Debit { get; set; } = string.Empty;
}
