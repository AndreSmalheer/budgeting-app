import BackBtn from "../../components/BackBtn/BackBtn";
import "./SeeAllPage.css";

export const transacties = [
  {
    id: "t1",
    amount: 25.5,
    type: "expense",
    category: "food",
    description: "Boodschappen Albert Heijn",
    date: "2026-03-20",
    potjeId: "p1",
  },
];

export const potjes = [
  {
    id: "p1",
    name: "Boodschappen",
    budget: 300,
    icon: "shopping-cart",
    createdAt: "2026-03-27T10:00:00Z",
  },
];

function SeeAllPage() {
  const recent = [...transacties].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  return (
    <div className="see-all-page">
      <BackBtn />

      <div className="SpendingOverview">
        <h2 className="recent-transactions__title">Alle transacties</h2>

        <div className="recent-transactions">
          {recent.length === 0 && (
            <p className="empty-state">Nog geen transacties</p>
          )}

          {recent.map((t) => {
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
      </div>
    </div>
  );
}

export default SeeAllPage;
