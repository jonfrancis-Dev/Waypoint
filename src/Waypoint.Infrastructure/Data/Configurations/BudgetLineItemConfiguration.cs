using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Waypoint.Core.Entities;

namespace Waypoint.Infrastructure.Data.Configurations;

public class BudgetLineItemConfiguration : IEntityTypeConfiguration<BudgetLineItem>
{
    public void Configure(EntityTypeBuilder<BudgetLineItem> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CategoryName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.LimitAmount).HasColumnType("decimal(18,2)");
    }
}
