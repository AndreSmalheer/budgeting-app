import Header from "../../components/Header/Header";
import { getStoredSession } from "../../utils/authStorage";
import "./AccountPage.css";

function AccountPage() {
  const session = getStoredSession();

  return (
    <>
      <Header />

      <main className="AccountPage">
        <section className="AccountCard">
          <p className="AccountEyebrow">Placeholder account page</p>
          <h1>Account</h1>

          {session ? (
            <div className="AccountInfo">
              <p>
                <strong>Naam:</strong> {session.fullName || "Nog niet ingesteld"}
              </p>
              <p>
                <strong>E-mail:</strong> {session.email}
              </p>
              <p>
                <strong>Rol:</strong> {session.role}
              </p>
            </div>
          ) : (
            <p className="AccountEmpty">Je bent nog niet ingelogd.</p>
          )}
        </section>
      </main>
    </>
  );
}

export default AccountPage;
