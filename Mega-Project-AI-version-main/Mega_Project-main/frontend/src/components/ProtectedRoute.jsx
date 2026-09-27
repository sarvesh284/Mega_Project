import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        fontSize: "1.1rem",
        color: "#64748b"
      }}>
        Loading LOKROZGAR AI...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    if (user.role === "worker") {
      return <Navigate to="/worker-dashboard" replace />;
    }

    if (user.role === "employer") {
      return <Navigate to="/employer-dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;