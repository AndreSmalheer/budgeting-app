import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Potjes from "../Potjes/Potjes";

function BudgetSection({ potjes, transacties }) {
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
          const spent = transacties
            .filter(
              (transaction) =>
                transaction.potjeId === potje.id && transaction.type === "expense",
            )
            .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

          const progress = potje.budget
            ? Math.min((spent / potje.budget) * 100, 100)
            : 0;

          return (
            <Potjes
              key={potje.id}
              id={potje.id}
              name={potje.name}
              budget={potje.budget}
              spent={spent}
              progress={progress}
              icon={potje.icon}
            />
          );
        })}

        <Link
          to="/potje-toevoegen"
          className="plus-icon"
          aria-label="Nieuw potje toevoegen"
        >
          <Plus size={24} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

export default BudgetSection;
