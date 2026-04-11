import { createElement, memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import BackBtn from "../BackBtn/BackBtn";
import ScrollToTop from "../ScrollToTop/ScrollToTop";
import { potIconEntries } from "../../config/potIcons";
import "./PotEditor.css";

const IconOption = memo(function IconOption({
  name,
  Icon: IconComponent,
  active,
  onSelect,
}) {
  return (
    <button
      type="button"
      className={`iconOption ${active ? "active" : ""}`}
      aria-label={`Kies icoon ${name}`}
      title={`Kies icoon ${name}`}
      onClick={() => onSelect(name)}
    >
      {createElement(IconComponent, { size: 22, strokeWidth: 2 })}
    </button>
  );
});

function PotEditor({
  initialValues,
  eyebrow,
  title,
  submitLabel,
  submittingLabel,
  successMessage,
  feedbackMessage = "",
  onSubmit,
}) {
  const [naam, setNaam] = useState(initialValues.name);
  const [doel, setDoel] = useState(initialValues.amount);
  const [selectedIcon, setSelectedIcon] = useState(initialValues.icon);
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(feedbackMessage);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setNaam(initialValues.name);
    setDoel(initialValues.amount);
    setSelectedIcon(initialValues.icon);
  }, [initialValues]);

  useEffect(() => {
    setFeedback(feedbackMessage);
  }, [feedbackMessage]);

  const deferredSearch = useDeferredValue(search);
  const doelNum = parseFloat(String(doel).replace(",", ".")) || 0;
  const canSubmit = naam.trim().length > 0 && doelNum > 0 && !isSubmitting;

  const filteredIcons = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    if (!query) {
      return potIconEntries;
    }

    return potIconEntries.filter(([name]) => name.toLowerCase().includes(query));
  }, [deferredSearch]);

  const handleSelectIcon = useCallback((name) => {
    setSelectedIcon(name);
  }, []);

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      await onSubmit({
        name: naam.trim(),
        amount: doelNum,
        icon: selectedIcon,
      });
      setSubmitted(true);
      window.setTimeout(() => setSubmitted(false), 2800);
    } catch (error) {
      setFeedback(error.message || "Opslaan mislukt.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <ScrollToTop />
      <BackBtn style={{ position: "absolute", left: "20px", top: "5px" }} />

      <div className="wrap">
        <div className="header section s1">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="title">{title}</h1>
        </div>

        <div className="fields section s2">
          {feedback && <p className="empty-state">{feedback}</p>}

          <div className="fieldWrap">
            <label className="label">Naam</label>
            <input
              className={`input ${focused === "naam" ? "focus" : ""}`}
              placeholder="Bijvoorbeeld boodschappen"
              value={naam}
              onChange={(event) => setNaam(event.target.value)}
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
                onChange={(event) => setDoel(event.target.value)}
                onFocus={() => setFocused("doel")}
                onBlur={() => setFocused(null)}
              />
            </div>
            <p className="goalHint">
              Je begint op €0 en spaart stap voor stap naar dit doel toe.
            </p>
          </div>

          <div className="fieldWrap">
            <label className="label">Icoon</label>

            <input
              className="input"
              placeholder="Zoek een icoon..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoComplete="off"
              spellCheck="false"
              style={{ marginBottom: "10px" }}
            />

            <div className="iconPicker">
              {filteredIcons.map(([name, IconComponent]) => (
                <IconOption
                  key={name}
                  name={name}
                  Icon={IconComponent}
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
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </div>

      {submitted && <div className="toast">{successMessage}</div>}
    </div>
  );
}

export default PotEditor;
