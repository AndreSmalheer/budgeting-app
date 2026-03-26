import { Route, Routes } from "react-router-dom";
import LandingPage from "../pages/LandingPage/LandingPage";
import StarterInhoud from "../pages/Starter-inhoud/Starter-inhoud";
import HomePage from "../pages/HomePage/HomePage";
import BudgetDetails from "../pages/BudgetDetails/BudgetDetails";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home-page" element={<HomePage />} />
      <Route path="/starter-inhoud" element={<StarterInhoud />} />
      <Route path="/budget-details" element={<BudgetDetails/>} />
    </Routes>
  );
}

export default AppRoutes;
