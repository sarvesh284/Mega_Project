import { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Users,
  Clock3,
  CheckCircle,
  Plus,
  ArrowRight,
  MapPin,
  IndianRupee,
  Eye,
  XCircle,
  Ban,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getEmployerJobs, closeJob, cancelJob } from "../api/jobs.api";
import { applicantsForJob } from "../api/applications.api";
import { toUiJob } from "../api/adapters";

import "../App.css";

function EmployerDashboard() {
  const { user } = useAuth();

  const [postedJobs, setPostedJobs] = useState([]);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchJobs = useCallback(() => {
    return Promise.resolve().then(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEmployerJobs();
        const rawList = Array.isArray(data) ? data : [];
        const mapped = rawList.map(toUiJob).filter(Boolean);
        setPostedJobs(mapped);

        const first5 = mapped.slice(0, 5);
        const counts = {};

        for (const job of first5) {
          try {
            const apps = await applicantsForJob(job.id);
            counts[job.id] = Array.isArray(apps) ? apps.length : 0;
          } catch {
            // ignore applicant count fetch error per job
          }
        }

        setApplicantCounts(counts);
      } catch (err) {
        setError(err.message || "Failed to load posted jobs");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleClose = async (jobId) => {
    try {
      setActionMessage(null);
      await closeJob(jobId);
      setActionMessage("Job closed successfully.");
      await fetchJobs();
    } catch (err) {
      setActionMessage(err.message || "Failed to close job");
    }
  };

  const handleCancel = async (jobId) => {
    try {
      setActionMessage(null);
      await cancelJob(jobId);
      setActionMessage("Job cancelled successfully.");
      await fetchJobs();
    } catch (err) {
      setActionMessage(err.message || "Failed to cancel job");
    }
  };

  const totalApplicants = Object.values(applicantCounts).reduce(
    (acc, val) => acc + (val || 0),
    0
  );

  return (
    <div className="dashboard-page page-animate">
      {/* EMPLOYER HERO */}
      <section className="employer-dashboard-hero">
        <div className="employer-welcome">
          <div className="employer-avatar-large">
            <Briefcase size={32} />
          </div>

          <div>
            <span className="dashboard-eyebrow">EMPLOYER DASHBOARD</span>
            <h1>
              Welcome back, <span>{user?.name || "Employer"}</span> 👋
            </h1>
            <p>Manage your jobs and connect with skilled workers.</p>
          </div>
        </div>

        <Link to="/post-job" className="employer-post-btn animated-button">
          <Plus size={19} />
          Post a Job
        </Link>
      </section>

      {/* STATISTICS */}
      <section className="employer-stats-grid">
        <div className="employer-stat-card employer-stat-blue">
          <div className="employer-stat-icon">
            <Briefcase size={24} />
          </div>

          <div>
            <span>Posted Jobs</span>
            <strong>{loading ? "..." : postedJobs.length}</strong>
            <small>Active job postings</small>
          </div>
        </div>

        <div className="employer-stat-card employer-stat-orange">
          <div className="employer-stat-icon">
            <Users size={24} />
          </div>

          <div>
            <span>Applicants</span>
            <strong>{loading ? "..." : totalApplicants}</strong>
            <small>Total applications</small>
          </div>
        </div>

        <div className="employer-stat-card employer-stat-purple">
          <div className="employer-stat-icon">
            <Clock3 size={24} />
          </div>

          <div>
            <span>Open Jobs</span>
            <strong>
              {postedJobs.filter((j) => j.status === "open").length}
            </strong>
            <small>Open for applications</small>
          </div>
        </div>

        <div className="employer-stat-card employer-stat-green">
          <div className="employer-stat-icon">
            <CheckCircle size={24} />
          </div>

          <div>
            <span>Completed</span>
            <strong>
              {postedJobs.filter((j) => j.status === "completed").length}
            </strong>
            <small>Completed postings</small>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="employer-dashboard-layout">
        <main>
          {/* POSTED JOBS */}
          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <span className="section-eyebrow">YOUR JOB POSTINGS</span>
                <h2>Posted Jobs</h2>
              </div>

              <Link to="/post-job" className="dashboard-view-link">
                Post New Job
                <Plus size={17} />
              </Link>
            </div>

            {actionMessage && (
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  color: "#1e40af",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  marginBottom: "16px",
                  fontSize: "0.9rem",
                }}
              >
                {actionMessage}
              </div>
            )}

            {loading ? (
              <div className="no-applications visual-empty-state">
                <p>Loading your job postings...</p>
              </div>
            ) : error ? (
              <div className="no-applications visual-empty-state">
                <p style={{ color: "#ef4444" }}>{error}</p>
              </div>
            ) : postedJobs.length > 0 ? (
              <div className="employer-jobs-list">
                {postedJobs.map((job, index) => {
                  const count = applicantCounts[job.id];
                  const countText =
                    count !== undefined ? `${count} Applicants` : "View";

                  return (
                    <div
                      className="employer-job-card animated-card"
                      key={job.id}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      <div className="employer-job-icon animated-icon">
                        <Briefcase size={25} />
                      </div>

                      <div className="employer-job-main">
                        <div className="employer-job-heading">
                          <div>
                            <h3>{job.title}</h3>
                            <span
                              className={`job-status-${
                                job.status === "open"
                                  ? "active"
                                  : job.status === "closed" || job.status === "completed"
                                  ? "completed"
                                  : "expired"
                              }`}
                            >
                              <CheckCircle size={13} />
                              {job.status}
                            </span>
                          </div>

                          <Link
                            to={`/applicants?jobId=${job.id}`}
                            className="employer-applicant-count"
                            style={{ textDecoration: "none" }}
                          >
                            <Users size={15} />
                            {countText}
                          </Link>
                        </div>

                        <div className="employer-job-details">
                          <span>
                            <MapPin size={15} />
                            {job.location}
                          </span>

                          <span>
                            <IndianRupee size={15} />
                            {job.salary}
                          </span>

                          <span>
                            <Clock3 size={15} />
                            {job.type}
                          </span>
                        </div>

                        <div className="employer-job-actions" style={{ flexWrap: "wrap", gap: "8px" }}>
                          <Link
                            to={`/applicants?jobId=${job.id}`}
                            className="employer-action-primary animated-button"
                          >
                            <Users size={16} />
                            View Applicants
                          </Link>

                          <Link
                            to={`/job/${job.id}`}
                            state={{ job: job.raw }}
                            className="employer-action-secondary"
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
                          >
                            <Eye size={16} />
                            View Job
                          </Link>

                          {job.status === "open" && (
                            <button
                              type="button"
                              className="employer-action-secondary"
                              onClick={() => handleClose(job.id)}
                              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                            >
                              <XCircle size={16} />
                              Close Job
                            </button>
                          )}

                          {(job.status === "open" || job.status === "partially_assigned") && (
                            <button
                              type="button"
                              className="employer-action-secondary"
                              onClick={() => handleCancel(job.id)}
                              style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#dc2626" }}
                            >
                              <Ban size={16} />
                              Cancel Job
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-applications visual-empty-state">
                <div className="empty-state-icon">
                  <Briefcase size={35} />
                </div>
                <h3>No Jobs Posted Yet</h3>
                <p>Create your first job posting to start finding workers.</p>
                <Link to="/post-job" className="browse-jobs-btn animated-button">
                  <Plus size={17} />
                  Post a Job
                </Link>
              </div>
            )}
          </section>

          {/* EMPLOYER QUICK ACTIONS */}
          <section className="employer-action-section">
            <div className="employer-action-heading">
              <span className="section-eyebrow">QUICK ACTIONS</span>
              <h2>Manage Your Hiring</h2>
            </div>

            <div className="employer-quick-grid">
              <Link to="/post-job" className="employer-quick-card animated-card">
                <div className="employer-quick-icon blue">
                  <Plus size={27} />
                </div>

                <div>
                  <h3>Post a New Job</h3>
                  <p>Find skilled workers for your next requirement.</p>
                </div>

                <ArrowRight size={19} />
              </Link>

              <Link to="/applicants" className="employer-quick-card animated-card">
                <div className="employer-quick-icon purple">
                  <Users size={27} />
                </div>

                <div>
                  <h3>Manage Applicants</h3>
                  <p>Review applications and connect with workers.</p>
                </div>

                <ArrowRight size={19} />
              </Link>
            </div>
          </section>
        </main>

        {/* SIDE PANEL */}
        <aside className="employer-dashboard-side">
          <div className="employer-side-card employer-highlight-card">
            <div className="employer-side-icon">👥</div>
            <h3>Review Applicants</h3>
            <p>Select candidates for your active job postings.</p>

            <Link to="/applicants" className="employer-side-btn animated-button">
              Review Applicants
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="employer-side-card">
            <div className="employer-side-icon">📢</div>
            <h3>Need More Workers?</h3>
            <p>Create another job posting and reach more skilled workers.</p>

            <Link
              to="/post-job"
              className="employer-side-btn employer-side-secondary animated-button"
            >
              <Plus size={17} />
              Post a Job
            </Link>
          </div>

          <div className="employer-side-card employer-info-card">
            <div className="employer-side-icon">🛡️</div>
            <h3>Safe Hiring</h3>
            <p>Review worker profiles before making your hiring decision.</p>

            <div className="employer-info-badge">
              <CheckCircle size={15} />
              Trusted Platform
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default EmployerDashboard;