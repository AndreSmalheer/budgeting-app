import { createPortal } from "react-dom";
import { ArrowLeft } from "lucide-react";
import "./ModalShell.css";

function ModalShell({
  title,
  subtitle = "",
  description = "",
  icon = null,
  children,
  actions,
  onClose,
  variant = "flow",
}) {
  const isFlow = variant === "flow";

  const modalContent = (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className={`modal ${isFlow ? "modal--flow" : ""}`}>
        {isFlow ? (
          <div className="modal-flow__header">
            {onClose ? (
              <button
                className="modal-flow__back-btn"
                type="button"
                onClick={onClose}
                aria-label="Sluiten"
              >
                <ArrowLeft size={20} />
              </button>
            ) : <div style={{ width: 36 }} />}

            <div className="modal-flow__title-group">
              <h3>{title}</h3>
              {subtitle || description ? (
                <span className="modal-flow__subtitle">{subtitle || description}</span>
              ) : null}
            </div>

            {icon ? (
              <div className="modal-flow__avatar">{icon}</div>
            ) : (
              <div style={{ width: 36 }} />
            )}
          </div>
        ) : (
          <>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </>
        )}

        {children}

        <div className={isFlow ? "modal-flow__actions" : "modal-actions"}>
          {actions}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
}

export default ModalShell;
