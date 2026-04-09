function BudgetWithdrawForm({
  amount,
  category,
  categories = [],
  name,
  isDepositValid,
  isWithdrawValid,
  onAmountChange,
  onCategoryChange,
  onNameChange,
  onDepositSubmit,
  onWithdrawSubmit,
  isSubmitting = false,
}) {
  return (
    <div className="afnemen-container">
      <div className="afnemen-copy">
        <p className="afnemen-eyebrow">Nieuwe beweging</p>
        <h2 className="afnemen-title">Voeg geld toe of haal iets af</h2>
      </div>

      <label className="afnemen-field">
        <span>Naam van de transactie</span>
        <input
          className="afnemen-input"
          type="text"
          placeholder="Bijvoorbeeld boodschappen of salaris"
          value={name}
          onChange={onNameChange}
        />
      </label>

      <div className="afnemen-grid">
        <label className="afnemen-field">
          <span>Bedrag</span>
          <input
            className="afnemen-input"
            type="number"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={onAmountChange}
          />
        </label>

        <label className="afnemen-field">
          <span>Categorie</span>
          <select
            className="afnemen-input"
            value={category}
            onChange={onCategoryChange}
          >
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="afnemen-actions">
        <button
          className={`afnemen-button toevoegen ${!isDepositValid ? "disabled" : ""}`}
          type="button"
          onClick={onDepositSubmit}
          disabled={!isDepositValid || isSubmitting}
        >
          Geld toevoegen
        </button>

        <button
          className={`afnemen-button afhalen ${!isWithdrawValid ? "disabled" : ""}`}
          type="button"
          onClick={onWithdrawSubmit}
          disabled={!isWithdrawValid || isSubmitting}
        >
          Bedrag afhalen
        </button>
      </div>
    </div>
  );
}

export default BudgetWithdrawForm;
