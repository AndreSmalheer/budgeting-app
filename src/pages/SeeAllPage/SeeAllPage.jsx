import BackBtn from "../../components/BackBtn/BackBtn";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SeeAllPage.css";
import * as Icons from "lucide-react";

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 6h18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 6V4h8v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

function SeeAllPage({ type, potjes, setPotjes, transacties, setTransacties }) {
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
    console.log(`potje verwijderen ${deleteId}`);

    setPotjes((prev) => prev.filter((p) => p.id !== deleteId));

    setDeleteId(null);
  };

  const handleDeletePotje = (id) => {
    console.log(`potje verwijderen ${id}`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
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
                <p className="empty-state">Nog geen transacties</p>
              )}

              {sortedTransacties.map((t) => {
                const potjeName =
                  potjes.find((p) => p.id === t.potjeId)?.name || "Geen potje";

                const potje = potjes.find((p) => p.id === t.potjeId);
                const iconName = potje?.icon || "";

                const isExpense = t.type === "expense";

                const Icon =
                  Icons[
                    iconName
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join("")
                  ] || Icons.Circle;

                return (
                  <div key={t.id} className="transaction">
                    <div className="transaction__icon">
                      <Icon />
                    </div>

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

              {sortedPotjes.map((p) => {
                const Icon =
                  Icons[
                    p.icon
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join("")
                  ] || Icons.Circle;

                return (
                  <div
                    key={p.id}
                    className="transaction"
                    onClick={() => navigate(`/budget-details/${p.id}`)}
                  >
                    <div className="transaction__icon">
                      <Icon />
                    </div>

                    <div className="transaction__info">
                      <p className="transaction__name">{p.name}</p>
                      <p className="transaction__meta">
                        Budget · €{p.budget.toLocaleString("nl-NL")}
                      </p>
                    </div>

                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(p.id);
                      }}
                    >
                      <TrashIcon />
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
            <p>Dit potje wordt permanent verwijderd.</p>

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
