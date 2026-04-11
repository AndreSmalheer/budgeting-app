import { useState } from "react";
import { TRANSACTION_CATEGORIES } from "../../config/transactionCategories";
import "./Scheduledpaymentform.css";

const REPEAT_OPTIONS = [
  { label: "Dagelijks", value: "daily" },
  { label: "Maandelijks", value: "monthly" },
];

function ScheduledPaymentForm({ onSubmit, onCancel, potName = "" }) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(`${potName} afschrijving`.trim());
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("overig");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [repeat, setRepeat] = useState("monthly");

  function handleToggle() {
    setOpen((value) => !value);
  }

  function handleCancel() {
    setOpen(false);
    onCancel?.();
  }

  function handleSubmit() {
    if (!description.trim() || !amount || !startDate) {
      return;
    }

    onSubmit?.({
      description: description.trim(),
      amount: Number(amount),
      type,
      category,
      startDate,
      endDate,
      recurrence: repeat,
    });
    setOpen(false);
  }

  const dateHint = (() => {
    if (!startDate) {
      return null;
    }

    const targetDate = new Date(`${startDate}T00:00:00`);
    const today = new Date();
    const diff = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
    const label = targetDate.toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (diff < 0) {
      return "Startdatum ligt in het verleden";
    }

    if (diff === 0) {
      return `Eerste betaling vandaag - ${label}`;
    }

    return `Eerste betaling op ${label} - over ${diff} dagen`;
  })();

  const isInvalid = !description.trim() || !amount || !startDate;

  return (
    <div className="spf-wrap">
      <button
        className={`spf-trigger${open ? " open" : ""}`}
        onClick={handleToggle}
        type="button"
      >
        <div className="spf-trigger-icon">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="4"
              width="16"
              height="13"
              rx="2.5"
              stroke="#2dd4bf"
              strokeWidth="1.5"
            />
            <path d="M2 8h16" stroke="#2dd4bf" strokeWidth="1.5" />
            <path
              d="M6 2v3M14 2v3"
              stroke="#2dd4bf"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="7" cy="12" r="1" fill="#2dd4bf" />
            <circle cx="10" cy="12" r="1" fill="#2dd4bf" />
            <circle cx="13" cy="12" r="1" fill="#2dd4bf" />
          </svg>
        </div>
        <div className="spf-trigger-text">
          <div className="spf-trigger-label">Bedrag inplannen</div>
          <div className="spf-trigger-sub">
            Stel een dagelijkse of maandelijkse bij- of afschrijving in
          </div>
        </div>
        <svg className="spf-chevron" viewBox="0 0 20 20" fill="none">
          <path
            d="M5 7.5l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className={`spf-panel-wrap${open ? " open" : ""}`}>
        <div className="spf-panel">
          <div className="spf-field">
            <label className="spf-label">Omschrijving</label>
            <input
              className="spf-input"
              type="text"
              placeholder="Bijv. huur of salaris"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="spf-grid-2">
            <div className="spf-field">
              <label className="spf-label">Bedrag</label>
              <div className="spf-amount-wrap">
                <span className="spf-amount-prefix">€</span>
                <input
                  className="spf-input"
                  inputMode="decimal"
                  type="number"
                  placeholder="0,00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
            </div>
            <div className="spf-field">
              <label className="spf-label">Type</label>
              <select
                className="spf-input"
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option value="expense">Afschrijving</option>
                <option value="deposit">Bijschrijving</option>
              </select>
            </div>
          </div>

          <div className="spf-grid-2">
            <div className="spf-field">
              <label className="spf-label">Categorie</label>
              <select
                className="spf-input"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {TRANSACTION_CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="spf-field">
              <label className="spf-label">Herhaling</label>
              <div className="spf-pills">
                {REPEAT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`spf-pill${repeat === option.value ? " active" : ""}`}
                    onClick={() => setRepeat(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="spf-divider" />

          <div className="spf-grid-2">
            <div className="spf-field">
              <label className="spf-label">Startdatum</label>
              <input
                className="spf-input"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="spf-field">
              <label className="spf-label">Einddatum</label>
              <input
                className="spf-input"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>

          {dateHint ? (
            <div className="spf-date-hint">
              <div className="spf-hint-dot" />
              <div className="spf-hint-text">{dateHint}</div>
            </div>
          ) : null}

          <div className="spf-divider" />

          <div className="spf-actions">
            <button
              className={`spf-btn spf-btn--save${isInvalid ? " disabled" : ""}`}
              onClick={handleSubmit}
              disabled={isInvalid}
              type="button"
            >
              Inplannen
            </button>
            <button
              className={`spf-btn spf-btn--cancel spf-btn--action${
                isInvalid ? " spf-btn--disabled" : ""
              }`}
              onClick={handleCancel}
              type="button"
            >
              Annuleren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduledPaymentForm;
