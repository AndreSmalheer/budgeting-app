function BudgetWithdrawForm({
  amount,
  name,
  isValid,
  onAmountChange,
  onNameChange,
  onSubmit,
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

      <button
        className={`afnemen-button ${!isValid ? "disabled" : ""}`}
        type="button"
        onClick={onSubmit}
        disabled={!isValid}
      >
        Bedrag afhalen
      </button>
    </div>
  );
}

export default BudgetWithdrawForm;
