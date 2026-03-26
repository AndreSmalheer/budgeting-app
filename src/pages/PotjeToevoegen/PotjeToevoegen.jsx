import { useState } from "react";
import * as Icons from "lucide-react";
import "./PotjeToevoegen.css";
import BackBtn from "../../components/BackBtn/BackBtn";

const iconEntries = Object.entries(Icons).filter(([name]) => {
  return (
    name !== "Icon" &&
    name !== "DynamicIcon" &&
    name !== "createLucideIcon" &&
    /^[A-Z]/.test(name)
  );
});

export default function PotjeToevoegen({ setPotjes }) {
  const [naam, setNaam] = useState("");
  const [doel, setDoel] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState("ShoppingCart");
  const [search, setSearch] = useState("");

  const doelNum = parseFloat(doel.replace(",", ".")) || 0;
  const canSubmit = naam.trim().length > 0 && doelNum > 0;

  const filteredIcons = iconEntries.filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!canSubmit) return;

    const newPotje = {
      id: Date.now().toString(),
      name: naam.trim(),
      budget: doelNum,
      icon: selectedIcon,
    };

    setPotjes((prev) => [newPotje, ...prev]);

    setNaam("");
    setDoel("");
    setSelectedIcon("ShoppingCart");

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2800);
  };

  return (
    <div className="page">
      <BackBtn style={{ position: "absolute", left: "20px", top: "5px" }} />

      <div className="wrap">
        <div className="header section s1">
          <p className="eyebrow">Nieuw budget</p>
          <h1 className="title">Waar wil je je budget voor gebruiken?</h1>
        </div>

        <div className="fields section s2">
          {/* NAME */}
          <div className="fieldWrap">
            <label className="label">Naam</label>
            <input
              className={`input ${focused === "naam" ? "focus" : ""}`}
              placeholder="bijv. Boodschappen"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              onFocus={() => setFocused("naam")}
              onBlur={() => setFocused(null)}
            />
          </div>

          {/* BUDGET */}
          <div className="fieldWrap">
            <label className="label">Budget</label>
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

          {/* ICON PICKER */}
          <div className="fieldWrap">
            <label className="label">Icoon</label>

            {/* SEARCH */}
            <input
              className="input"
              placeholder="Zoek icoon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: "10px" }}
            />

            <div className="iconPicker">
              {filteredIcons.map(([name, Icon]) => (
                <button
                  key={name}
                  type="button"
                  className={`iconOption ${selectedIcon === name ? "active" : ""}`}
                  onClick={() => setSelectedIcon(name)}
                >
                  <Icon size={22} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SUBMIT */}
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
        </div>
      </div>

      {submitted && <div className="toast">✓ {naam} aangemaakt</div>}
    </div>
  );
}
