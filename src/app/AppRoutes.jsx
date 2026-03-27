import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "../pages/LandingPage/LandingPage";
import StarterInhoud from "../pages/Starter-inhoud/Starter-inhoud";
import HomePage from "../pages/HomePage/HomePage";
import BudgetDetails from "../pages/BudgetDetails/BudgetDetails";
import PotjeToevoegen from "../pages/PotjeToevoegen/PotjeToevoegen";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import AccountPage from "../pages/AccountPage/AccountPage";
import SeeAllPage from "../pages/SeeAllPage/SeeAllPage";
import {
  potjes as initialPotjes,
  transacties as initialTransacties,
} from "../config/data";
import { getStoredSession } from "../utils/authStorage";
import { Navigate } from "react-router-dom";

function AppRoutes() {
  const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS === "true";

  const [potjes, setPotjes] = useState(initialPotjes);
  const [transacties, setTransacties] = useState(initialTransacties);
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getStoredSession()));

  function ProtectedRoute({ loggedIn, children }) {
    return loggedIn || DEV_BYPASS ? children : <Navigate to="/login" />;
  }

  function PublicRoute({ loggedIn, children }) {
    return !loggedIn ? children : <Navigate to="/" />;
  }

  useEffect(() => {
    function syncSession() {
      setLoggedIn(Boolean(getStoredSession()));
    }

    window.addEventListener("storage", syncSession);
    window.addEventListener("auth-changed", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("auth-changed", syncSession);
    };
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          loggedIn ? (
            <HomePage potjes={potjes} transacties={transacties} />
          ) : (
            <LandingPage />
          )
        }
      />

      {DEV_BYPASS && (
        <>
          <Route path="/home-page" element={<HomePage transacties={transacties} potjes={potjes} />} />
        </>
      )}

      <Route
        path="/see-all/transacties"
        element={
          <ProtectedRoute loggedIn={loggedIn}>
            <SeeAllPage type="transacties" potjes={potjes} transacties={transacties} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/see-all/potjes"
        element={
          <ProtectedRoute loggedIn={loggedIn}>
            <SeeAllPage type="potjes" potjes={potjes} transacties={transacties} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute loggedIn={loggedIn}>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute loggedIn={loggedIn}>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/account"
        element={
          <ProtectedRoute loggedIn={loggedIn}>
            <AccountPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/potje-toevoegen"
        element={
          <ProtectedRoute loggedIn={loggedIn}>
            <PotjeToevoegen setPotjes={setPotjes} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/starter-inhoud"
        element={
          <ProtectedRoute loggedIn={loggedIn}>
            <StarterInhoud />
          </ProtectedRoute>
        }
      />

      <Route
        path="/budget-details/:id"
        element={
          <ProtectedRoute loggedIn={loggedIn}>
            <BudgetDetails
              setPotjes={setPotjes}
              potjes={potjes}
              transacties={transacties}
              setTransacties={setTransacties}
            />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
