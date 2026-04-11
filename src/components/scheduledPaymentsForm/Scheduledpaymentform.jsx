import { useState } from "react";
import "./Scheduledpaymentform.css"

const REPEAT_OPTIONS = [
  "Eenmalig",
  "Wekelijks",
  "Maandelijks",
  "Per kwartaal",
  "Jaarlijks",
];
const CATEGORIES = [
  "Overig",
  "Huur & wonen",
  "Boodschappen",
  "Transport",
  "Abonnementen",
];

function ScheduledPaymentForm({ onSubmit, onCancel, potName = "" }) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(
    `${potName} afschrijving`.trim(),
  );
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Overig");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [repeat, setRepeat] = useState("Maandelijks");

  function handleToggle() {
    setOpen((v) => !v);
  }

  function handleCancel() {
    setOpen(false);
    onCancel?.();
  }

  function handleSubmit() {
    if (!description.trim() || !amount || !startDate) return;
    onSubmit?.({
      description,
      amount: +amount,
      category,
      startDate,
      endDate,
      repeat,
    });
    setOpen(false);
  }

  const dateHint = (() => {
    if (!startDate) return null;
    const d = new Date(startDate);
    const now = new Date();
    const diff = Math.round((d - now) / (1000 * 60 * 60 * 24));
    const label = d.toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (diff < 0) return `Startdatum ligt in het verleden`;
    if (diff === 0) return `Eerste betaling vandaag — ${label}`;
    return `Eerste betaling op ${label} — over ${diff} dagen`;
  })();

  return (
    <div className="spf-wrap">
      <button
        className={`spf-trigger${open ? " open" : ""}`}
        onClick={handleToggle}
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
          <div className="spf-trigger-label">Betaling inplannen</div>
          <div className="spf-trigger-sub">
            Stel een automatische afschrijving in
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
              placeholder="Bijv. Huur mei"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="spf-field">
              <label className="spf-label">Categorie</label>
              <select
                className="spf-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
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
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="spf-field">
              <label className="spf-label">Einddatum</label>
              <input
                className="spf-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {dateHint && (
            <div className="spf-date-hint">
              <div className="spf-hint-dot" />
              <div className="spf-hint-text">{dateHint}</div>
            </div>
          )}

          <div className="spf-field">
            <label className="spf-label">Herhaling</label>
            <div className="spf-pills">
              {REPEAT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={`spf-pill${repeat === opt ? " active" : ""}`}
                  onClick={() => setRepeat(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="spf-divider" />

          <div className="spf-actions">
            <button
              className={`spf-btn spf-btn--save${!description.trim() || !amount || !startDate ? " disabled" : ""}`}
              onClick={handleSubmit}
              disabled={!description.trim() || !amount || !startDate}
            >
              Inplannen
            </button>
            <button
              className={`spf-btn spf-btn--cancel spf-btn--action${
                !description.trim() || !amount || !startDate
                  ? " spf-btn--disabled"
                  : ""
              }`}
              onClick={handleCancel}
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
