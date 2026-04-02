import Header from "../../components/Header/Header";
import { getStoredSession } from "../../utils/authStorage";
import "./AccountPage.css";

function AccountPage() {
  const session = getStoredSession();
  const roleLabel =
    session?.role === "parent"
      ? "Ouder"
      : session?.role === "child"
        ? "Kind"
        : "Nog niet ingesteld";

  const initials = session?.fullName
    ? session.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <>
      <Header />
      <main className="AccountPage">
        <div className="AccountPage__bg" aria-hidden="true">
          <div className="AccountPage__blob AccountPage__blob--1" />
          <div className="AccountPage__blob AccountPage__blob--2" />
        </div>

        <section className="AccountCard">
          {session ? (
            <>
              <div className="AccountCard__hero">
                <div className="AccountAvatar">
                  <span className="AccountAvatar__initials">{initials}</span>
                  <div className="AccountAvatar__ring" aria-hidden="true" />
                </div>
                <div className="AccountCard__heroText">
                  <p className="AccountCard__eyebrow">Jouw profiel</p>
                  <h1 className="AccountCard__name">
                    {session.fullName || "Nog niet ingesteld"}
                  </h1>
                  <span className="AccountRoleBadge">{roleLabel}</span>
                </div>
              </div>

              <div className="AccountDivider" aria-hidden="true" />

              <ul className="AccountInfo" role="list">
                <li className="AccountInfo__row">
                  <span className="AccountInfo__icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <div className="AccountInfo__content">
                    <span className="AccountInfo__label">Naam</span>
                    <span className="AccountInfo__value">{session.fullName || "Nog niet ingesteld"}</span>
                  </div>
                </li>

                <li className="AccountInfo__row">
                  <span className="AccountInfo__icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <div className="AccountInfo__content">
                    <span className="AccountInfo__label">E-mailadres</span>
                    <span className="AccountInfo__value">{session.email}</span>
                  </div>
                </li>

                <li className="AccountInfo__row">
                  <span className="AccountInfo__icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 1-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </span>
                  <div className="AccountInfo__content">
                    <span className="AccountInfo__label">Rol</span>
                    <span className="AccountInfo__value">{roleLabel}</span>
                  </div>
                </li>
              </ul>
            </>
          ) : (
            <div className="AccountEmpty">
              <div className="AccountEmpty__icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5"/>
                  <path d="M3 21a9 9 0 0 1 18 0"/>
                </svg>
              </div>
              <p>Je bent nog niet ingelogd.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default AccountPage;
