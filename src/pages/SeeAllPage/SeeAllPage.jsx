import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import BackBtn from "../../components/BackBtn/BackBtn";
import ConfirmModal from "../../components/modals/ConfirmModal";
import PotListItem from "../../components/Potjes/PotListItem";
import TransactionItem from "../../components/transactions/TransactionItem";
import TransactionSection from "../../components/transactions/TransactionSection";
import "./SeeAllPage.css";

function SeeAllPage({ type, potjes, setPotjes, transacties }) {
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const sortedTransacties = [...transacties].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const sortedPotjes = [...potjes].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  function cancelDelete() {
    setDeleteId(null);
  }

  function confirmDelete() {
    setPotjes((prev) => prev.filter((potje) => potje.id !== deleteId));
    setDeleteId(null);
  }

  const transactionItems = sortedTransacties.map((transaction) => {
    const potje = potjes.find((item) => item.id === transaction.potjeId);

    return (
      <TransactionItem
        key={transaction.id}
        description={transaction.description}
        meta={`${potje?.name || "Zonder potje"} · ${transaction.date}`}
        amount={transaction.amount}
        isExpense={transaction.type === "expense"}
        iconName={potje?.icon}
      />
    );
  });

  return (
    <div className="see-all-page">
      <BackBtn />

      <div className="SpendingOverview">
        {type === "transacties" && (
          <TransactionSection
            title="Alle transacties"
            emptyText="Er zijn nog geen transacties."
            items={transactionItems}
            className="SpendingOverview"
          />
        )}

        {type === "potjes" && (
          <>
            <h2 className="section-title">Alle potjes</h2>

            <div className="potjes-list">
              {sortedPotjes.length === 0 && (
                <p className="empty-state">Er zijn nog geen potjes.</p>
              )}

              {sortedPotjes.map((potje) => (
                <PotListItem
                  key={potje.id}
                  name={potje.name}
                  budget={potje.budget}
                  iconName={potje.icon}
                  onClick={() => navigate(`/budget-details/${potje.id}`)}
                  action={
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
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>

      {deleteId && (
        <ConfirmModal
          title="Weet je het zeker?"
          description="Dit potje wordt definitief verwijderd."
          cancelLabel="Annuleren"
          confirmLabel="Verwijderen"
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default SeeAllPage;
