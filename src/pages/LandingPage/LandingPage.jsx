import { Link } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  return (
    <main className="LandingPage">
      <section className="LandingHero">
        <div className="LandingHero-copy">
          <p className="LandingHero-eyebrow">Budgetteren zonder bankgedoe</p>
          <h1>Beheer je potjes, houd overzicht en bouw slimme geldgewoontes op.</h1>
          <p>
            BudgetApp helpt jongeren en ouders om potjes en transacties simpel te
            volgen. Geen bankkoppelingen, wel duidelijk overzicht.
          </p>

          <div className="LandingHero-actions">
            <Link to="/register" className="LandingHero-button primary">
              Account maken
            </Link>
            <Link to="/login" className="LandingHero-button secondary">
              Inloggen
            </Link>
          </div>
        </div>

        <div className="LandingHero-card">
          <h2>Wat je meteen kunt doen</h2>
          <ul>
            <li>Potjes aanmaken voor sparen, school, kleding of uitgaven.</li>
            <li>Transacties toevoegen en direct zien waar je geld naartoe gaat.</li>
            <li>Op mobiel snel wisselen tussen potjes, transacties en profiel.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
