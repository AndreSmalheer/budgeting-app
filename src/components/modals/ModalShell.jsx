import "./ModalShell.css";

function ModalShell({ title, description = "", children, actions }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
        {children}
        <div className="modal-actions">{actions}</div>
      </div>
    </div>
  );
}

export default ModalShell;
