import { memo, useCallback, useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import BackBtn from "../../components/BackBtn/BackBtn";
import { useSession } from "../../hooks/useSession";
import { createPot } from "../../services/api/client";
import "./PotjeToevoegen.css";

const budgetIconNames = [
  "ShoppingCart",
  "Home",
  "Car",
  "BusFront",
  "TrainFront",
  "Bike",
  "Fuel",
  "Plane",
  "CreditCard",
  "ReceiptText",
  "Wallet",
  "Coins",
  "PiggyBank",
  "Landmark",
  "BriefcaseBusiness",
  "UtensilsCrossed",
  "Coffee",
  "Store",
  "Shirt",
  "Phone",
  "Laptop",
  "Wifi",
  "HeartPulse",
  "Dumbbell",
  "Film",
  "Music",
  "Gamepad2",
  "GraduationCap",
  "BookOpen",
  "Gift",
  "Camera",
  "Ticket",
  "Wrench",
  "Hammer",
  "ShieldCheck",
  "Palette",
  "Leaf",
  "Trees",
  "BedDouble",
  "CalendarDays",
  "MapPin",
  "Package",
  "ShoppingBag",
  "Milk",
  "Apple",
  "Utensils",
  "IndianRupee",
  "Euro",
  "DollarSign",
  "CircleDollarSign",
  "Banknote",
  "Barcode",
  "Calculator",
  "FileText",
  "FolderOpen",
  "PackageOpen",
  "Truck",
  "Building2",
  "House",
  "FerrisWheel",
  "Sofa",
  "CarFront",
  "Fuel",
  "Cable",
  "Monitor",
  "Watch",
  "Sparkles",
  "SunMedium",
  "MoonStar",
  "Shield",
  "BadgePercent",
  "Percent",
  "ChartNoAxesCombined",
  "ChartColumn",
  "LineChart",
  "PieChart",
  "HandCoins",
  "HandHeart",
  "HelpingHand",
  "ShoppingBasket",
  "Store",
  "Coins",
  "Receipt",
  "WalletCards",
  "Tag",
  "Tags",
  "NotebookTabs",
  "ListChecks",
  "TimerReset",
  "RefreshCw",
  "Repeat",
  "SlidersHorizontal",
  "CircleHelp",
];

const uniqueNames = [...new Set(budgetIconNames)];

const iconEntries = uniqueNames
  .filter((name) => Icons[name])
  .slice(0, 100)
  .map((name) => [name, Icons[name]]);

const IconOption = memo(function IconOption(props) {
  const { name, active, onSelect } = props;
  const IconComponent = props.Icon;

  return (
    <button
      type="button"
      className={`iconOption ${active ? "active" : ""}`}
      aria-label={`Kies icoon ${name}`}
      title={`Kies icoon ${name}`}
      onClick={() => onSelect(name)}
    >
      <IconComponent size={22} strokeWidth={2} />
    </button>
  );
});

export default function PotjeToevoegen({ onPotCreated }) {
  const navigate = useNavigate();
  const session = useSession();
  const [naam, setNaam] = useState("");
  const [doel, setDoel] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState("ShoppingCart");
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const doelNum = parseFloat(doel.replace(",", ".")) || 0;
  const canSubmit = naam.trim().length > 0 && doelNum > 0;

  const deferredSearch = useDeferredValue(search);

  const filteredIcons = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    if (!query) {
      return iconEntries;
    }

    return iconEntries.filter(([name]) => name.toLowerCase().includes(query));
  }, [deferredSearch]);

  const handleSelectIcon = useCallback((name) => {
    setSelectedIcon(name);
  }, []);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setFeedback("");

    try {
      await createPot({
        userId: session?.id,
        name: naam.trim(),
        icon: selectedIcon,
        amount: doelNum,
      });

      await onPotCreated?.();

      setNaam("");
      setDoel("");
      setSearch("");
      setSelectedIcon("ShoppingCart");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2800);
      navigate("/");
    } catch (error) {
      setFeedback(error.message || "Het potje kon niet worden aangemaakt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <BackBtn style={{ position: "absolute", left: "20px", top: "5px" }} />

      <div className="wrap">
        <div className="header section s1">
          <p className="eyebrow">Nieuw potje</p>
          <h1 className="title">Waar wil je dit budgetpotje voor gebruiken?</h1>
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
            <label className="label">Budget</label>
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
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
            style={{
              opacity: canSubmit && !isSubmitting ? 1 : 0.35,
              cursor: canSubmit && !isSubmitting ? "pointer" : "not-allowed",
            }}
          >
            {isSubmitting ? "Potje opslaan..." : "Potje aanmaken"}
          </button>
        </div>
      </div>

      {submitted && <div className="toast">Potje aangemaakt</div>}
    </div>
  );
}
