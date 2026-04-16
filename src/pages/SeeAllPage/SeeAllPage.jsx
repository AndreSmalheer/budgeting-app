import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2, GripVertical } from "lucide-react";

// Add this component for sortable items
function SortablePotListItem({ potje, isMutating, navigate, setDeletePotId }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: potje.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <PotListItem
        name={potje.name}
        balance={potje.currentBalance}
        targetAmount={potje.targetAmount}
        iconName={potje.icon}
        onClick={() => navigate(`/budget-details/${potje.id}`)}
        action={
          <div className="item-actions">
            <button
              className="icon-action-btn"
              type="button"
              aria-label={`Bewerk ${potje.name}`}
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/potje-bewerken/${potje.id}`);
              }}
            >
              <Pencil size={16} />
            </button>
            <button
              className="icon-action-btn delete-btn"
              type="button"
              aria-label={`Verwijder ${potje.name}`}
              disabled={isMutating}
              onClick={(event) => {
                event.stopPropagation();
                setDeletePotId(potje.id);
              }}
            >
              <Trash2 size={16} />
            </button>
            <button
              className="icon-action-btn reorder-btn"
              type="button"
              aria-label="Sorteer potje"
              {...listeners}
            >
              <GripVertical size={16} />
            </button>
          </div>
        }
      />
    </div>
  );
}
// Replace the render logic for type === 'potjes' in SeeAllPage with DndContext and SortableContext

import BackBtn from "../../components/BackBtn/BackBtn";
import ConfirmModal from "../../components/modals/ConfirmModal";
import PotListItem from "../../components/Potjes/PotListItem";
import TransactionEditModal from "../../components/transactions/TransactionEditModal";
import TransactionItem from "../../components/transactions/TransactionItem";
import TransactionSection from "../../components/transactions/TransactionSection";
import { getTransactionCategoryLabel } from "../../config/transactionCategories";
import { useSession } from "../../hooks/useSession";
import {
  deletePot as deletePotRequest,
  deleteScheduledTransaction as deleteScheduledTransactionRequest,
  deleteTransaction as deleteTransactionRequest,
  getTransactions as getTransactionsRequest,
  updateScheduledTransaction as updateScheduledTransactionRequest,
  updateTransaction as updateTransactionRequest,
  reorderPots as reorderPotsRequest,
} from "../../services/api/client";
import { formatDate } from "../../utils/formatters";
import {
  getTransactionStatusLabel,
  getTransactionStatusTone,
} from "../../utils/transactionStatus";
import "./SeeAllPage.css";

function SeeAllPage({
  type,
  potjes,
  scheduledTransactions = [],
  isLoading = false,
  errorMessage = "",
  onBudgetDataChanged,
}) {
  const { id: filterPotId } = useParams();
  const [isReordering, setIsReordering] = useState(false);
  const [deletePotId, setDeletePotId] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isMutating, setIsMutating] = useState(false);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");
  const navigate = useNavigate();
  const session = useSession();

  const [localPotjes, setLocalPotjes] = useState([]);

  useEffect(() => {
    // Only update localPotjes if the incoming potjes are actually different in data,
    // not just because of a re-render.
    setLocalPotjes((current) => {
        // Simple check to see if IDs are same
        const currentIds = current.map(p => p.id).join(',');
        const newIds = [...potjes].sort((a,b) => a.orderIndex - b.orderIndex).map(p => p.id).join(',');

        if (currentIds === newIds) {
            return current;
        }

        return [...potjes].sort((a, b) => {
            return (a.orderIndex || 0) - (b.orderIndex || 0);
        });
    });
  }, [potjes]);

  const sortedPotjes = localPotjes;
  const selectedPot = filterPotId
    ? localPotjes.find((potje) => potje.id === filterPotId)
    : null;

  const loadFilteredTransactions = useCallback(async () => {
    if (type !== "transacties" || !session?.id) {
      return;
    }

    setIsTransactionsLoading(true);

    try {
      const response = await getTransactionsRequest(session.id, {
        potId: filterPotId,
        type: transactionTypeFilter === "scheduled" ? "" : transactionTypeFilter,
      });

      setFilteredTransactions(response.transactions || []);
    } catch (error) {
      setFeedback(error.message || "De transacties konden niet geladen worden.");
    } finally {
      setIsTransactionsLoading(false);
    }
  }, [filterPotId, session?.id, transactionTypeFilter, type]);

  useEffect(() => {
    loadFilteredTransactions();
  }, [loadFilteredTransactions]);

  async function handlePotDelete() {
    if (!deletePotId || !session?.id) {
      return;
    }

    setIsMutating(true);
    setFeedback("");

    try {
      const response = await deletePotRequest(session.id, deletePotId);
      await onBudgetDataChanged?.();
      setDeletePotId(null);
      setFeedback(response.message || "");
    } catch (error) {
      setFeedback(error.message || "Het potje kon niet worden verwijderd.");
    } finally {
      setIsMutating(false);
    }
  }

  async function handleTransactionUpdate(formData) {
    if (!editingTransaction || !session?.id) {
      return;
    }

    setIsMutating(true);

    try {
      const response =
        editingTransaction.itemType === "scheduled"
          ? await updateScheduledTransactionRequest(editingTransaction.id, {
              userId: session.id,
              description: formData.description,
              amount: formData.amount,
              type: formData.type,
              category: formData.category,
              recurrence: formData.recurrence,
              startDate: formData.startDate,
              endDate: formData.endDate,
            })
          : await updateTransactionRequest(editingTransaction.id, {
              userId: session.id,
              ...formData,
            });

      await Promise.all([onBudgetDataChanged?.(), loadFilteredTransactions()]);
      setEditingTransaction(null);
      setFeedback(response.message || "");
    } finally {
      setIsMutating(false);
    }
  }

  async function handleTransactionDelete() {
    if (!transactionToDelete || !session?.id) {
      return;
    }

    setIsMutating(true);
    setFeedback("");

    try {
      const response =
        transactionToDelete.itemType === "scheduled"
          ? await deleteScheduledTransactionRequest(session.id, transactionToDelete.id)
          : await deleteTransactionRequest(session.id, transactionToDelete.id);
      await Promise.all([onBudgetDataChanged?.(), loadFilteredTransactions()]);
      setTransactionToDelete(null);
      setFeedback(response.message || "");
    } catch (error) {
      setFeedback(
        error.message ||
          (transactionToDelete.itemType === "scheduled"
            ? "Het geplande bedrag kon niet worden verwijderd."
            : "De transactie kon niet worden verwijderd."),
      );
    } finally {
      setIsMutating(false);
    }
  }

  const visibleScheduledItems = useMemo(
    () =>
      scheduledTransactions
        .filter((item) => item.isActive)
        .filter((item) => !filterPotId || item.potId === filterPotId)
        .map((item) => ({
          ...item,
          itemType: "scheduled",
          sortDate: item.nextExecutionDate || item.startDate,
        })),
    [filterPotId, scheduledTransactions],
  );

  const visibleItems = useMemo(() => {
    const mappedTransactions = filteredTransactions.map((transaction) => ({
      ...transaction,
      itemType: "transaction",
      sortDate: transaction.createdAt,
    }));

    if (transactionTypeFilter === "scheduled") {
      return visibleScheduledItems;
    }

    const mergedItems =
      transactionTypeFilter === "all"
        ? [...visibleScheduledItems, ...mappedTransactions]
        : mappedTransactions;

    return mergedItems.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));
  }, [filteredTransactions, transactionTypeFilter, visibleScheduledItems]);

  const transactionItems = visibleItems.map((item) => {
    const potje = potjes.find((entry) => entry.id === item.potId);

    return (
      <TransactionItem
        key={`${item.itemType}-${item.id}`}
        description={item.description}
        meta={
          item.itemType === "scheduled"
            ? `${potje?.name || "Zonder potje"} · Volgende uitvoering ${formatDate(
                item.nextExecutionDate,
              )}`
            : `${potje?.name || "Zonder potje"} · ${formatDate(item.createdAt)}`
        }
        amount={item.amount}
        isExpense={item.type === "expense"}
        iconName={potje?.icon}
        categoryLabel={
          item.itemType === "scheduled"
            ? item.type === "deposit"
              ? "Bijschrijving"
              : "Afschrijving"
            : getTransactionCategoryLabel(item.category)
        }
        statusLabel={
          item.itemType === "scheduled"
            ? item.recurrence === "daily"
              ? "Scheduled · Dagelijks"
              : "Scheduled · Maandelijks"
            : getTransactionStatusLabel(item.status)
        }
        statusTone={
          item.itemType === "scheduled"
            ? "scheduled"
            : getTransactionStatusTone(item.status)
        }
        action={
          <div className="item-actions">
            <button
              className="icon-action-btn"
              type="button"
              disabled={isMutating}
              aria-label={`Bewerk ${item.description}`}
              onClick={() => setEditingTransaction(item)}
            >
              <Pencil size={16} />
            </button>
            <button
              className="icon-action-btn delete-btn"
              type="button"
              disabled={isMutating}
              aria-label={`Verwijder ${item.description}`}
              onClick={() => setTransactionToDelete(item)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        }
      />
    );
  });

  return (
    <div className="see-all-page">
      <BackBtn />
      {!isLoading && errorMessage && <p className="empty-state">{errorMessage}</p>}
      {feedback && <p className="empty-state">{feedback}</p>}

      <div className={`SpendingOverview ${type === "potjes" ? "potjes" : "transacties"}`}>
        {type === "transacties" ? (
          <TransactionSection
            title={selectedPot ? `Alle transacties van ${selectedPot.name}` : "Alle transacties"}
            belowHeaderContent={
              <>
                <div className="transaction-filters__compact transaction-filters__compact--four">
                  <button
                    className={`filter-chip ${transactionTypeFilter === "all" ? "active" : ""}`}
                    type="button"
                    onClick={() => setTransactionTypeFilter("all")}
                  >
                    Alles
                  </button>
                  <button
                    className={`filter-chip ${transactionTypeFilter === "deposit" ? "active" : ""}`}
                    type="button"
                    onClick={() => setTransactionTypeFilter("deposit")}
                  >
                    Stortingen
                  </button>
                  <button
                    className={`filter-chip ${transactionTypeFilter === "expense" ? "active" : ""}`}
                    type="button"
                    onClick={() => setTransactionTypeFilter("expense")}
                  >
                    Uitgaven
                  </button>
                  <button
                    className={`filter-chip ${transactionTypeFilter === "scheduled" ? "active" : ""}`}
                    type="button"
                    onClick={() => setTransactionTypeFilter("scheduled")}
                  >
                    Scheduled
                  </button>
                </div>

                {!isReordering && isTransactionsLoading ? (
                  <p className="transaction-filters__status">Transacties laden...</p>
                ) : null}
              </>
            }
            emptyText={
              selectedPot
                ? "Er zijn nog geen transacties voor dit potje."
                : "Er zijn nog geen transacties."
            }
            items={transactionItems}
            className="SpendingOverview"
          />
        ) : null}

        {type === "potjes" ? (
          <>
            <h2 className="section-title">Alle doelpotjes</h2>

            <DndContext
              sensors={useSensors(
                useSensor(PointerSensor),
                useSensor(KeyboardSensor, {
                  coordinateGetter: sortableKeyboardCoordinates,
                })
              )}
              collisionDetection={closestCenter}
              onDragStart={() => setIsReordering(true)}
              onDragEnd={(event) => {
                setIsReordering(false);
                const { active, over } = event;
                if (active.id !== over.id) {
                  const oldIndex = sortedPotjes.findIndex((p) => p.id === active.id);
                  const newIndex = sortedPotjes.findIndex((p) => p.id === over.id);
                  const newOrder = arrayMove(sortedPotjes, oldIndex, newIndex);

                  // Optimistically update the UI
                  setLocalPotjes(newOrder);

                  // Persist to backend
                  reorderPotsRequest(session.id, { orderedIds: newOrder.map(p => p.id) })
                    .then(() => {
                        // Trigger a refresh without showing the global loading state
                        onBudgetDataChanged?.(true);
                    })
                    .catch((err) => {
                      console.error("Reorder failed:", err);
                      // Revert on failure
                      setLocalPotjes(sortedPotjes);
                    });
                }
              }}
            >
              <div className="potjes-list">
                {sortedPotjes.length === 0 ? (
                  <p className="empty-state">Er zijn nog geen potjes.</p>
                ) : null}

                <SortableContext items={sortedPotjes.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  {sortedPotjes.map((potje) => (
                    <SortablePotListItem
                      key={potje.id}
                      potje={potje}
                      isMutating={false}
                      navigate={navigate}
                      setDeletePotId={setDeletePotId}
                    />
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          </>
        ) : null}
      </div>

      {deletePotId ? (
        <ConfirmModal
          title="Weet je het zeker?"
          description="Dit potje wordt definitief verwijderd."
          cancelLabel="Annuleren"
          confirmLabel={isMutating ? "Bezig..." : "Verwijderen"}
          onCancel={() => setDeletePotId(null)}
          onConfirm={handlePotDelete}
        />
      ) : null}

      {editingTransaction ? (
        <TransactionEditModal
          key={`${editingTransaction.itemType}-${editingTransaction.id}`}
          transaction={editingTransaction}
          isSubmitting={isMutating}
          onCancel={() => setEditingTransaction(null)}
          onSubmit={handleTransactionUpdate}
        />
      ) : null}

      {transactionToDelete ? (
        <ConfirmModal
          title={
            transactionToDelete.itemType === "scheduled"
              ? "Gepland bedrag verwijderen?"
              : "Transactie verwijderen?"
          }
          description={
            transactionToDelete.itemType === "scheduled"
              ? "Dit geplande bedrag stopt en wordt verwijderd."
              : "Deze transactie wordt definitief verwijderd."
          }
          cancelLabel="Annuleren"
          confirmLabel={isMutating ? "Bezig..." : "Verwijderen"}
          onCancel={() => setTransactionToDelete(null)}
          onConfirm={handleTransactionDelete}
        />
      ) : null}
    </div>
  );
}

export default SeeAllPage;
