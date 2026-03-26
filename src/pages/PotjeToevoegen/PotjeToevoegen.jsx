import { useState, useMemo, useDeferredValue, memo, useCallback } from "react";
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

const IconOption = memo(function IconOption({ name, Icon, active, onSelect }) {
  return (
    <button
      type="button"
      className={`iconOption ${active ? "active" : ""}`}
      onClick={() => onSelect(name)}
    >
      <Icon size={22} />
      <span>{name}</span>
    </button>
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

  const deferredSearch = useDeferredValue(search);

  const filteredIcons = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    if (!query) {
      return iconEntries;
    }

    return iconEntries.filter(([name]) =>
      name.toLowerCase().includes(query)
    );
  }, [deferredSearch]);

  const handleSelectIcon = useCallback((name) => {
    setSelectedIcon(name);
  }, []);

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
    setSearch("");
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

          <div className="fieldWrap">
            <label className="label">Icoon</label>

            <input
              className="input"
              placeholder="Zoek icoon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              spellCheck="false"
              style={{ marginBottom: "10px" }}
            />

            <div className="iconPicker">
              {filteredIcons.map(([name, Icon]) => (
                <IconOption
                  key={name}
                  name={name}
                  Icon={Icon}
                  active={selectedIcon === name}
                  onSelect={handleSelectIcon}
                />
              ))}
            </div>
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
        </div>
      </div>

      {submitted && <div className="toast">✓ {naam} aangemaakt</div>}
    </div>
  );
}
