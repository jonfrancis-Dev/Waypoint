using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Waypoint.Core.Entities;

namespace Waypoint.Infrastructure.Data.Configurations;

public class CreditCardStatementConfiguration : IEntityTypeConfiguration<CreditCardStatement>
{
    public void Configure(EntityTypeBuilder<CreditCardStatement> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.StatementMonth).IsRequired();
        builder.Property(x => x.StatementYear).IsRequired();
        builder.Property(x => x.OpeningBalance).HasColumnType("decimal(18,2)");
        builder.Property(x => x.ClosingBalance).HasColumnType("decimal(18,2)");
        builder.Property(x => x.InterestCharged).HasColumnType("decimal(18,2)");
        builder.Property(x => x.MinimumDue).HasColumnType("decimal(18,2)");
    }
}
