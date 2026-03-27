import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
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
    <>
      <Header />

      <main className="AuthPage">
        <form className="AuthCard" onSubmit={handleSubmit}>
          <p className="AuthEyebrow">Nieuw account maken</p>
          <h1>Registreren</h1>
          <p className="AuthDescription">
            Maak een account aan en start direct met budgetteren.
          </p>

          {feedback.message && (
            <p className={`AuthFeedback ${feedback.type}`}>{feedback.message}</p>
          )}

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
              name="REDACTED_PASSWORD"
              type="REDACTED_PASSWORD"
              placeholder="Maak een wachtwoord"
              value={formData.REDACTED_PASSWORD}
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
        </form>
      </main>
    </>
  );
}

export default RegisterPage;
