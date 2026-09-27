import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { saveWorkerProfile, saveEmployerProfile } from "../api/profile.api";
import "../App.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("worker");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]);

  const handleRegister = async (event) => {
    event.preventDefault();
    setError(null);
    setFieldErrors([]);

    const cleanPhone = phone.trim();
    const phoneRegex = /^(?:\+91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError("Please enter a valid 10-digit mobile number (e.g. 9876543210)");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setSubmitting(true);

    const payload = {
      phone: cleanPhone,
      password,
      roles: [role],
      ...(role === "worker"
        ? { fullName: name.trim() || "Worker" }
        : { businessName: name.trim() || "Employer Business", businessType: "Individual" }),
    };

    try {
      await register(payload);

      if (city.trim()) {
        try {
          if (role === "worker") {
            await saveWorkerProfile({ fullName: name.trim() || "Worker", city: city.trim() });
          } else {
            await saveEmployerProfile({
              businessName: name.trim() || "Employer Business",
              businessType: "Individual",
              city: city.trim(),
            });
          }
        } catch {
          // ignore profile save warning if register succeeded
        }
      }

      if (role === "employer") {
        navigate("/employer-dashboard");
      } else {
        navigate("/worker-dashboard");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please check your details.");
      if (Array.isArray(err.fieldErrors)) {
        setFieldErrors(err.fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page page-animate">
      <div className="auth-card register-card visual-auth-card">
        <div className="auth-icon icon-pulse">
          <UserPlus size={30} />
        </div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Join LOKROZGAR AI and find the right opportunities
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "10px 14px",
              borderRadius: "6px",
              marginBottom: "16px",
              fontSize: "0.9rem",
            }}
          >
            <div>{error}</div>
            {fieldErrors.length > 0 && (
              <ul style={{ marginTop: "6px", marginBottom: 0, paddingLeft: "20px" }}>
                {fieldErrors.map((fe, idx) => (
                  <li key={idx}>
                    {fe.field ? `${fe.field}: ` : ""}
                    {fe.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Name */}
          <div className="form-group">
            <label>
              <User size={17} />
              {role === "employer" ? "Business / Organization Name" : "Full Name"}
            </label>

            <div className="input-wrapper visual-input">
              <User size={21} />
              <input
                type="text"
                placeholder={
                  role === "employer"
                    ? "Enter business or company name"
                    : "Enter your full name"
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Mobile */}
          <div className="form-group">
            <label>
              <Phone size={17} />
              Mobile Number
            </label>

            <div className="input-wrapper visual-input">
              <Phone size={21} />
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label>
              <Mail size={17} />
              Email (Optional)
            </label>

            <div className="input-wrapper visual-input">
              <Mail size={21} />
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label>
              <MapPin size={17} />
              City / Location
            </label>

            <div className="input-wrapper visual-input">
              <MapPin size={21} />
              <input
                type="text"
                placeholder="Enter your city (e.g. Pune)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
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
                placeholder="Create a password (min 6 chars)"
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

          {/* Account Type */}
          <div className="form-group">
            <label>👤 Account Type</label>

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
                <small>Hire Workers</small>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn animated-button"
            disabled={submitting}
          >
            <UserPlus size={19} />
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="register-text">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;