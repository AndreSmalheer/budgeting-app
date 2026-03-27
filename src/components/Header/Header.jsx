import "./Header.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import appConfig from "../../config/appConfig";
import { clearStoredSession, getStoredSession } from "../../utils/authStorage";

function Header() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getStoredSession());

  useEffect(() => {
    const syncSession = () => {
      setSession(getStoredSession());
    };

    window.addEventListener("storage", syncSession);
    window.addEventListener("auth-changed", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("auth-changed", syncSession);
    };
  }, []);

  function handleLogout() {
    clearStoredSession();
    navigate("/");
  }

  return (
    <header className="Header-shell">
      <div className="Header">
        <Link className="Header-brand" to="/">
          <img className="Header-logo" src="/favicon.svg" alt="BudgetMaatje logo" />

          <div className="Header-brand-copy">
            <span className="Header-brand-title">{appConfig.appName}</span>
            <span className="Header-brand-subtitle">Budgetteren met digitale potjes</span>
          </div>
        </Link>

        <nav className="Header-actions">
          {session ? (
            <>
              <Link className="Header-link Header-link-primary" to="/account">
                Ga naar account
              </Link>

              <button className="Header-link Header-link-secondary" type="button" onClick={handleLogout}>
                Uitloggen
              </button>
            </>
          ) : (
            <>
              <Link className="Header-link Header-link-secondary" to="/login">
                Login
              </Link>

              <Link className="Header-link Header-link-primary" to="/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
