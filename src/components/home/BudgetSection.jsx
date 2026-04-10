import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Potjes from "../Potjes/Potjes";

function BudgetSection({ potjes }) {
  return (
    <div className="budget-container Mobile">
      <div className="budget-header">
        <h1 className="budget-title">Budget</h1>
        <Link to="/see-all/potjes" className="budget-see-all">
          Alles
        </Link>
      </div>

      <div className="budget-items">
        {potjes.map((potje) => {
          return (
            <Potjes
              key={potje.id}
              id={potje.id}
              name={potje.name}
              balance={Number(potje.currentBalance || 0)}
              icon={potje.icon}
            />
          );
        })}

        <Link
          to="/potje-toevoegen"
          className={`plus-icon ${potjes.length === 0 ? "plus-icon--no-items" : ""}`}
          aria-label="Nieuw potje toevoegen"
        >
          <Plus size={24} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

export default BudgetSection;
