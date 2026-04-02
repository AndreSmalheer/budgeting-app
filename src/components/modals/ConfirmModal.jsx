function ConfirmModal({
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        <p>{description}</p>

        <div className="modal-actions">
          <button className="btn-cancel" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>

          <button className="btn-delete" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
