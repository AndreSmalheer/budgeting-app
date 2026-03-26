import { useState } from "react";
import "./PotjeToevoegen.css";

export default function PotjeToevoegen() {
  const [naam, setNaam] = useState("");
  const [doel, setDoel] = useState("");
  const [huidig, setHuidig] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(null);

  const doelNum = parseFloat(doel.replace(",", ".")) || 0;
  const huidigNum = parseFloat(huidig.replace(",", ".")) || 0;
  const pct = doelNum > 0 ? Math.min((huidigNum / doelNum) * 100, 100) : 0;
  const canSubmit = naam.trim().length > 0 && doelNum > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2800);
  };

  return (
    <div className="page">
      <div className="wrap">
        <div className="header section s1">
          <p className="eyebrow">Nieuw spaarpotje</p>
          <h1 className="title">Wat spaar je voor?</h1>
        </div>

        <div className="fields section s2">
          <div className="fieldWrap">
            <label className="label">Naam</label>
            <input
              className={`input ${focused === "naam" ? "focus" : ""}`}
              placeholder="bijv. Vakantie Italië"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              onFocus={() => setFocused("naam")}
              onBlur={() => setFocused(null)}
            />
          </div>

          <div className="fieldWrap">
            <label className="label">Doelbedrag</label>
            <div className="prefixWrap">
              <span className="prefix">€</span>
              <input
                className={`input withPrefix ${focused === "doel" ? "focus" : ""}`}
                placeholder="1.500"
                inputMode="decimal"
                value={doel}
                onChange={(e) => setDoel(e.target.value)}
                onFocus={() => setFocused("doel")}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>

          <div className="fieldWrap">
            <label className="label row">
              <span>Al gespaard</span>
              <span className="optional">optioneel</span>
            </label>
            <div className="prefixWrap">
              <span className="prefix">€</span>
              <input
                className={`input withPrefix ${focused === "huidig" ? "focus" : ""}`}
                placeholder="0"
                inputMode="decimal"
                value={huidig}
                onChange={(e) => setHuidig(e.target.value)}
                onFocus={() => setFocused("huidig")}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>

          <button className="backBtn" onClick={() => window.history.back()}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div
          className="progress section s3"
          style={{
            opacity: doelNum > 0 ? 1 : 0,
            transform: doelNum > 0 ? "translateY(0)" : "translateY(4px)",
            pointerEvents: doelNum > 0 ? "auto" : "none",
          }}
        >
          <div className="progressMeta">
            <span className="progressLabel">Voortgang</span>
            <span className="progressPct">{Math.round(pct)}%</span>
          </div>
          <div className="track">
            <div className="fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="section s4">
          <button
            className="btn"
            disabled={!canSubmit}
            onClick={handleSubmit}
            style={{
              opacity: canSubmit ? 1 : 0.35,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            Aanmaken
          </button>

          {!canSubmit && (naam || doel) && (
            <p className="hint">
              {!naam.trim()
                ? "Geef je potje een naam"
                : "Vul een doelbedrag in"}
            </p>
          )}
        </div>
      </div>

      {submitted && <div className="toast">✓ {naam} aangemaakt</div>}
    </div>
  );
}
