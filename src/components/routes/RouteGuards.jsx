import { Navigate, useLocation } from "react-router-dom";

export function ProtectedRoute({ children, isAllowed }) {
  const location = useLocation();

  return isAllowed ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}

export function PublicRoute({ children, isLoggedIn }) {
  const location = useLocation();
  const redirectTarget = location.state?.from?.pathname || "/";

  return !isLoggedIn ? children : <Navigate to={redirectTarget} replace />;
}
