using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Waypoint.Core.Entities;

namespace Waypoint.Infrastructure.Data.Configurations;

public class UploadBatchConfiguration : IEntityTypeConfiguration<UploadBatch>
{
    public void Configure(EntityTypeBuilder<UploadBatch> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.FileName).IsRequired().HasMaxLength(500);
        builder.Property(x => x.StatementMonth).IsRequired();
        builder.Property(x => x.StatementYear).IsRequired();
        builder.Property(x => x.UploadedAt).IsRequired();
        builder.Property(x => x.TransactionCount).IsRequired();

        builder.HasMany(x => x.Transactions)
               .WithOne(t => t.UploadBatch)
               .HasForeignKey(t => t.UploadBatchId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
