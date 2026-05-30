import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import AuthPageLayout from "../../components/auth/AuthPageLayout";
import { loginAccount } from "../../services/api/client";
import { saveStoredSession } from "../../utils/authStorage";
import "./AuthPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
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
      const response = await loginAccount(formData);

      saveStoredSession({
        id: response.user.id,
        fullName: response.user.fullName,
        email: response.user.email,
        role: response.user.role,
      });

      setFeedback({
        type: "success",
        message: "Je bent ingelogd. Je wordt doorgestuurd...",
      });

      navigate(redirectTarget, { replace: true });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Inloggen is niet gelukt. Probeer het opnieuw.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageLayout>
      <AuthCard
        eyebrow="Inloggen op je account"
        title="Inloggen"
        description="Log in met je account om verder te gaan waar je was gebleven."
        feedback={feedback}
        onSubmit={handleSubmit}
      >
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
            placeholder="Voer je wachtwoord in"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>

        <button className="AuthButton" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Bezig met inloggen..." : "Inloggen"}
        </button>

        <p className="AuthSwitch">
          Nog geen account? <Link to="/register">Maak er een aan</Link>
        </p>
      </AuthCard>
    </AuthPageLayout>
  );
}

export default LoginPage;
