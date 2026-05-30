import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import AuthPageLayout from "../../components/auth/AuthPageLayout";
import { registerAccount } from "../../services/api/client";
import { saveStoredSession } from "../../utils/authStorage";
import "../LoginPage/AuthPage.css";

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    fullName: "",
    role: "child",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const redirectTarget = location.state?.from?.pathname || "/";

  function handleChange(event) {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));

    if (feedback.message) {
      setFeedback({ type: "", message: "" });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const response = await registerAccount(formData);

      saveStoredSession({
        id: response.user.id,
        fullName: response.user.fullName,
        email: response.user.email,
        role: response.user.role,
      });

      setFeedback({
        type: "success",
        message: "Je account is aangemaakt. Je wordt doorgestuurd...",
      });

      navigate(redirectTarget, { replace: true });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.message || "Account aanmaken is niet gelukt. Probeer het opnieuw.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageLayout>
      <AuthCard
        eyebrow="Nieuw account maken"
        title="Registreren"
        description="Maak een account aan en start direct met budgetteren."
        feedback={feedback}
        onSubmit={handleSubmit}
      >
        <label className="AuthField">
          <span>Volledige naam</span>
          <input
            name="fullName"
            type="text"
            placeholder="Bijvoorbeeld Adam Saber"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </label>

        <label className="AuthField">
          <span>Rol</span>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="child">Kind</option>
            <option value="parent">Ouder</option>
          </select>
        </label>

        <label className="AuthField">
          <span>E-mail</span>
          <input
            name="email"
            type="email"
            placeholder="naam@email.nl"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label className="AuthField">
          <span>Wachtwoord</span>
          <input
            name="password"
            type="password"
            placeholder="Maak een wachtwoord"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>

        <button className="AuthButton" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Account wordt aangemaakt..." : "Account maken"}
        </button>

        <p className="AuthSwitch">
          Heb je al een account? <Link to="/login">Log dan in</Link>
        </p>
      </AuthCard>
    </AuthPageLayout>
  );
}

export default RegisterPage;
