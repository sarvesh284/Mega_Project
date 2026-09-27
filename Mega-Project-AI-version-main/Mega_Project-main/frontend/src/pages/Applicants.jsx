import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Users,
  UserRound,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  X,
  Clock3,
  Award,
  ArrowLeft,
  Star,
} from "lucide-react";

import * as applicationsApi from "../api/applications.api";
import * as jobsApi from "../api/jobs.api";
import { toUiApplicant, toUiJob } from "../api/adapters";

import "../App.css";

function Applicants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryJobId = searchParams.get("jobId") || "";

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(queryJobId);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Load employer's jobs
  useEffect(() => {
    let active = true;
    jobsApi
      .getEmployerJobs()
      .then((res) => {
        if (!active) return;
        const mappedJobs = (Array.isArray(res) ? res : []).map(toUiJob);
        setJobs(mappedJobs);
        if (!queryJobId && mappedJobs.length > 0) {
          setSelectedJobId(mappedJobs[0].id);
        }
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load employer jobs", err);
      });
    return () => {
      active = false;
    };
  }, [queryJobId]);

  // Keep selectedJobId in sync with searchParams
  useEffect(() => {
    if (queryJobId && queryJobId !== selectedJobId) {
      Promise.resolve().then(() => {
        setSelectedJobId(queryJobId);
      });
    }
  }, [queryJobId, selectedJobId]);

  // Fetch applicants when selectedJobId changes
  useEffect(() => {
    let active = true;

    if (!selectedJobId) {
      Promise.resolve().then(() => {
        if (!active) return;
        setLoading(false);
        setApplicants([]);
      });
      return () => {
        active = false;
      };
    }

    Promise.resolve().then(() => {
      if (!active) return;
      setLoading(true);
      setError(null);
      return applicationsApi
        .applicantsForJob(selectedJobId)
        .then((res) => {
          if (!active) return;
          const currentJob = jobs.find((j) => j.id === selectedJobId);
          const mapped = (Array.isArray(res) ? res : []).map((app) => {
            const ui = toUiApplicant(app);
            let displayStatus = "Pending";
            if (ui.status === "accepted") displayStatus = "Accepted";
            else if (ui.status === "rejected") displayStatus = "Rejected";
            else if (ui.status === "shortlisted") displayStatus = "Shortlisted";
            else if (ui.status === "applied") displayStatus = "Pending";
            else if (ui.status)
              displayStatus =
                ui.status.charAt(0).toUpperCase() + ui.status.slice(1);

            return {
              ...ui,
              displayStatus,
              jobTitle: currentJob?.title || "Job",
              location: ui.city || "—",
              email: ui.raw?.workerId?.userId?.email || "—",
              skills: Array.isArray(ui.raw?.workerId?.languages)
                ? ui.raw.workerId.languages
                : [],
            };
          });
          setApplicants(mapped);
          setLoading(false);
        })
        .catch((err) => {
          if (!active) return;
          setError(err.message || "Failed to load applicants");
          setLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, [selectedJobId, jobs]);

  const reloadApplicants = () => {
    if (!selectedJobId) return;
    applicationsApi
      .applicantsForJob(selectedJobId)
      .then((res) => {
        const currentJob = jobs.find((j) => j.id === selectedJobId);
        const mapped = (Array.isArray(res) ? res : []).map((app) => {
          const ui = toUiApplicant(app);
          let displayStatus = "Pending";
          if (ui.status === "accepted") displayStatus = "Accepted";
          else if (ui.status === "rejected") displayStatus = "Rejected";
          else if (ui.status === "shortlisted") displayStatus = "Shortlisted";
          else if (ui.status === "applied") displayStatus = "Pending";
          else if (ui.status)
            displayStatus =
              ui.status.charAt(0).toUpperCase() + ui.status.slice(1);

          return {
            ...ui,
            displayStatus,
            jobTitle: currentJob?.title || "Job",
            location: ui.city || "—",
            email: ui.raw?.workerId?.userId?.email || "—",
            skills: Array.isArray(ui.raw?.workerId?.languages)
              ? ui.raw.workerId.languages
              : [],
          };
        });
        setApplicants(mapped);
      })
      .catch((err) => console.error("Reload applicants failed", err));
  };

  const handleShortlist = async (applicantId) => {
    try {
      setActionLoading(applicantId);
      await applicationsApi.shortlist(applicantId);
      reloadApplicants();
    } catch (err) {
      alert(err.message || "Failed to shortlist application");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (applicant) => {
    try {
      setActionLoading(applicant.id);
      await applicationsApi.setStatus(applicant.id, "accepted");
      reloadApplicants();
      if (selectedApplicant?.id === applicant.id) {
        setSelectedApplicant(null);
      }
    } catch (err) {
      alert(err.message || "Failed to accept application");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicant) => {
    try {
      setActionLoading(applicant.id);
      await applicationsApi.setStatus(applicant.id, "rejected");
      reloadApplicants();
      if (selectedApplicant?.id === applicant.id) {
        setSelectedApplicant(null);
      }
    } catch (err) {
      alert(err.message || "Failed to reject application");
    } finally {
      setActionLoading(null);
    }
  };

  const handleJobChange = (e) => {
    const newJobId = e.target.value;
    setSelectedJobId(newJobId);
    setSearchParams({ jobId: newJobId });
  };

  const getStatusClass = (status) => {
    if (status === "Accepted" || status === "accepted") {
      return "applicant-status accepted";
    }
    if (status === "Rejected" || status === "rejected") {
      return "applicant-status rejected";
    }
    if (status === "Shortlisted" || status === "shortlisted") {
      return "applicant-status shortlisted";
    }
    return "applicant-status pending";
  };

  const pendingCount = applicants.filter(
    (a) => a.displayStatus === "Pending" || a.displayStatus === "Shortlisted"
  ).length;
  const acceptedCount = applicants.filter(
    (a) => a.displayStatus === "Accepted"
  ).length;
  const rejectedCount = applicants.filter(
    (a) => a.displayStatus === "Rejected"
  ).length;

  return (
    <div className="applicants-page page-animate">
      {/* =========================================
          TOP SECTION
          ========================================= */}
      <section className="applicants-hero">
        <div className="applicants-hero-content">
          <Link to="/employer-dashboard" className="applicants-back-link">
            <ArrowLeft size={18} />
            Employer Dashboard
          </Link>

          <div className="applicants-title-row">
            <div className="applicants-title-icon">
              <Users size={32} />
            </div>

            <div>
              <span className="dashboard-eyebrow">HIRING MANAGEMENT</span>
              <h1>Applicants</h1>
              <p>Review and manage workers who applied for your jobs.</p>
            </div>
          </div>

          {/* Job Picker Dropdown */}
          {jobs.length > 0 && (
            <div
              style={{
                marginTop: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <label
                htmlFor="jobSelect"
                style={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "#ffffff",
                }}
              >
                Select Job:
              </label>
              <select
                id="jobSelect"
                value={selectedJobId}
                onChange={handleJobChange}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  fontSize: "0.95rem",
                  background: "rgba(255, 255, 255, 0.95)",
                  color: "#1e293b",
                  fontWeight: 500,
                  cursor: "pointer",
                  minWidth: "220px",
                }}
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.location})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Error alert */}
      {error && (
        <div
          style={{
            margin: "1rem 2rem 0",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            backgroundColor: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* =========================================
          STATISTICS
          ========================================= */}
      <section className="applicant-stats-grid">
        <div className="applicant-stat-card">
          <div className="applicant-stat-icon blue">
            <Users size={22} />
          </div>
          <div>
            <span>Total Applicants</span>
            <strong>{applicants.length}</strong>
          </div>
        </div>

        <div className="applicant-stat-card">
          <div className="applicant-stat-icon orange">
            <Clock3 size={22} />
          </div>
          <div>
            <span>Pending Review</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="applicant-stat-card">
          <div className="applicant-stat-icon green">
            <CheckCircle size={22} />
          </div>
          <div>
            <span>Accepted</span>
            <strong>{acceptedCount}</strong>
          </div>
        </div>

        <div className="applicant-stat-card">
          <div className="applicant-stat-icon red">
            <XCircle size={22} />
          </div>
          <div>
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>
      </section>

      {/* =========================================
          APPLICANT LIST
          ========================================= */}
      <section className="applicants-content">
        <div className="applicants-section-heading">
          <div>
            <span className="section-eyebrow">WORKER APPLICATIONS</span>
            <h2>All Applicants</h2>
          </div>

          <div className="applicant-count-badge">
            <Users size={16} />
            {applicants.length} Applicants
          </div>
        </div>

        {loading ? (
          <div className="applicants-empty">
            <div className="applicants-empty-icon">
              <Clock3 size={38} />
            </div>
            <h3>Loading Applicants...</h3>
          </div>
        ) : applicants.length > 0 ? (
          <div className="applicants-list">
            {applicants.map((applicant, index) => (
              <div
                className="applicant-card animated-card"
                key={applicant.id}
                style={{
                  animationDelay: `${index * 0.08}s`,
                }}
              >
                {/* Avatar */}
                <div className="applicant-avatar">
                  <UserRound size={28} />
                </div>

                {/* Main information */}
                <div className="applicant-main">
                  <div className="applicant-card-header">
                    <div>
                      <h3>{applicant.name}</h3>
                      <p>
                        Applied for <strong>{applicant.jobTitle}</strong>
                      </p>
                    </div>

                    <span className={getStatusClass(applicant.displayStatus)}>
                      {applicant.displayStatus === "Accepted" && (
                        <CheckCircle size={14} />
                      )}
                      {applicant.displayStatus === "Rejected" && (
                        <XCircle size={14} />
                      )}
                      {applicant.displayStatus === "Shortlisted" && (
                        <Star size={14} />
                      )}
                      {applicant.displayStatus === "Pending" && (
                        <Clock3 size={14} />
                      )}
                      {applicant.displayStatus}
                    </span>
                  </div>

                  {/* Applicant details */}
                  <div className="applicant-details">
                    <span>
                      <MapPin size={15} />
                      {applicant.location}
                    </span>

                    <span>
                      <Briefcase size={15} />
                      {applicant.experience}
                    </span>

                    <span>
                      <Award size={15} />
                      {applicant.skills.length} Skills
                    </span>

                    {applicant.matchScore > 0 && (
                      <span style={{ color: "#d97706", fontWeight: 600 }}>
                        <Star size={15} />
                        {Math.round(applicant.matchScore)}% Match
                      </span>
                    )}
                  </div>

                  {/* Skills */}
                  {applicant.skills.length > 0 && (
                    <div className="applicant-skills">
                      {applicant.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="applicant-actions">
                    <button
                      className="applicant-view-btn"
                      onClick={() => setSelectedApplicant(applicant)}
                    >
                      <Eye size={16} />
                      View Profile
                    </button>

                    {(applicant.displayStatus === "Pending" ||
                      applicant.displayStatus === "Shortlisted") && (
                      <>
                        {applicant.displayStatus === "Pending" && (
                          <button
                            className="applicant-shortlist-btn"
                            onClick={() => handleShortlist(applicant.id)}
                            disabled={actionLoading === applicant.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              padding: "0.5rem 0.9rem",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              background: "#f8fafc",
                              color: "#334155",
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                          >
                            <Star size={16} />
                            Shortlist
                          </button>
                        )}

                        <button
                          className="applicant-accept-btn animated-button"
                          onClick={() => handleAccept(applicant)}
                          disabled={actionLoading === applicant.id}
                        >
                          <CheckCircle size={16} />
                          Accept
                        </button>

                        <button
                          className="applicant-reject-btn"
                          onClick={() => handleReject(applicant)}
                          disabled={actionLoading === applicant.id}
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="applicants-empty">
            <div className="applicants-empty-icon">
              <Users size={38} />
            </div>
            <h3>
              {selectedJobId
                ? "No Applicants Yet"
                : "No Job Selected"}
            </h3>
            <p>
              {selectedJobId
                ? "Applicants will appear here when workers apply for this job."
                : "Select a job from above or post a job to manage applicants."}
            </p>
          </div>
        )}
      </section>

      {/* =========================================
          PROFILE MODAL
          ========================================= */}
      {selectedApplicant && (
        <div
          className="applicant-modal-overlay"
          onClick={() => setSelectedApplicant(null)}
        >
          <div
            className="applicant-modal visual-applicant-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-modal-btn"
              onClick={() => setSelectedApplicant(null)}
              type="button"
            >
              <X size={20} />
            </button>

            <div className="modal-profile-avatar applicant-modal-avatar">
              <UserRound size={36} />
            </div>

            <div className="modal-profile-header">
              <span className="modal-profile-label">WORKER PROFILE</span>
              <h2>{selectedApplicant.name}</h2>
              <p className="modal-job-title">{selectedApplicant.jobTitle}</p>
            </div>

            <div className="modal-status-row">
              <span
                className={getStatusClass(selectedApplicant.displayStatus)}
              >
                {selectedApplicant.displayStatus === "Accepted" && (
                  <CheckCircle size={14} />
                )}
                {selectedApplicant.displayStatus === "Rejected" && (
                  <XCircle size={14} />
                )}
                {selectedApplicant.displayStatus === "Shortlisted" && (
                  <Star size={14} />
                )}
                {selectedApplicant.displayStatus === "Pending" && (
                  <Clock3 size={14} />
                )}
                {selectedApplicant.displayStatus}
              </span>
            </div>

            <div className="modal-profile-info">
              <div>
                <MapPin size={18} />
                <span>{selectedApplicant.location}</span>
              </div>

              <div>
                <Briefcase size={18} />
                <span>{selectedApplicant.experience} experience</span>
              </div>

              <div>
                <Phone size={18} />
                <span>{selectedApplicant.phone}</span>
              </div>

              <div>
                <Mail size={18} />
                <span>{selectedApplicant.email}</span>
              </div>
            </div>

            {selectedApplicant.skills.length > 0 && (
              <div className="modal-skills">
                <div className="modal-skills-title">
                  <Award size={18} />
                  <h3>Skills & Languages</h3>
                </div>

                <div className="applicant-skills modal-skills-list">
                  {selectedApplicant.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {(selectedApplicant.displayStatus === "Pending" ||
              selectedApplicant.displayStatus === "Shortlisted") && (
              <div className="modal-action-buttons">
                <button
                  className="applicant-accept-btn animated-button"
                  onClick={() => handleAccept(selectedApplicant)}
                  disabled={actionLoading === selectedApplicant.id}
                >
                  <CheckCircle size={17} />
                  Accept Applicant
                </button>

                <button
                  className="applicant-reject-btn"
                  onClick={() => handleReject(selectedApplicant)}
                  disabled={actionLoading === selectedApplicant.id}
                >
                  <XCircle size={17} />
                  Reject Applicant
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Applicants;