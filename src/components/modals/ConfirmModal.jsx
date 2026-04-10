function ConfirmModal({
  title,
  description,
  note,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  isBusy = false,
}) {
  return (
    <div className="ConfirmModal-overlay" onClick={onCancel}>
      <div
        className="ConfirmModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="ConfirmModal__eyebrow">Potje verwijderen</span>
        <h2 className="ConfirmModal__title" id="confirm-modal-title">
          {title}
        </h2>
        <p className="ConfirmModal__description">{description}</p>
        {note ? <p className="ConfirmModal__note">{note}</p> : null}

        <div className="ConfirmModal__actions">
          <button
            className="ConfirmModal__button ConfirmModal__button--secondary"
            type="button"
            onClick={onCancel}
            disabled={isBusy}
          >
            {cancelLabel}
          </button>

          <button
            className="ConfirmModal__button ConfirmModal__button--danger"
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
