import BackBtn from "../../components/BackBtn/BackBtn";
import "./SeeAllPage.css";

function SeeAllPage({ type, potjes, transacties }) {
  const sortedTransacties = [...transacties].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const sortedPotjes = [...potjes].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="see-all-page">
      <BackBtn />

      <div className="SpendingOverview">
        {type === "transacties" && (
          <>
            <h2 className="section-title">Alle transacties</h2>

            <div className="recent-transactions">
              {sortedTransacties.length === 0 && (
                <p className="empty-state">Nog geen transacties</p>
              )}

              {sortedTransacties.map((t) => {
                const potjeName =
                  potjes.find((p) => p.id === t.potjeId)?.name || "Geen potje";

                const isExpense = t.type === "expense";

                return (
                  <div key={t.id} className="transaction">
                    <div className="transaction__info">
                      <p className="transaction__name">{t.description}</p>
                      <p className="transaction__meta">
                        {potjeName} · {t.date}
                      </p>
                    </div>

                    <span
                      className={`transaction__amount ${
                        isExpense ? "negative" : "positive"
                      }`}
                    >
                      {isExpense ? "-" : "+"}€
                      {Math.abs(t.amount).toLocaleString("nl-NL")}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {type === "potjes" && (
          <>
            <h2 className="section-title">Alle potjes</h2>

            <div className="potjes-list">
              {sortedPotjes.length === 0 && (
                <p className="empty-state">Nog geen potjes</p>
              )}

              {sortedPotjes.map((p) => (
                <div key={p.id} className="transaction">
                  <div className="transaction__info">
                    <p className="transaction__name">{p.name}</p>
                    <p className="transaction__meta">
                      Budget · €{p.budget.toLocaleString("nl-NL")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SeeAllPage;
