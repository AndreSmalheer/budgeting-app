import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import BackBtn from "../../components/BackBtn/BackBtn";
import { LucideIcon } from "../../utils/icons";
import "./SeeAllPage.css";

function formatCurrency(value) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function SeeAllPage({ type, potjes, setPotjes, transacties }) {
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const sortedTransacties = [...transacties].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const sortedPotjes = [...potjes].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const confirmDelete = () => {
    setPotjes((prev) => prev.filter((potje) => potje.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="see-all-page">
      <BackBtn />

      <div className="SpendingOverview">
        {type === "transacties" && (
          <>
            <h2 className="section-title">Alle transacties</h2>

            <div className="recent-transactions">
              {sortedTransacties.length === 0 && (
                <p className="empty-state">Er zijn nog geen transacties.</p>
              )}

              {sortedTransacties.map((transaction) => {
                const potje = potjes.find((item) => item.id === transaction.potjeId);
                const potjeName = potje?.name || "Zonder potje";
                const isExpense = transaction.type === "expense";

                return (
                  <div key={transaction.id} className="transaction">
                    <div className="transaction__icon">
                      <LucideIcon name={potje?.icon} size={18} strokeWidth={2} />
                    </div>

                    <div className="transaction__info">
                      <p className="transaction__name">{transaction.description}</p>
                      <p className="transaction__meta">
                        {potjeName} · {transaction.date}
                      </p>
                    </div>

                    <span
                      className={`transaction__amount ${
                        isExpense ? "negative" : "positive"
                      }`}
                    >
                      {isExpense ? "-" : "+"}
                      {formatCurrency(Math.abs(transaction.amount))}
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
                <p className="empty-state">Er zijn nog geen potjes.</p>
              )}

              {sortedPotjes.map((potje) => {
                return (
                  <div
                    key={potje.id}
                    className="transaction"
                    onClick={() => navigate(`/budget-details/${potje.id}`)}
                  >
                    <div className="transaction__icon">
                      <LucideIcon name={potje.icon} size={18} strokeWidth={2} />
                    </div>

                    <div className="transaction__info">
                      <p className="transaction__name">{potje.name}</p>
                      <p className="transaction__meta">
                        Budget · {formatCurrency(potje.budget)}
                      </p>
                    </div>

                    <button
                      className="delete-btn"
                      type="button"
                      aria-label={`Verwijder ${potje.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setDeleteId(potje.id);
                      }}
                    >
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Weet je het zeker?</h2>
            <p>Dit potje wordt definitief verwijderd.</p>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                Annuleren
              </button>

              <button className="btn-delete" onClick={confirmDelete}>
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeeAllPage;
