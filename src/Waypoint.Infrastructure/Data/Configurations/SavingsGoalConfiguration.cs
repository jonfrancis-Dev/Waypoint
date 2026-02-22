using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Waypoint.Core.Entities;

namespace Waypoint.Infrastructure.Data.Configurations;

public class SavingsGoalConfiguration : IEntityTypeConfiguration<SavingsGoal>
{
    public void Configure(EntityTypeBuilder<SavingsGoal> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.TargetAmount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.CurrentAmount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.TargetDate).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasMany(x => x.Contributions)
               .WithOne(c => c.SavingsGoal)
               .HasForeignKey(c => c.SavingsGoalId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
