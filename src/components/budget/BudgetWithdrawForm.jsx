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
      <input
        className="afnemen-input"
        type="text"
        placeholder="Naam van de transactie"
        value={name}
        onChange={onNameChange}
      />

      <input
        className="afnemen-input"
        type="number"
        inputMode="decimal"
        placeholder="Bedrag"
        value={amount}
        onChange={onAmountChange}
      />

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
