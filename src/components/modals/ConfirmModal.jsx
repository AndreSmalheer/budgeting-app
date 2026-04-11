import ModalShell from "./ModalShell";

function ConfirmModal({
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}) {
  return (
    <ModalShell
      title={title}
      description={description}
      actions={
        <>
          <button className="btn-cancel" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>

          <button className="btn-delete" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    />
  );
}

export default ConfirmModal;
