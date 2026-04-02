import { ChevronLeft } from "lucide-react";
import "./BackBtn.css";

function BackBtn({ style }) {
  return (
    <button
      className="backBtn"
      type="button"
      aria-label="Ga terug"
      style={style}
      onClick={() => window.history.back()}
    >
      <ChevronLeft size={22} strokeWidth={2.2} />
    </button>
  );
}

export default BackBtn;
