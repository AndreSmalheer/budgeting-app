import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Potjes from "../Potjes/Potjes";

function BudgetSection({ potjes }) {
  const sortedPotjes = [...potjes].sort(
    (a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0)
  );

  return (
    <div className="budget-container Mobile">
      <div className="budget-header">
        <h1 className="budget-title">Doelpotjes</h1>
        <Link to="/see-all/potjes" className="budget-see-all">
          Alles
        </Link>
      </div>

      <div className="budget-items">
        {sortedPotjes.map((potje) => {
          return (
            <Potjes
              key={potje.id}
              id={potje.id}
              name={potje.name}
              balance={Number(potje.currentBalance || 0)}
              targetAmount={Number(potje.targetAmount || 0)}
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
