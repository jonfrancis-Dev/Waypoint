using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Waypoint.Core.Entities;

namespace Waypoint.Infrastructure.Data.Configurations;

public class SavingsContributionConfiguration : IEntityTypeConfiguration<SavingsContribution>
{
    public void Configure(EntityTypeBuilder<SavingsContribution> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Amount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.ContributedOn).IsRequired();
        builder.Property(x => x.Note).HasMaxLength(1000);
    }
}
