import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import { loginAccount } from "../../services/api/client";
import { saveStoredSession } from "../../utils/authStorage";
import "./AuthPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    REDACTED_PASSWORD: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const redirectTarget = location.state?.from?.pathname || "/";

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

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
    <>
      <Header />

      <main className="AuthPage">
        <form className="AuthCard" onSubmit={handleSubmit}>
          <p className="AuthEyebrow">Inloggen op je account</p>
          <h1>Inloggen</h1>
          <p className="AuthDescription">
            Log in met je account om verder te gaan waar je was gebleven.
          </p>

          {feedback.message && (
            <p className={`AuthFeedback ${feedback.type}`}>{feedback.message}</p>
          )}

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
              name="REDACTED_PASSWORD"
              type="REDACTED_PASSWORD"
              placeholder="Voer je wachtwoord in"
              value={formData.REDACTED_PASSWORD}
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
        </form>
      </main>
    </>
  );
}

export default LoginPage;
