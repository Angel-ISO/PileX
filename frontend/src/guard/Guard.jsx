import { useStore } from "../context/store.js";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ component: Component }) => {
  const { state } = useStore();
  const { userSession } = state;

  if (!userSession?.authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Component />;
};

export const GuestRoute = ({ component: Component }) => {
  const { state } = useStore();
  const { userSession } = state;

  if (userSession?.authenticated) {
    return <Navigate to={"/profile"} replace />;
  }

  return <Component />;
};
