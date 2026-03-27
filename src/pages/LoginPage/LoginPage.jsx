import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import { loginAccount } from "../../services/api/client";
import { saveStoredSession } from "../../utils/authStorage";
import "./AuthPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
      const response = await loginAccount(formData);

      saveStoredSession({
        id: response.user.id,
        fullName: response.user.full_name,
        email: response.user.email,
        role: response.user.role,
      });

      navigate("/home-page");
    } catch (error) {
      setFeedback(error.message || "Inloggen is niet gelukt.");
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
          <h1>Login</h1>
          <p className="AuthDescription">
            Log in met een account uit je eigen database. De frontend gebruikt nu de echte PHP
            backend en lokale MAMP database.
          </p>

          {feedback && <p className="AuthFeedback error">{feedback}</p>}

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
        </form>
      </main>
    </>
  );
}

export default LoginPage;
