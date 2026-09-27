import {
  ArrowLeft,
  Briefcase,
  MapPin,
  IndianRupee,
  Clock3,
  UserRound,
  CheckCircle,
  Send,
  Building2,
  ShieldCheck,
} from "lucide-react";

import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import { useApplications } from "../context/ApplicationContext";
import { useAuth } from "../context/AuthContext";
import { findJobById } from "../api/jobs.api";
import { apply as applyApi } from "../api/applications.api";
import { toUiJob } from "../api/adapters";

import "../App.css";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { applyForJob, hasApplied } = useApplications();
  const { user } = useAuth();

  const [job, setJob] = useState(() => {
    if (location.state?.job) {
      return toUiJob(location.state.job);
    }
    return null;
  });

  const [loading, setLoading] = useState(!job);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!job && id) {
      let isMounted = true;
      findJobById(id)
        .then((res) => {
          if (isMounted) {
            if (res) {
              setJob(toUiJob(res));
            } else {
              setJob(null);
            }
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setFetchError(err);
            setLoading(false);
          }
        });
      return () => {
        isMounted = false;
      };
    }
  }, [id, job]);

  if (loading) {
    return (
      <div className="job-details-page page-animate">
        <div className="job-not-found">
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !job) {
    return (
      <div className="job-details-page page-animate">
        <div className="job-not-found">
          <Briefcase size={45} />
          <h2>Job Not Found</h2>
          <p>{fetchError?.message || "The job you are looking for does not exist."}</p>
          <Link to="/jobs" className="back-to-jobs-btn">
            <ArrowLeft size={18} />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const alreadyApplied = hasApplied(job.id) || (job.raw?._id && hasApplied(job.raw._id));
  const applicationSubmitted = submitted || alreadyApplied;

  const handleApply = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "worker") {
      return;
    }

    setApplyError(null);
    setSubmitting(true);

    const realJobId = job.raw?._id || job.id || id;

    try {
      await applyApi({ jobId: realJobId });
      setSubmitted(true);
      applyForJob({ id: realJobId, ...job });
    } catch (err) {
      if (err.status === 409) {
        setSubmitted(true);
      } else if (err.status === 503) {
        setApplyError("AI service unavailable, try later");
      } else {
        setApplyError(err.message || "Failed to submit application");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="job-details-page page-animate">
      <div className="job-details-topbar">
        <Link to="/jobs" className="back-jobs-link">
          <ArrowLeft size={19} />
          Back to Jobs
        </Link>
      </div>

      <section className="job-details-hero">
        <div className="job-company-icon">
          <Briefcase size={40} />
        </div>

        <div className="job-details-heading">
          <span className="job-details-badge">
            <ShieldCheck size={15} />
            Verified Opportunity
          </span>

          <h1>{job.title}</h1>

          <div className="job-company-name">
            <Building2 size={19} />
            <span>{job.company}</span>
          </div>
        </div>
      </section>

      <section className="job-quick-info">
        <div className="job-info-box">
          <MapPin size={22} />
          <div>
            <span>Location</span>
            <strong>{job.location}</strong>
          </div>
        </div>

        <div className="job-info-box">
          <IndianRupee size={22} />
          <div>
            <span>Salary</span>
            <strong>{job.salary}</strong>
          </div>
        </div>

        <div className="job-info-box">
          <Clock3 size={22} />
          <div>
            <span>Job Type</span>
            <strong>{job.type}</strong>
          </div>
        </div>

        <div className="job-info-box">
          <UserRound size={22} />
          <div>
            <span>Experience</span>
            <strong>{job.experience}</strong>
          </div>
        </div>
      </section>

      <div className="job-details-layout">
        <main className="job-details-content">
          <section className="job-detail-section">
            <div className="job-section-title">
              <div className="job-section-icon">
                <Briefcase size={20} />
              </div>
              <h2>About This Job</h2>
            </div>

            <p className="job-description">{job.description}</p>
          </section>

          <section className="job-detail-section">
            <div className="job-section-title">
              <div className="job-section-icon">
                <CheckCircle size={20} />
              </div>
              <h2>Required Skills</h2>
            </div>

            <div className="job-detail-skills">
              {job.skills.map((skill) => (
                <span className="job-detail-skill" key={skill}>
                  <CheckCircle size={15} />
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section className="job-detail-section">
            <div className="job-section-title">
              <div className="job-section-icon">
                <ShieldCheck size={20} />
              </div>
              <h2>What You Will Do</h2>
            </div>

            <ul className="job-responsibilities">
              <li>Perform assigned work safely and responsibly.</li>
              <li>Follow workplace instructions and safety guidelines.</li>
              <li>Maintain good quality and timely completion of work.</li>
              <li>Communicate clearly with the employer and team.</li>
            </ul>
          </section>
        </main>

        <aside className="job-apply-card">
          <div className="apply-card-icon">
            <Send size={25} />
          </div>

          <h2>Interested in this job?</h2>

          <p>
            Apply now and let the employer know you are interested.
          </p>

          {applyError && (
            <div style={{
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "10px 14px",
              borderRadius: "6px",
              marginBottom: "16px",
              fontSize: "0.85rem"
            }}>
              {applyError}
            </div>
          )}

          {applicationSubmitted ? (
            <div className="application-success">
              <CheckCircle size={28} />
              <div>
                <strong>Application Submitted!</strong>
                <span>Your application has been sent successfully.</span>
              </div>
            </div>
          ) : (
            <button
              className="apply-job-btn animated-button large-action-btn primary"
              onClick={handleApply}
              disabled={submitting}
            >
              <Send size={19} />
              {submitting
                ? "Applying..."
                : user
                ? user.role === "worker"
                  ? "Apply Now"
                  : "Worker Account Required"
                : "Login to Apply"}
            </button>
          )}

          <div className="apply-card-note">
            <ShieldCheck size={17} />
            <span>Your application information is kept secure.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default JobDetails;