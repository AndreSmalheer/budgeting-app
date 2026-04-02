import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import BackBtn from "../../components/BackBtn/BackBtn";
import ConfirmModal from "../../components/modals/ConfirmModal";
import PotListItem from "../../components/Potjes/PotListItem";
import TransactionItem from "../../components/transactions/TransactionItem";
import TransactionSection from "../../components/transactions/TransactionSection";
import { useSession } from "../../hooks/useSession";
import { deletePot as deletePotRequest } from "../../services/api/client";
import { formatDate } from "../../utils/formatters";
import "./SeeAllPage.css";

function SeeAllPage({
  type,
  potjes,
  transacties,
  isLoading = false,
  errorMessage = "",
  onPotDeleted,
}) {
  const { id: filterPotId } = useParams();
  const [deleteId, setDeleteId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const session = useSession();

  const sortedTransacties = useMemo(() => {
    const baseTransactions = filterPotId
      ? transacties.filter((transaction) => transaction.potId === filterPotId)
      : transacties;

    return [...baseTransactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [filterPotId, transacties]);

  const sortedPotjes = [...potjes].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  const selectedPot = filterPotId
    ? potjes.find((potje) => potje.id === filterPotId)
    : null;

  function cancelDelete() {
    setDeleteId(null);
  }

  async function confirmDelete() {
    if (!deleteId || !session?.id) {
      return;
    }

    setIsDeleting(true);
    setFeedback("");

    try {
      await deletePotRequest(session.id, deleteId);
      await onPotDeleted?.();
      setDeleteId(null);
    } catch (error) {
      setFeedback(error.message || "Het potje kon niet worden verwijderd.");
    } finally {
      setIsDeleting(false);
    }
  }

  const transactionItems = sortedTransacties.map((transaction) => {
    const potje = potjes.find((item) => item.id === transaction.potId);

    return (
      <TransactionItem
        key={transaction.id}
        description={transaction.description}
        meta={`${potje?.name || "Zonder potje"} · ${formatDate(transaction.createdAt)}`}
        amount={transaction.amount}
        isExpense={transaction.type === "expense"}
        iconName={potje?.icon}
      />
    );
  });

  return (
    <div className="see-all-page">
      <BackBtn />
      {isLoading && <p className="empty-state">Gegevens laden...</p>}
      {!isLoading && errorMessage && <p className="empty-state">{errorMessage}</p>}
      {feedback && <p className="empty-state">{feedback}</p>}

      <div className={`SpendingOverview ${type === "potjes" ? "potjes" : "transacties"}`}>
        {type === "transacties" && (
          <TransactionSection
            title={
              selectedPot ? `Alle transacties van ${selectedPot.name}` : "Alle transacties"
            }
            emptyText={
              selectedPot
                ? "Er zijn nog geen transacties voor dit potje."
                : "Er zijn nog geen transacties."
            }
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
                  budget={potje.currentBalance}
                  iconName={potje.icon}
                  onClick={() => navigate(`/budget-details/${potje.id}`)}
                  action={
                    <button
                      className="delete-btn"
                      type="button"
                      aria-label={`Verwijder ${potje.name}`}
                      disabled={isDeleting}
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
          confirmLabel={isDeleting ? "Bezig..." : "Verwijderen"}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default SeeAllPage;
