using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Waypoint.Core.Entities;

namespace Waypoint.Infrastructure.Data.Configurations;

public class BudgetPlanConfiguration : IEntityTypeConfiguration<BudgetPlan>
{
    public void Configure(EntityTypeBuilder<BudgetPlan> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Month).IsRequired();
        builder.Property(x => x.Year).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasMany(x => x.LineItems)
               .WithOne(li => li.BudgetPlan)
               .HasForeignKey(li => li.BudgetPlanId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
