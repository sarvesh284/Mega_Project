import { useState, useEffect } from "react";
import {
  Briefcase,
  CheckCircle,
  Clock3,
  UserRound,
  MapPin,
  IndianRupee,
  ArrowRight,
  Search,
  FileText,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useApplications } from "../context/ApplicationContext";
import { getRecommendedJobs, searchJobs } from "../api/jobs.api";
import { toUiJob } from "../api/adapters";

import "../App.css";

function WorkerDashboard() {
  const { user } = useAuth();
  const { applications, loading: loadingApps } = useApplications();

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [fallbackNotice, setFallbackNotice] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getRecommendedJobs()
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : [];
        if (list.length === 0) {
          searchJobs({ limit: 6 }).then((searchData) => {
            if (!isMounted) return;
            const searchList = searchData?.docs || (Array.isArray(searchData) ? searchData : []);
            setRecommendedJobs(searchList.map(toUiJob).filter(Boolean));
            setFallbackNotice("No personalized recommendations yet; showing latest jobs.");
          });
        } else {
          const mapped = list
            .map((item) => {
              const ui = toUiJob(item.job || item);
              if (ui && item.matchScore !== undefined) {
                ui.matchScore = item.matchScore;
              }
              return ui;
            })
            .filter(Boolean);
          setRecommendedJobs(mapped);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err.status === 503) {
          setFallbackNotice("AI recommendation service unavailable; showing latest jobs.");
        }
        searchJobs({ limit: 6 })
          .then((searchData) => {
            if (!isMounted) return;
            const searchList = searchData?.docs || (Array.isArray(searchData) ? searchData : []);
            setRecommendedJobs(searchList.map(toUiJob).filter(Boolean));
          })
          .catch(() => {
            if (isMounted) setRecommendedJobs([]);
          });
      })
      .finally(() => {
        if (isMounted) setLoadingRecs(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const acceptedApplications = applications.filter(
    (app) => app.status?.toLowerCase() === "accepted"
  );

  const pendingApplications = applications.filter(
    (app) =>
      app.status?.toLowerCase() === "pending" ||
      app.status?.toLowerCase() === "applied"
  );

  const rejectedApplications = applications.filter(
    (app) => app.status?.toLowerCase() === "rejected"
  );

  return (
    <div className="dashboard-page page-animate">
      {/* WELCOME HEADER */}
      <section className="worker-dashboard-hero">
        <div className="worker-welcome">
          <div className="worker-avatar-large">
            <UserRound size={32} />
          </div>

          <div>
            <span className="dashboard-eyebrow">WORKER DASHBOARD</span>
            <h1>
              Welcome back, <span>{user?.name || "Worker"}</span> 👋
            </h1>
            <p>Find opportunities that match your skills and experience.</p>
          </div>
        </div>

        <Link to="/profile" className="dashboard-profile-btn">
          <UserRound size={18} />
          My Profile
        </Link>
      </section>

      {/* STATISTICS */}
      <section className="worker-stats-grid">
        <div className="worker-stat-card stat-blue">
          <div className="worker-stat-icon">
            <Briefcase size={24} />
          </div>
          <div>
            <span>Applications</span>
            <strong>{loadingApps ? "..." : applications.length}</strong>
            <small>Total applications</small>
          </div>
        </div>

        <div className="worker-stat-card stat-orange">
          <div className="worker-stat-icon">
            <Clock3 size={24} />
          </div>
          <div>
            <span>Pending</span>
            <strong>{loadingApps ? "..." : pendingApplications.length}</strong>
            <small>Waiting for response</small>
          </div>
        </div>

        <div className="worker-stat-card stat-green">
          <div className="worker-stat-icon">
            <CheckCircle size={24} />
          </div>
          <div>
            <span>Accepted</span>
            <strong>{loadingApps ? "..." : acceptedApplications.length}</strong>
            <small>Successful applications</small>
          </div>
        </div>

        <div className="worker-stat-card stat-red">
          <div className="worker-stat-icon">
            <FileText size={24} />
          </div>
          <div>
            <span>Rejected</span>
            <strong>{loadingApps ? "..." : rejectedApplications.length}</strong>
            <small>Applications not selected</small>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="worker-dashboard-layout">
        <main>
          {/* MY APPLICATIONS */}
          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <span className="section-eyebrow">YOUR ACTIVITY</span>
                <h2>My Applications</h2>
              </div>

              <Link to="/jobs" className="dashboard-view-link">
                Find More Jobs
                <ArrowRight size={17} />
              </Link>
            </div>

            {loadingApps ? (
              <div className="no-applications visual-empty-state">
                <p>Loading applications...</p>
              </div>
            ) : applications.length > 0 ? (
              <div className="applications-list">
                {applications.map((application) => (
                  <div
                    className="worker-application-card animated-card"
                    key={application.id || application.jobId}
                  >
                    <div className="application-icon animated-icon">
                      <Briefcase size={24} />
                    </div>

                    <div className="application-content">
                      <h3>{application.title}</h3>
                      <p className="company-name">{application.company}</p>

                      <div className="application-meta">
                        <span>
                          <MapPin size={14} />
                          {application.location}
                        </span>

                        <span>
                          <IndianRupee size={14} />
                          {application.salary}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`application-status ${
                        application.status?.toLowerCase()
                      }`}
                    >
                      {application.status?.toLowerCase() === "accepted" && (
                        <CheckCircle size={15} />
                      )}
                      {(application.status?.toLowerCase() === "pending" ||
                        application.status?.toLowerCase() === "applied") && (
                        <Clock3 size={15} />
                      )}
                      {application.status?.toLowerCase() === "rejected" && (
                        <FileText size={15} />
                      )}
                      {application.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-applications visual-empty-state">
                <div className="empty-state-icon">
                  <FileText size={35} />
                </div>
                <h3>No Applications Yet</h3>
                <p>
                  Start exploring jobs and apply for opportunities that match your skills.
                </p>
                <Link to="/jobs" className="browse-jobs-btn animated-button">
                  <Search size={17} />
                  Browse Jobs
                </Link>
              </div>
            )}
          </section>

          {/* RECOMMENDED JOBS */}
          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <span className="section-eyebrow">RECOMMENDED FOR YOU</span>
                <h2>Jobs You May Like</h2>
                {fallbackNotice && (
                  <small style={{ color: "#64748b", display: "block", marginTop: "4px" }}>
                    {fallbackNotice}
                  </small>
                )}
              </div>

              <Link to="/jobs" className="dashboard-view-link">
                View All
                <ArrowRight size={17} />
              </Link>
            </div>

            {loadingRecs ? (
              <div className="no-applications visual-empty-state">
                <p>Loading recommended jobs...</p>
              </div>
            ) : recommendedJobs.length > 0 ? (
              <div className="recommended-jobs-grid">
                {recommendedJobs.map((job, index) => (
                  <Link
                    to={`/jobs/${job.id}`}
                    state={{ job: job.raw }}
                    className="recommended-job-card animated-card"
                    key={job.id}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <div className="recommended-job-icon animated-icon">
                      <Briefcase size={25} />
                    </div>

                    <div className="recommended-job-content">
                      <h3>{job.title}</h3>
                      <p>{job.company}</p>

                      <div className="recommended-job-info">
                        <span>
                          <MapPin size={14} />
                          {job.location}
                        </span>

                        <span>
                          <IndianRupee size={14} />
                          {job.salary}
                        </span>
                      </div>
                    </div>

                    <div className="recommended-job-footer">
                      <span className="job-type-pill">
                        {job.matchScore ? `${job.matchScore}% Match` : job.type}
                      </span>
                      <ArrowRight size={18} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="no-applications visual-empty-state">
                <p>No jobs available right now.</p>
              </div>
            )}
          </section>
        </main>

        {/* SIDE PANEL */}
        <aside className="worker-dashboard-side">
          <div className="quick-action-card">
            <div className="quick-action-large-icon">🔍</div>
            <h3>Looking for a job?</h3>
            <p>Explore new opportunities based on your skills.</p>
            <Link to="/jobs" className="side-action-btn animated-button">
              Find Jobs
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="quick-action-card profile-side-card">
            <div className="quick-action-large-icon">👤</div>
            <h3>Complete Your Profile</h3>
            <p>Keep your profile updated so employers can know more about you.</p>
            <Link to="/profile" className="side-action-btn secondary-action">
              View Profile
              <ArrowRight size={17} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default WorkerDashboard;