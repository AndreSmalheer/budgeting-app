import { Link, useNavigate } from "react-router-dom";
import { LogIn, LogOut, UserRound, UserRoundPlus } from "lucide-react";
import appConfig from "../../config/appConfig";
import { clearStoredSession } from "../../utils/authStorage";
import { useSession } from "../../hooks/useSession";
import "./Header.css";

function HeaderActionLink({ to, variant, icon, label }) {
  const IconComponent = icon;

  return (
    <Link className={`Header-link ${variant}`} to={to}>
      <IconComponent size={16} strokeWidth={2} />
      <span>{label}</span>
    </Link>
  );
}

function HeaderActionButton({ onClick, variant, icon, label }) {
  const IconComponent = icon;

  return (
    <button className={`Header-link ${variant}`} type="button" onClick={onClick}>
      <IconComponent size={16} strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
}

function Header() {
  const navigate = useNavigate();
  const session = useSession();

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
            <span className="Header-brand-subtitle">
              Budgetteren met digitale potjes
            </span>
          </div>
        </Link>

        <nav className="Header-actions">
          {session ? (
            <>
              <HeaderActionLink
                to="/account"
                variant="Header-link-primary"
                icon={UserRound}
                label="Profiel"
              />
              <HeaderActionButton
                onClick={handleLogout}
                variant="Header-link-secondary"
                icon={LogOut}
                label="Uitloggen"
              />
            </>
          ) : (
            <>
              <HeaderActionLink
                to="/login"
                variant="Header-link-secondary"
                icon={LogIn}
                label="Inloggen"
              />
              <HeaderActionLink
                to="/register"
                variant="Header-link-primary"
                icon={UserRoundPlus}
                label="Registreren"
              />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
