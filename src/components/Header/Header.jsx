import "./Header.css";
import { useState, useEffect } from "react";

function Header() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [isPopUpActive, setPopUpActive] = useState(false);
  const [activeLi, setActiveLi] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const togglePopUp = () => {
    setPopUpActive(prev => !prev);
  };

  const handleLiClick = (index) => {
    setActiveLi(index);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="Header-container">
      <div className={`Header ${isMobile ? "Mobile" : "Desktop"}`}>
        <img className="icon" src="/favicon.svg" />
        <h1>Naam App</h1>

        {loggedIn ? (
          <div className="loggin-container" onClick={togglePopUp}>
            <img className="profile-icon" src="/profile-icon-placeholder.png" />
          </div>
        ) : (
          <div className="loggin-container">
            <h1>Logging</h1>
            <img className="logging-icon" src="/loggin.png" />
          </div>
        )}

        <div className={`logged-in-pop-up ${isPopUpActive ? "active" : ""}`}>
          <ul>
            <li
              className={activeLi === 0 ? "active" : ""}
              onClick={() => handleLiClick(0)}
            >
              Action
            </li>
            <li
              className={activeLi === 1 ? "active" : ""}
              onClick={() => handleLiClick(1)}
            >
              Logout
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Header;
