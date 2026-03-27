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

  return (
    <>
      <Header />

      <main className="AccountPage">
        <section className="AccountCard">
          <p className="AccountEyebrow">Jouw profiel</p>
          <h1>Accountgegevens</h1>

          {session ? (
            <div className="AccountInfo">
              <p>
                <strong>Naam:</strong> {session.fullName || "Nog niet ingesteld"}
              </p>
              <p>
                <strong>E-mail:</strong> {session.email}
              </p>
              <p>
                <strong>Rol:</strong> {roleLabel}
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
