import "./Potjes.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Potjes({ progress, id }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

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
        <div className={`Potje ${isMobile ? "Mobile" : "Desktop"}`} id={id} onClick={handleCLick}>
            <div className="Potje-progress-circle" style={{ "--progress": `${progress}%` }}>
                <div className="Potje-image-wrapper">
                    <img className="Potje-image" src="/spaarvarken.png" />
                </div>
            </div>

            <h1 className="Potje-title">Title</h1>
            <h2 className="Potje-subtitle">200 Over</h2>
        </div>
    )
}

export default Potjes;
