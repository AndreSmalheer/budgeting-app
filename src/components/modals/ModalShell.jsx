import { createPortal } from "react-dom";
import "./ModalShell.css";

function ModalShell({ title, description = "", children, actions }) {
  const modalContent = (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
        {children}
        <div className="modal-actions">{actions}</div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
}

export default ModalShell;
