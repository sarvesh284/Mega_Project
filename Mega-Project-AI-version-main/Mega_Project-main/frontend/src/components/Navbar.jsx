import {
  Home,
  Briefcase,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  PlusCircle,
  Users,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar visual-navbar">

      <Link to="/" className="logo visual-logo">
        <span className="logo-icon">
          👷
        </span>

        <span>
          LOKROZGAR <b>AI</b>
        </span>
      </Link>

      <div className="nav-links visual-nav-links">

        <Link to="/" className="nav-item">
          <Home size={17} />
          <span>{t("home")}</span>
        </Link>

        <Link to="/jobs" className="nav-item">
          <Briefcase size={17} />
          <span>{t("findJobs")}</span>
        </Link>

        {user?.role === "worker" && (
          <>
            <Link
              to="/worker-dashboard"
              className="nav-item"
            >
              <LayoutDashboard size={17} />
              <span>{t("dashboard")}</span>
            </Link>

            <Link
              to="/profile"
              className="nav-item"
            >
              👤
              <span>{t("profile")}</span>
            </Link>
          </>
        )}

        {user?.role === "employer" && (
          <>
            <Link
              to="/employer-dashboard"
              className="nav-item"
            >
              <LayoutDashboard size={17} />
              <span>{t("dashboard")}</span>
            </Link>

            <Link
              to="/post-job"
              className="nav-item"
            >
              <PlusCircle size={17} />
              <span>{t("postJob")}</span>
            </Link>

            <Link
              to="/applicants"
              className="nav-item"
            >
              <Users size={17} />
              <span>{t("applicants")}</span>
            </Link>
          </>
        )}

        <div className="language-selector">
          <span>🌐</span>

          <select
            value={language}
            onChange={(event) =>
              changeLanguage(event.target.value)
            }
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>
        </div>

        {!user ? (
          <div className="nav-auth-actions">

            <Link
              to="/login"
              className="nav-login-btn"
            >
              <LogIn size={17} />
              {t("login")}
            </Link>

            <Link
              to="/register"
              className="nav-register-btn"
            >
              <UserPlus size={17} />
              {t("register")}
            </Link>

          </div>
        ) : (

          <button
            onClick={handleLogout}
            className="nav-logout-btn"
          >
            <LogOut size={17} />
            {t("logout")}
          </button>

        )}

      </div>

    </nav>
  );
}

export default Navbar;