import "./Header.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, LogOut, UserRound, UserRoundPlus } from "lucide-react";
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
          <img className="Header-logo" src="/icon-512.png" alt="BudgetMaatje logo" />

          <div className="Header-brand-copy">
            <span className="Header-brand-title">{appConfig.appName}</span>
            <span className="Header-brand-subtitle">Budgetteren met digitale potjes</span>
          </div>
        </Link>

        <nav className="Header-actions">
          {session ? (
            <>
              <Link className="Header-link Header-link-primary" to="/account">
                <UserRound size={16} strokeWidth={2} />
                <span>Profiel</span>
              </Link>

              <button className="Header-link Header-link-secondary" type="button" onClick={handleLogout}>
                <LogOut size={16} strokeWidth={2} />
                <span>Uitloggen</span>
              </button>
            </>
          ) : (
            <>
              <Link className="Header-link Header-link-secondary" to="/login">
                <LogIn size={16} strokeWidth={2} />
                <span>Inloggen</span>
              </Link>

              <Link className="Header-link Header-link-primary" to="/register">
                <UserRoundPlus size={16} strokeWidth={2} />
                <span>Registreren</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
