import "./Potjes.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "../../utils/icons";
import { formatCurrency } from "../../utils/formatters";

function Potjes({ id, name, balance, targetAmount, icon }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const formattedSaved = formatCurrency(balance);
  const pct = targetAmount > 0 ? Math.min(Math.round((balance / targetAmount) * 100), 100) : 0;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleCLick() {
    navigate(`/budget-details/${id}`);
  }

  return (
    <div
      className={`Potje ${isMobile ? "Mobile" : "Desktop"}`}
      id={id}
      onClick={handleCLick}
    >
      <div className="Potje-top-row">
        <div className="Potje-image">
          <LucideIcon name={icon} size={20} strokeWidth={2} />
        </div>
        <span className="Potje-pct">{pct}%</span>
      </div>

      <h1 className="Potje-title">{name}</h1>
      <p className="Potje-amount">{formattedSaved}</p>

      <div className="Potje-progress">
        <div
          className="Potje-progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default Potjes;
