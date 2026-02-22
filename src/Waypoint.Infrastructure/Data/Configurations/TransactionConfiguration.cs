using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Waypoint.Core.Entities;

namespace Waypoint.Infrastructure.Data.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(500);
        builder.Property(x => x.OriginalCategory).HasMaxLength(200);
        builder.Property(x => x.NormalizedCategory).HasMaxLength(200);
        builder.Property(x => x.Amount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Date).IsRequired();
        builder.Property(x => x.IsDebit).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => new { x.Date, x.Amount, x.Description })
               .IsUnique()
               .HasDatabaseName("IX_Transaction_Date_Amount_Description");
    }
}
