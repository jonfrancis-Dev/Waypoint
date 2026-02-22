using Waypoint.Core.DTOs;
using Waypoint.Core.Entities;

namespace Waypoint.Core.Interfaces;

public interface ICreditCardService
{
    Task<CreditCard> CreateCardAsync(CreateCreditCardDto dto);
    Task<CreditCard> UpdateCardAsync(Guid id, UpdateCreditCardDto dto);
    Task<CreditCard?> GetCardAsync(Guid id);
    Task<List<CreditCard>> GetAllCardsAsync();
    Task<bool> DeleteCardAsync(Guid id);

    Task<CreditCardPayment> LogPaymentAsync(Guid cardId, LogPaymentDto dto);
    Task<List<CreditCardPayment>> GetPaymentHistoryAsync(Guid cardId);

    Task<CreditCardStatement> CreateStatementAsync(Guid cardId, CreateStatementDto dto);
    Task<List<CreditCardStatement>> GetStatementsAsync(Guid cardId);

    Task<CreditCardMetrics> GetCardMetricsAsync(Guid cardId);
    Task<List<CreditCardMetrics>> GetAllCardMetricsAsync();
}
