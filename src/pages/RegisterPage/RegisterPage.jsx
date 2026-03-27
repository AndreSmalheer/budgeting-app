import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import { registerAccount } from "../../services/api/client";
import { saveStoredSession } from "../../utils/authStorage";
import "../LoginPage/AuthPage.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    role: "child",
    email: "",
    REDACTED_PASSWORD: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    if (feedback) {
      setFeedback("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSubmitting(true);
    setFeedback("");

    try {
      const response = await registerAccount(formData);

      saveStoredSession({
        id: response.user.id,
        fullName: response.user.full_name,
        email: response.user.email,
        role: response.user.role,
      });

      navigate("/home-page");
    } catch (error) {
      setFeedback(error.message || "Registreren is niet gelukt.");
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
          <h1>Register</h1>
          <p className="AuthDescription">
            Maak een nieuw account aan in je eigen database. Deze pagina gebruikt nu de echte PHP
            backend en lokale MAMP database.
          </p>

          {feedback && <p className="AuthFeedback error">{feedback}</p>}

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
        </form>
      </main>
    </>
  );
}

export default RegisterPage;
