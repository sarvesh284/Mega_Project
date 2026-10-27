
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  Home,
  Briefcase,
  LayoutDashboard,
  FileText,
  PlusCircle,
  LogOut,
  LogIn,
  UserPlus,
  Inbox,
  MessageSquare,
  BadgeCheck,
  Languages,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { LanguageSwitcher } from "../common/LanguageSwitcher";
import { ProfileAvatar } from "../common/ProfileAvatar";
import { USER_ROLES } from "../../utils/enums";

import "./Navbar.css";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const roles = user?.roles || [];

  const isWorker = roles.includes(USER_ROLES.WORKER);
  const isEmployer = roles.includes(USER_ROLES.EMPLOYER);
  const isDualRole = isWorker && isEmployer;

  const activeRole = isWorker
    ? "worker"
    : isEmployer
    ? "employer"
    : "worker";

  const navLinkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* TOP NAVIGATION BAR */}
      <header className="top-navbar">
        <Link to="/" className="top-navbar-brand">
          <span
            className="top-navbar-brand-icon"
            aria-hidden="true"
          >
            👷
          </span>

          <span>
            LOKROZGAR <strong>AI</strong>
          </span>
        </Link>

        <div className="top-navbar-actions">
          {isAuthenticated ? (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `top-nav-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <ProfileAvatar
                role={activeRole}
                size={35}
              />

              <span>{t("profile")}</span>
            </NavLink>
          ) : (
            <>
              <Link
                to="/login"
                className="top-nav-link"
              >
                <LogIn
                  size={19}
                  aria-hidden="true"
                />
                <span>{t("login")}</span>
              </Link>

              <Link
                to="/register"
                className="top-nav-register"
              >
                <UserPlus
                  size={19}
                  aria-hidden="true"
                />
                <span>{t("register")}</span>
              </Link>
            </>
          )}

          <div className="top-navbar-language">
            <span className="top-language-label">
              <Languages
                size={19}
                aria-hidden="true"
              />
              <span>Language</span>
            </span>

            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* PERMANENT LEFT SIDEBAR */}
      <aside
        className="navbar sidebar"
        aria-label={t("nav.mainAria")}
      >
        <div className="sidebar-inner">
          <div className="sidebar-heading">
            <LayoutDashboard
              size={20}
              aria-hidden="true"
            />
            <span>Navigation</span>
          </div>

          {isAuthenticated && user && (
            <div className="sidebar-user">
              <ProfileAvatar
                role={activeRole}
                size={48}
                className="sidebar-user-avatar"
              />

              <div className="sidebar-user-details">
                <strong>
                  {user.fullName || user.phone}
                </strong>

                <span>
                  <BadgeCheck
                    size={14}
                    aria-hidden="true"
                  />

                  {isDualRole
                    ? t("nav.dualRole")
                    : isWorker
                    ? t("worker")
                    : isEmployer
                    ? t("employer")
                    : t("nav.userRole")}
                </span>
              </div>
            </div>
          )}

          <nav
            className="sidebar-nav"
            aria-label={t("nav.mainAria")}
          >
            <NavLink
              to="/"
              end
              className={navLinkClass}
            >
              <Home
                size={22}
                aria-hidden="true"
              />
              <span>{t("home")}</span>
            </NavLink>

            <NavLink
              to="/jobs"
              className={navLinkClass}
            >
              <Briefcase
                size={22}
                aria-hidden="true"
              />
              <span>{t("findJobs")}</span>
            </NavLink>

            {isWorker && (
              <>
                <NavLink
                  to="/worker-dashboard"
                  className={navLinkClass}
                >
                  <LayoutDashboard
                    size={22}
                    aria-hidden="true"
                  />
                  <span>
                    {isDualRole
                      ? t("nav.workerDashboard")
                      : t("dashboard")}
                  </span>
                </NavLink>

                <NavLink
                  to="/applications"
                  className={navLinkClass}
                >
                  <FileText
                    size={22}
                    aria-hidden="true"
                  />
                  <span>
                    {t("nav.applications")}
                  </span>
                </NavLink>

                <NavLink
                  to="/job-requests"
                  className={navLinkClass}
                >
                  <Inbox
                    size={22}
                    aria-hidden="true"
                  />
                  <span>
                    {t("nav.jobRequests")}
                  </span>
                </NavLink>
              </>
            )}

            {isEmployer && (
              <>
                <NavLink
                  to="/employer-dashboard"
                  className={navLinkClass}
                >
                  <LayoutDashboard
                    size={22}
                    aria-hidden="true"
                  />
                  <span>
                    {isDualRole
                      ? t("nav.employerDashboard")
                      : t("dashboard")}
                  </span>
                </NavLink>

                <NavLink
                  to="/post-job"
                  className={navLinkClass}
                >
                  <PlusCircle
                    size={22}
                    aria-hidden="true"
                  />
                  <span>{t("postJob")}</span>
                </NavLink>
              </>
            )}

            {isAuthenticated && (
              <NavLink
                to="/messages"
                className={navLinkClass}
              >
                <MessageSquare
                  size={22}
                  aria-hidden="true"
                />
                <span>{t("nav.messages")}</span>
              </NavLink>
            )}
          </nav>

          {isAuthenticated && (
            <div className="sidebar-footer">
              <button
                type="button"
                className="sidebar-logout"
                onClick={handleLogout}
              >
                <LogOut
                  size={21}
                  aria-hidden="true"
                />
                <span>{t("logout")}</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
