import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../hooks/useSession";
import { getScheduledTransactions } from "../../services/api/client";
import { clearStoredSession } from "../../utils/authStorage";
import { formatCurrency } from "../../utils/formatters";
import { X, User, Mail, Calendar, LogOut, ChevronRight } from "lucide-react";
import "./AccountPage.css";

function AccountPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [scheduledTotal, setScheduledTotal] = useState(0);

  const initials = session?.fullName
    ? session.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const loadScheduledTransactions = useCallback(async () => {
    if (!session?.id) return;

    try {
      const response = await getScheduledTransactions(session.id);
      const schedules = response.scheduledTransactions || [];

      const total = schedules.reduce((acc, s) => {
        if (!s.isActive) return acc;

        let monthlyAmount = s.amount;
        if (s.recurrence === "daily") {
          monthlyAmount = s.amount * 30;
        }

        return s.type === "expense" ? acc + monthlyAmount : acc - monthlyAmount;
      }, 0);

      setScheduledTotal(total);
    } catch (error) {
      console.error("Failed to load scheduled transactions:", error);
    }
  }, [session?.id]);

  useEffect(() => {
    loadScheduledTransactions();
  }, [loadScheduledTransactions]);

  function handleLogout() {
    clearStoredSession();
    navigate("/login");
  }

  return (
    <main className="AccountPage">
      <div className="AccountPage__container">
        {/* Top Navigation Bar with X Close Button */}
        <div className="AccountPage__topbar">
          <button
            className="AccountPage__closeBtn"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Sluiten"
          >
            <X size={22} />
          </button>
        </div>

        {session ? (
          <>
            {/* Hero Profile Header */}
            <div className="AccountHero">
              <div className="AccountAvatar">
                <span className="AccountAvatar__initials">{initials}</span>
              </div>
              <h1 className="AccountHero__name">
                {session.fullName || "Nog niet ingesteld"}
              </h1>
              <p className="AccountHero__handle">{session.email}</p>
            </div>

            {/* Stacked Full-Width Card: Account gegevens */}
            <div className="AccountCardBlock">
              <div className="AccountCardBlock__header">
                <span className="AccountCardBlock__label">
                  Account gegevens
                </span>
              </div>
              <ul className="AccountList" role="list">
                <li className="AccountListItem">
                  <span className="AccountListItem__icon">
                    <User size={18} />
                  </span>
                  <div className="AccountListItem__content">
                    <span className="AccountListItem__label">Naam</span>
                    <span className="AccountListItem__value">
                      {session.fullName || "Nog niet ingesteld"}
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="AccountListItem__chevron"
                  />
                </li>

                <li className="AccountListItem">
                  <span className="AccountListItem__icon">
                    <Mail size={18} />
                  </span>
                  <div className="AccountListItem__content">
                    <span className="AccountListItem__label">E-mailadres</span>
                    <span className="AccountListItem__value">
                      {session.email}
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="AccountListItem__chevron"
                  />
                </li>
              </ul>
            </div>

            {/* Stacked Full-Width Card: Vaste uitgaven */}
            <div className="AccountCardBlock">
              <div className="AccountCardBlock__header">
                <span className="AccountCardBlock__label">
                  Maandelijkse vaste lasten
                </span>
              </div>
              <div className="AccountCardBlock__content">
                <div className="AccountStatRow">
                  <div className="AccountStatRow__icon">
                    <Calendar size={22} />
                  </div>
                  <div className="AccountStatRow__info">
                    <strong className="AccountStatRow__value">
                      {formatCurrency(Math.abs(scheduledTotal))}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Stacked Full-Width Card: Logout Action */}
            <div className="AccountCardBlock">
              <button
                className="AccountLogoutRow"
                type="button"
                onClick={handleLogout}
              >
                <span className="AccountLogoutRow__icon">
                  <LogOut size={18} />
                </span>
                <span className="AccountLogoutRow__label">Uitloggen</span>
                <ChevronRight size={16} className="AccountListItem__chevron" />
              </button>
            </div>
          </>
        ) : (
          <div className="AccountEmpty">
            <div className="AccountEmpty__icon" aria-hidden="true">
              <User size={32} />
            </div>
            <p>Je bent nog niet ingelogd.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default AccountPage;
