namespace Waypoint.Infrastructure.Services;

public static class CategoryNormalizationService
{
    private static readonly List<(string[] Keywords, string Category)> Rules =
    [
        (["UBER EATS"], "Food Delivery"),
        (["PRIME VIDEO", "KINDLE", "APPLE.COM/BILL", "STEAMGAMES"], "Subscriptions"),
        (["AMAZON"], "Shopping"),
        (["RACETRAC", "EZ STOP", "FUEL"], "Transportation/Fuel"),
        (["WAL-MART", "WALMART"], "Shopping"),
        (["TJ MAXX"], "Clothing"),
        (["STARBUCKS"], "Food/Coffee"),
    ];

    public static string Normalize(string description, string originalCategory)
    {
        var upper = description.ToUpperInvariant();

        foreach (var (keywords, category) in Rules)
        {
            foreach (var keyword in keywords)
            {
                if (upper.Contains(keyword))
                    return category;
            }
        }

        return string.IsNullOrWhiteSpace(originalCategory) ? "Uncategorized" : originalCategory;
    }
}
