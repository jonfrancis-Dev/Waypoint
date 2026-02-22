using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface IUploadBatchRepository
{
    Task<UploadBatch> AddAsync(UploadBatch batch);
    Task SaveChangesAsync();
}
