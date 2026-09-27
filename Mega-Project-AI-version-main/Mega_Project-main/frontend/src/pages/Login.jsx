import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Lock,
  LogIn,
  Eye,
  EyeOff,
  Smartphone,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("worker");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);

    const cleanPhone = phone.trim();
    const phoneRegex = /^(?:\+91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError("Please enter a valid 10-digit mobile number (e.g. 9876543210)");
      return;
    }

    setSubmitting(true);

    try {
      const userObj = await login(cleanPhone, password);
      const userRole = userObj?.role || role;

      if (userRole === "employer") {
        navigate("/employer-dashboard");
      } else {
        navigate("/worker-dashboard");
      }
    } catch (err) {
      if (err.status === 429) {
        setError("Too many login attempts. The limit is 5 per 15 minutes. Please wait and try again later.");
      } else {
        setError(err.message || "Failed to log in. Please check your credentials.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page page-animate">
      <div className="auth-card visual-auth-card">
        <div className="auth-icon icon-pulse">
          <LogIn size={30} />
        </div>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to continue to LOKROZGAR AI
        </p>

        {error && (
          <div style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "10px 14px",
            borderRadius: "6px",
            marginBottom: "16px",
            fontSize: "0.9rem"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Mobile Number */}
          <div className="form-group">
            <label>
              <Smartphone size={17} />
              Mobile number
            </label>

            <div className="input-wrapper visual-input">
              <Smartphone size={21} />
              <input
                type="text"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>
              <Lock size={17} />
              Password
            </label>

            <div className="input-wrapper visual-input">
              <Lock size={21} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Account Type (UI Toggle) */}
          <div className="form-group">
            <label>👤 Preferred Dashboard View</label>

            <div className="role-selection visual-role-selection">
              <button
                type="button"
                className={`role-option visual-role-option ${
                  role === "worker" ? "active" : ""
                }`}
                onClick={() => setRole("worker")}
              >
                <span className="role-big-icon">👷</span>
                <span>Worker</span>
                <small>Find Jobs</small>
              </button>

              <button
                type="button"
                className={`role-option visual-role-option ${
                  role === "employer" ? "active" : ""
                }`}
                onClick={() => setRole("employer")}
              >
                <span className="role-big-icon">🏢</span>
                <span>Employer</span>
                <small>Post Jobs</small>
              </button>
            </div>
          </div>

          <div className="forgot-password">
            <Link to="#">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            className="auth-btn animated-button"
            disabled={submitting}
          >
            <LogIn size={19} />
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="register-text">
          Don't have an account?{" "}
          <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;