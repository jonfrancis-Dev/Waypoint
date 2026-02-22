using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Waypoint.Core.Entities;

namespace Waypoint.Infrastructure.Data.Configurations;

public class DebtConfiguration : IEntityTypeConfiguration<Debt>
{
    public void Configure(EntityTypeBuilder<Debt> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.CurrentBalance).HasColumnType("decimal(18,2)");
        builder.Property(x => x.OriginalBalance).HasColumnType("decimal(18,2)");
        builder.Property(x => x.APR).HasColumnType("decimal(5,2)");
        builder.Property(x => x.MinimumPayment).HasColumnType("decimal(18,2)");
        builder.Property(x => x.DebtType).IsRequired().HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.StartDate).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasMany(x => x.Payments)
               .WithOne(p => p.Debt)
               .HasForeignKey(p => p.DebtId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
