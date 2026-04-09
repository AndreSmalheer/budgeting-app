import "./Potjes.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "../../utils/icons";
import { formatCurrency } from "../../utils/formatters";

function Potjes({ id, progress, name, balance, icon }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const formattedRemaining = formatCurrency(balance);

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
      <div
        className="Potje-progress-circle"
        style={{
          "--progress": `${progress}%`,
          "--progress-color": "#2ca58d",
        }}
      >
        <div className="Potje-image-wrapper">
          <div
            className="Potje-image"
            style={{
              background: "#E1F5EE",
            }}
          >
            <LucideIcon name={icon} size={22} strokeWidth={2} color="#ffffff" />
          </div>
        </div>
      </div>

      <h1 className="Potje-title">{name}</h1>
      <h2 className="Potje-subtitle">{formattedRemaining} resterend</h2>
    </div>
  );
}

export default Potjes;
