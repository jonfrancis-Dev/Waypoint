using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Waypoint.Core.Entities;

namespace Waypoint.Infrastructure.Data.Configurations;

public class DebtPaymentConfiguration : IEntityTypeConfiguration<DebtPayment>
{
    public void Configure(EntityTypeBuilder<DebtPayment> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Amount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.PaidOn).IsRequired();
        builder.Property(x => x.Note).HasMaxLength(1000);
    }
}
