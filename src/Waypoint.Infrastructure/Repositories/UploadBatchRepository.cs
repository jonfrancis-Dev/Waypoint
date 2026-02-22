using Waypoint.Core.Entities;
using Waypoint.Core.Interfaces;
using Waypoint.Infrastructure.Data;

namespace Waypoint.Infrastructure.Repositories;

public class UploadBatchRepository : IUploadBatchRepository
{
    private readonly WaypointDbContext _context;

    public UploadBatchRepository(WaypointDbContext context)
    {
        _context = context;
    }

    public async Task<UploadBatch> AddAsync(UploadBatch batch)
    {
        await _context.UploadBatches.AddAsync(batch);
        return batch;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
