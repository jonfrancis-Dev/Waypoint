using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface ICsvImportService
{
    Task<UploadBatch> ImportCsvAsync(Stream csvStream, string fileName);
}
