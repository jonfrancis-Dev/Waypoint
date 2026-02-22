using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Waypoint.Core.Entities;

namespace Waypoint.Infrastructure.Data.Configurations;

public class CreditCardPaymentConfiguration : IEntityTypeConfiguration<CreditCardPayment>
{
    public void Configure(EntityTypeBuilder<CreditCardPayment> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Amount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.PrincipalApplied).HasColumnType("decimal(18,2)");
        builder.Property(x => x.InterestApplied).HasColumnType("decimal(18,2)");
        builder.Property(x => x.PaidOn).IsRequired();
        builder.Property(x => x.Note).HasMaxLength(1000);
    }
}
