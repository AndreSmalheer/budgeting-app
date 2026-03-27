import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
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

function ProtectedRoute({ children, isAllowed }) {
  const location = useLocation();

  return isAllowed ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}

function PublicRoute({ children, isLoggedIn }) {
  const location = useLocation();
  const redirectTarget = location.state?.from?.pathname || "/";

  return !isLoggedIn ? children : <Navigate to={redirectTarget} replace />;
}

function AppRoutes() {
  const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS === "true";

  const [potjes, setPotjes] = useState(initialPotjes);
  const [transacties, setTransacties] = useState(initialTransacties);
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getStoredSession()));

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

  const canAccessProtectedRoutes = loggedIn || DEV_BYPASS;

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
        <Route
          path="/home-page"
          element={<HomePage transacties={transacties} potjes={potjes} />}
        />
      )}

      <Route
        path="/see-all/transacties"
        element={
          <ProtectedRoute isAllowed={canAccessProtectedRoutes}>
            <SeeAllPage
              type="transacties"
              potjes={potjes}
              transacties={transacties}
              setPotjes={setPotjes}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/see-all/potjes"
        element={
          <ProtectedRoute isAllowed={canAccessProtectedRoutes}>
            <SeeAllPage
              type="potjes"
              potjes={potjes}
              transacties={transacties}
              setPotjes={setPotjes}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute isLoggedIn={loggedIn}>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute isLoggedIn={loggedIn}>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/account"
        element={
          <ProtectedRoute isAllowed={canAccessProtectedRoutes}>
            <AccountPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/potje-toevoegen"
        element={
          <ProtectedRoute isAllowed={canAccessProtectedRoutes}>
            <PotjeToevoegen setPotjes={setPotjes} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/starter-inhoud"
        element={
          <ProtectedRoute isAllowed={canAccessProtectedRoutes}>
            <StarterInhoud />
          </ProtectedRoute>
        }
      />

      <Route
        path="/budget-details/:id"
        element={
          <ProtectedRoute isAllowed={canAccessProtectedRoutes}>
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
