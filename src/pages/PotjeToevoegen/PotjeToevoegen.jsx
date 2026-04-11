import { useNavigate } from "react-router-dom";
import PotEditor from "../../components/Potjes/PotEditor";
import { useSession } from "../../hooks/useSession";
import { createPot } from "../../services/api/client";

export default function PotjeToevoegen({ onPotCreated }) {
  const navigate = useNavigate();
  const session = useSession();

  async function handleSubmit(formData) {
    await createPot({
      userId: session?.id,
      ...formData,
    });

    await onPotCreated?.();
    navigate("/");
  }

  return (
    <PotEditor
      initialValues={{
        name: "",
        amount: "",
        icon: "ShoppingCart",
      }}
      eyebrow="Nieuw doelpotje"
      title="Waar wil je voor sparen met dit doelpotje?"
      submitLabel="Doelpotje aanmaken"
      submittingLabel="Doelpotje opslaan..."
      successMessage="Doelpotje aangemaakt"
      onSubmit={handleSubmit}
    />
  );
}
