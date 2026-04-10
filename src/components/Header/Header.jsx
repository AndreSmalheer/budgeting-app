import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";
import appConfig from "../../config/appConfig";
import { useSession } from "../../hooks/useSession";
import "./Header.css";

function HeaderActionLink({ to, label }) {
  return (
    <Link className="Header-profileBtn" to={to}>
      <UserRound size={16} strokeWidth={2.2} />
      <span>{label}</span>
    </Link>
  );
}

function Header() {
  const session = useSession();

  return (
    <header className="Header-shell">
      <div className="Header">
        <Link className="Header-brand" to="/">
          <img className="Header-logo" src="/icon-512.png" alt="BudgetApp logo" />

          <div className="Header-brand-copy">
            <span className="Header-brand-title">{appConfig.appName}</span>
            <span className="Header-brand-subtitle">
              Budgetteren met digitale potjes
            </span>
          </div>
        </Link>

        <nav className="Header-actions">
          <HeaderActionLink to={session ? "/account" : "/login"} label="Profiel" />
        </nav>
      </div>
    </header>
  );
}

export default Header;
