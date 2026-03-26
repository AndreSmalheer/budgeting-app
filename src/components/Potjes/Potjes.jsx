import "./Potjes.css";
import { useState, useEffect } from "react";

function Potjes({ progress }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

    return (
        <div className={`Potje ${isMobile ? "Mobile" : "Desktop"}`}>
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
