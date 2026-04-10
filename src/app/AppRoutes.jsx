import { useCallback, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { ProtectedRoute, PublicRoute } from "../components/routes/RouteGuards";
import { useSession } from "../hooks/useSession";
import LandingPage from "../pages/LandingPage/LandingPage";
import StarterInhoud from "../pages/Starter-inhoud/Starter-inhoud";
import HomePage from "../pages/HomePage/HomePage";
import BudgetDetails from "../pages/BudgetDetails/BudgetDetails";
import PotjeToevoegen from "../pages/PotjeToevoegen/PotjeToevoegen";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import AccountPage from "../pages/AccountPage/AccountPage";
import SeeAllPage from "../pages/SeeAllPage/SeeAllPage";
import { getPots, getTransactions } from "../services/api/client";

function AppRoutes() {
  const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS === "true";
  const session = useSession();
  const loggedIn = Boolean(session);
  const [potjes, setPotjes] = useState([]);
  const [transacties, setTransacties] = useState([]);
  const [isBudgetLoading, setIsBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState("");

  const canAccessProtectedRoutes = loggedIn || DEV_BYPASS;

  const loadBudgetData = useCallback(async () => {
    if (!session?.id) {
      setPotjes([]);
      setTransacties([]);
      setBudgetError("");
      setIsBudgetLoading(false);
      return;
    }

    setIsBudgetLoading(true);
    setBudgetError("");

    try {
      const [potsResponse, transactionsResponse] = await Promise.all([
        getPots(session.id),
        getTransactions(session.id),
      ]);

      setPotjes(potsResponse.pots || []);
      setTransacties(transactionsResponse.transactions || []);
    } catch (error) {
      setBudgetError(error.message || "De budgetgegevens konden niet geladen worden.");
    } finally {
      setIsBudgetLoading(false);
    }
  }, [session?.id]);

  useEffect(() => {
    loadBudgetData();
  }, [loadBudgetData]);

  function withAppShell(element) {
    return <AppShell>{element}</AppShell>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          loggedIn ? (
            withAppShell(
              <HomePage
                potjes={potjes}
                transacties={transacties}
                isLoading={isBudgetLoading}
                errorMessage={budgetError}
              />,
            )
          ) : (
            withAppShell(<LandingPage />)
          )
        }
      />

      {DEV_BYPASS && (
        <Route
          path="/home-page"
          element={
            withAppShell(
              <HomePage
                transacties={transacties}
                potjes={potjes}
                isLoading={isBudgetLoading}
                errorMessage={budgetError}
              />,
            )
          }
        />
      )}

      <Route
        path="/see-all/transacties"
        element={
          <ProtectedRoute isAllowed={canAccessProtectedRoutes}>
            {withAppShell(
              <SeeAllPage
                type="transacties"
                potjes={potjes}
                transacties={transacties}
                isLoading={isBudgetLoading}
                errorMessage={budgetError}
                onPotDeleted={loadBudgetData}
              />,
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/see-all/transacties/pot/:id"
        element={
          <ProtectedRoute isAllowed={canAccessProtectedRoutes}>
            {withAppShell(
              <SeeAllPage
                type="transacties"
                potjes={potjes}
                transacties={transacties}
                isLoading={isBudgetLoading}
                errorMessage={budgetError}
                onPotDeleted={loadBudgetData}
              />,
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/see-all/potjes"
        element={
          <ProtectedRoute isAllowed={canAccessProtectedRoutes}>
            {withAppShell(
              <SeeAllPage
                type="potjes"
                potjes={potjes}
                transacties={transacties}
                isLoading={isBudgetLoading}
                errorMessage={budgetError}
                onPotDeleted={loadBudgetData}
              />,
            )}
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
            {withAppShell(<AccountPage />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/potje-toevoegen"
        element={
          <ProtectedRoute isAllowed={canAccessProtectedRoutes}>
            {withAppShell(<PotjeToevoegen onPotCreated={loadBudgetData} />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/starter-inhoud"
        element={
          <ProtectedRoute isAllowed={canAccessProtectedRoutes}>
            {withAppShell(<StarterInhoud />)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/budget-details/:id"
        element={
          <ProtectedRoute isAllowed={canAccessProtectedRoutes}>
            {withAppShell(
              <BudgetDetails
                potjes={potjes}
                transacties={transacties}
                isLoading={isBudgetLoading}
                errorMessage={budgetError}
                onTransactionCreated={loadBudgetData}
              />,
            )}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
