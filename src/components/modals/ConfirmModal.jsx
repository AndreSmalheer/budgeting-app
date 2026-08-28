import ModalShell from "./ModalShell";
import { Trash2, X } from "lucide-react";

function ConfirmModal({
  title,
  description,
  cancelLabel = "Annuleren",
  confirmLabel = "Verwijderen",
  onCancel,
  onConfirm,
}) {
  return (
    <ModalShell
      title={title}
      subtitle="Definitieve actie"
      icon={<Trash2 size={18} color="#ef4444" />}
      onClose={onCancel}
      actions={
        <>
          {/* <button
            className="btn-circle-cancel"
            type="button"
            onClick={onCancel}
            aria-label={cancelLabel}
          >
            <X size={20} />
          </button> */}

          <button className="btn-flow-danger" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    ></ModalShell>
  );
}

export default ConfirmModal;
