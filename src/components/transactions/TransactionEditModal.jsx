import { useState } from "react";
import { TRANSACTION_CATEGORIES } from "../../config/transactionCategories";
import ModalShell from "../modals/ModalShell";

function TransactionEditModal({
  transaction,
  isSubmitting = false,
  onCancel,
  onSubmit,
}) {
  const isScheduled = transaction.itemType === "scheduled";
  const [formData, setFormData] = useState(() => ({
    description: transaction.description,
    amount: String(transaction.amount),
    type: transaction.type,
    category: transaction.category || "overig",
    recurrence: transaction.recurrence || "monthly",
    startDate: transaction.startDate || "",
    endDate: transaction.endDate || "",
  }));
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setFeedback("");
      await onSubmit({
        description: formData.description.trim(),
        amount: Number(formData.amount),
        type: formData.type,
        category: formData.category,
        recurrence: formData.recurrence,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
    } catch (error) {
      setFeedback(error.message || "De transactie kon niet worden bijgewerkt.");
    }
  }

  return (
    <ModalShell
      title={isScheduled ? "Gepland bedrag bewerken" : "Transactie bewerken"}
      description={
        isScheduled
          ? "Pas het geplande bedrag aan en sla de wijziging op."
          : "Pas de details aan en sla de wijziging op."
      }
      actions={
        <>
          <button className="btn-cancel" type="button" onClick={onCancel}>
            Annuleren
          </button>
          <button className="btn-save" type="submit" form="transaction-edit-form">
            {isSubmitting ? "Opslaan..." : "Opslaan"}
          </button>
        </>
      }
    >
      <form id="transaction-edit-form" className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="transaction-description">Naam</label>
          <input
            id="transaction-description"
            value={formData.description}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </div>

        <div className="modal-field">
          <label htmlFor="transaction-amount">Bedrag</label>
          <input
            id="transaction-amount"
            inputMode="decimal"
            value={formData.amount}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                amount: event.target.value.replace(",", "."),
              }))
            }
          />
        </div>

        <div className="modal-field">
          <label htmlFor="transaction-type">Type</label>
          <select
            id="transaction-type"
            value={formData.type}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                type: event.target.value,
              }))
            }
          >
            <option value="deposit">Storting</option>
            <option value="expense">Uitgave</option>
          </select>
        </div>

        <div className="modal-field">
          <label htmlFor="transaction-category">Categorie</label>
          <select
            id="transaction-category"
            value={formData.category}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
          >
            {TRANSACTION_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {isScheduled ? (
          <>
            <div className="modal-field">
              <label htmlFor="transaction-recurrence">Herhaling</label>
              <select
                id="transaction-recurrence"
                value={formData.recurrence}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    recurrence: event.target.value,
                  }))
                }
              >
                <option value="daily">Dagelijks</option>
                <option value="monthly">Maandelijks</option>
              </select>
            </div>

            <div className="modal-field">
              <label htmlFor="transaction-startDate">Startdatum</label>
              <input
                id="transaction-startDate"
                type="date"
                value={formData.startDate}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
              />
            </div>

            <div className="modal-field">
              <label htmlFor="transaction-endDate">Einddatum</label>
              <input
                id="transaction-endDate"
                type="date"
                value={formData.endDate}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
              />
            </div>
          </>
        ) : null}
      </form>

      {feedback ? <p className="modal-feedback">{feedback}</p> : null}
    </ModalShell>
  );
}

export default TransactionEditModal;
