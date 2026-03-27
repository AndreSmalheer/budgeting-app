import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import LandingPage from "../pages/LandingPage/LandingPage";
import StarterInhoud from "../pages/Starter-inhoud/Starter-inhoud";
import HomePage from "../pages/HomePage/HomePage";
import BudgetDetails from "../pages/BudgetDetails/BudgetDetails";
import PotjeToevogen from "../pages/PotjeToevoegen/PotjeToevoegen";
import { potjes as initialPotjes, transacties as initialTransacties } from "../config/data"


function AppRoutes() {
    const [potjes, setPotjes] = useState(initialPotjes);
    const [transacties, setTransacties] = useState(initialTransacties);
    const [loggedIn, setLoggedIn] = useState(true)

  return (
    <Routes>
        <Route
        path="/"
        element={loggedIn ? <HomePage potjes={potjes} transacties={transacties} /> : <StarterInhoud />}
        />

        <Route path="/potje-toevoegen" element={<PotjeToevogen setPotjes={setPotjes}/>} />

        <Route path="/home-page" element={<HomePage potjes={potjes} transacties={transacties} />} />

        <Route path="/starter-inhoud" element={<StarterInhoud />} />

        <Route path="/budget-details/:id"  element={<BudgetDetails potjes={potjes} transacties={transacties} setTransacties={setTransacties}/>} />

    </Routes>
  );
}

export default AppRoutes;
