import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import LandingPage from "../pages/LandingPage/LandingPage";
import StarterInhoud from "../pages/Starter-inhoud/Starter-inhoud";
import HomePage from "../pages/HomePage/HomePage";
import BudgetDetails from "../pages/BudgetDetails/BudgetDetails";
import PotjeToevoegen from "../pages/PotjeToevoegen/PotjeToevoegen";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import AccountPage from "../pages/AccountPage/AccountPage";
import { potjes as initialPotjes, transacties as initialTransacties } from "../config/data";

function AppRoutes() {
  const [potjes, setPotjes] = useState(initialPotjes);
  const [transacties, setTransacties] = useState(initialTransacties);
  const [loggedIn, setLoggedIn] = useState(false)

  return (
    <Routes>
      <Route
      path="/"
      element={loggedIn ? <HomePage potjes={potjes} transacties={transacties} /> : <LandingPage/>}
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/potje-toevoegen" element={<PotjeToevoegen setPotjes={setPotjes} />} />
      <Route path="/home-page" element={<HomePage potjes={potjes} transacties={transacties} />} />
      <Route path="/starter-inhoud" element={<StarterInhoud />} />
      <Route
        path="/budget-details/:id"
        element={
          <BudgetDetails
            setPotjes={setPotjes}
            potjes={potjes}
            transacties={transacties}
            setTransacties={setTransacties}
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;
