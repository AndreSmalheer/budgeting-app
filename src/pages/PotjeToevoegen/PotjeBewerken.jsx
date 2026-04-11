import { useNavigate, useParams } from "react-router-dom";
import PotEditor from "../../components/Potjes/PotEditor";
import { useSession } from "../../hooks/useSession";
import { updatePot } from "../../services/api/client";

function PotjeBewerken({ potjes, onPotUpdated }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = useSession();
  const potje = potjes.find((item) => item.id === id);

  if (!potje) {
    return <p className="page-feedback">Potje niet gevonden.</p>;
  }

  async function handleSubmit(formData) {
    await updatePot(id, {
      userId: session?.id,
      ...formData,
    });

    await onPotUpdated?.();
    navigate(`/budget-details/${id}`);
  }

  return (
    <PotEditor
      initialValues={{
        name: potje.name,
        amount: String(potje.targetAmount),
        icon: potje.icon,
      }}
      eyebrow="Potje bewerken"
      title={`Werk ${potje.name} bij`}
      submitLabel="Potje opslaan"
      submittingLabel="Potje opslaan..."
      successMessage="Potje bijgewerkt"
      onSubmit={handleSubmit}
    />
  );
}

export default PotjeBewerken;
