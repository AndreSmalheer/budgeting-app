import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import { getApiHealth, getDatabaseStatus } from "../../services/api/client";
import "./LandingPage.css";

function LandingPage() {
  const [connectionStatus, setConnectionStatus] = useState({
    type: "loading",
    title: "Backend controleren...",
    message: "De app probeert te verbinden met de nieuwe Node en MongoDB backend.",
  });

  useEffect(() => {
    async function checkConnections() {
      try {
        await getApiHealth();

        try {
          const databaseStatus = await getDatabaseStatus();

          setConnectionStatus({
            type: "success",
            title: "MongoDB verbonden",
            message: `De backend en database zijn bereikbaar. Database: ${databaseStatus.databaseName || "onbekend"}.`,
          });
        } catch (error) {
          setConnectionStatus({
            type: "error",
            title: "Backend werkt, MongoDB nog niet",
            message: error.message || "De backend reageert wel, maar de databaseverbinding lukt nog niet.",
          });
        }
      } catch {
        setConnectionStatus({
          type: "error",
          title: "Geen verbinding met de backend",
          message: "Start eerst de nieuwe backend met Node en vul daarna je MongoDB .env in.",
        });
      }
    }

    checkConnections();
  }, []);

  return (
    <>
      <Header />

      <main className="LandingPage">
        <section className="LandingHero">
          <div className="LandingHero-copy">
            <div className={`ConnectionStatus ${connectionStatus.type}`}>
              <p className="ConnectionStatus-title">{connectionStatus.title}</p>
              <p className="ConnectionStatus-message">
                {connectionStatus.message}
              </p>
            </div>

            <p className="LandingHero-eyebrow">Voor jongeren en ouders</p>
            <h1>Grip op geld met digitale potjes</h1>
            <p>
              Houd budgetten overzichtelijk, spaar voor doelen en laat ouders meekijken bij
              grotere opnames. Simpel, duidelijk en mobiel gericht.
            </p>

            <div className="LandingHero-actions">
              <Link className="LandingHero-button primary" to="/register">
                Maak een account
              </Link>
              <Link className="LandingHero-button secondary" to="/login">
                Ik heb al een account
              </Link>
            </div>
          </div>

          <div className="LandingHero-card">
            <h2>Wat we eerst bouwen</h2>
            <ul>
              <li>Registreren en inloggen</li>
              <li>Ouder- en kindaccounts</li>
              <li>Potjes met saldo en transacties</li>
              <li>Goedkeuring voor opnames boven 40 euro</li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}

export default LandingPage;
