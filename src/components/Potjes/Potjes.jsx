import "./Potjes.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";

function Potjes({ id, progress, name, budget, spent, icon }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const remaining = budget - spent;

  const Icon =
    Icons[
      icon
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("")
    ] || Icons.Circle;

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
        style={{ "--progress": `${progress}%` }}
      >
        <div className="Potje-image-wrapper">
          <div className="Potje-image">
            <Icon />
          </div>
        </div>
      </div>

      <h1 className="Potje-title">{name}</h1>
      <h2 className="Potje-subtitle">{remaining} Over</h2>
    </div>
  );
}

export default Potjes;
