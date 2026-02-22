using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Waypoint.Core.Entities;

namespace Waypoint.Infrastructure.Data.Configurations;

public class CreditCardConfiguration : IEntityTypeConfiguration<CreditCard>
{
    public void Configure(EntityTypeBuilder<CreditCard> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.CurrentBalance).HasColumnType("decimal(18,2)");
        builder.Property(x => x.CreditLimit).HasColumnType("decimal(18,2)");
        builder.Property(x => x.APR).HasColumnType("decimal(5,2)");
        builder.Property(x => x.MinimumPayment).HasColumnType("decimal(18,2)");
        builder.Property(x => x.StatementClosingDay).IsRequired();
        builder.Property(x => x.DueDay).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasMany(x => x.Payments)
               .WithOne(p => p.CreditCard)
               .HasForeignKey(p => p.CreditCardId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Statements)
               .WithOne(s => s.CreditCard)
               .HasForeignKey(s => s.CreditCardId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
