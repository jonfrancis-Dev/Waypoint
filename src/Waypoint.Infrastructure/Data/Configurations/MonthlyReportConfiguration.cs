using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Waypoint.Core.Entities;

namespace Waypoint.Infrastructure.Data.Configurations;

public class MonthlyReportConfiguration : IEntityTypeConfiguration<MonthlyReport>
{
    public void Configure(EntityTypeBuilder<MonthlyReport> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Month).IsRequired();
        builder.Property(x => x.Year).IsRequired();
        builder.Property(x => x.ReportContent).IsRequired().HasColumnType("nvarchar(max)");
        builder.Property(x => x.GeneratedAt).IsRequired();
    }
}
