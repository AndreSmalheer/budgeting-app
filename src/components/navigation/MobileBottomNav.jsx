import { ArrowLeftRight, House, PiggyBank, UserRound } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useSession } from "../../hooks/useSession";
import "./MobileBottomNav.css";

function MobileBottomNav() {
  const session = useSession();
  const location = useLocation();

  const hasSession = Boolean(session);

  const items = [
    {
      label: "Home",
      icon: House,
      to: "/",
      isActive: location.pathname === "/" || location.pathname === "/home-page",
    },
    {
      label: "Potjes",
      icon: PiggyBank,
      to: hasSession ? "/see-all/potjes" : "/login",
      isActive:
        hasSession &&
        (location.pathname.startsWith("/see-all/potjes") ||
          location.pathname.startsWith("/budget-details") ||
          location.pathname.startsWith("/potje-toevoegen")),
    },
    {
      label: "Transacties",
      icon: ArrowLeftRight,
      to: hasSession ? "/see-all/transacties" : "/login",
      isActive: hasSession && location.pathname.startsWith("/see-all/transacties"),
    },
    {
      label: "Profiel",
      icon: UserRound,
      to: hasSession ? "/account" : "/login",
      isActive: hasSession && location.pathname.startsWith("/account"),
    },
  ];

  return (
    <nav className="MobileBottomNav" aria-label="Mobiele navigatie">
      <div className="MobileBottomNav__inner">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={`MobileBottomNav__item ${item.isActive ? "is-active" : ""}`}
            >
              <span className="MobileBottomNav__icon">
                <Icon size={20} strokeWidth={2.2} />
              </span>
              <span className="MobileBottomNav__label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
