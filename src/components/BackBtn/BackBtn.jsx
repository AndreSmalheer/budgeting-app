import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import "./BackBtn.css";

function BackBtn({ style }) {
  const navigate = useNavigate();

  return (
    <button
      className="backBtn"
      type="button"
      aria-label="Ga naar home"
      style={style}
      onClick={() => navigate("/")}
    >
      <ChevronLeft size={22} strokeWidth={2.2} />
    </button>
  );
}

export default BackBtn;
