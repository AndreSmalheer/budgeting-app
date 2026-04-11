import { formatCurrency, formatDate } from "../../utils/formatters";

function ScheduledPaymentsList({ items = [] }) {
  const activeItems = items.filter((item) => item.isActive);

  return (
    <section className="scheduled-list">
      <div className="scheduled-list__header">
        <h3 className="scheduled-list__title">Geplande bedragen</h3>
        <p className="scheduled-list__subtitle">
          Actieve herhalingen blijven zichtbaar tot de einddatum is bereikt.
        </p>
      </div>

      {activeItems.length === 0 ? (
        <p className="empty-state">
          Er zijn nog geen actieve geplande bedragen voor dit potje.
        </p>
      ) : (
        <div className="scheduled-list__items">
          {activeItems.map((item) => (
            <article key={item.id} className="scheduled-card">
              <div className="scheduled-card__top">
                <div>
                  <p className="scheduled-card__name">{item.description}</p>
                  <p className="scheduled-card__meta">
                    {item.recurrence === "daily" ? "Dagelijks" : "Maandelijks"} · start{" "}
                    {formatDate(item.startDate)}
                  </p>
                </div>
                <span className="scheduled-card__amount">
                  -{formatCurrency(item.amount)}
                </span>
              </div>

              <div className="scheduled-card__bottom">
                <span className="scheduled-card__badge">Scheduled</span>
                <span className="scheduled-card__next">
                  Volgende uitvoering:{" "}
                  {item.nextExecutionDate ? formatDate(item.nextExecutionDate) : "geen"}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ScheduledPaymentsList;
