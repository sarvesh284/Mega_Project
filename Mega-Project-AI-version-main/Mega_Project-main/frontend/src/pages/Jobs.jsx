import React from "react";
import {
  Search,
  MapPin,
  Briefcase,
  IndianRupee,
  Clock3,
  Filter,
  X,
  ArrowRight,
  Mic,
  MicOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../App.css";

import { useLanguage } from "../context/LanguageContext";
import { useApi } from "../hooks/useApi";
import { searchJobs } from "../api/jobs.api";
import { toUiJob } from "../api/adapters";

function Jobs() {
  const { language } = useLanguage();

  const { data, loading, error } = useApi(
    () => searchJobs({ limit: 50, lang: language }),
    [language]
  );

  const rawDocs = data?.docs || (Array.isArray(data) ? data : []);
  const jobs = rawDocs.map(toUiJob).filter(Boolean);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [locationFilter, setLocationFilter] = React.useState("");
  const [jobTypeFilter, setJobTypeFilter] = React.useState("");
  const [experienceFilter, setExperienceFilter] = React.useState("");

  const [isListening, setIsListening] = React.useState(false);

  const [voiceSupported] = React.useState(
    () => typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );

  const recognitionRef = React.useRef(null);

  React.useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setSearchTerm(spokenText);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognition.stop();
    };
  }, []);

  React.useEffect(() => {
    if (!recognitionRef.current) {
      return;
    }

    const languageMap = {
      en: "en-IN",
      hi: "hi-IN",
      mr: "mr-IN",
    };

    recognitionRef.current.lang = languageMap[language] || "en-IN";
  }, [language]);

  const handleVoiceSearch = () => {
    if (!voiceSupported) {
      alert("Voice search is not supported in this browser. Please use Google Chrome.");
      return;
    }

    if (!recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    recognitionRef.current.start();
  };

  const filteredJobs = jobs.filter((job) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      search === "" ||
      job.title.toLowerCase().includes(search) ||
      job.company.toLowerCase().includes(search) ||
      job.skills.some((skill) => skill.toLowerCase().includes(search));

    const matchesLocation =
      locationFilter === "" ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase().trim());

    const matchesJobType =
      jobTypeFilter === "" ||
      job.type.toLowerCase().includes(jobTypeFilter.toLowerCase());

    const matchesExperience =
      experienceFilter === "" ||
      job.experience.includes(experienceFilter);

    return (
      matchesSearch &&
      matchesLocation &&
      matchesJobType &&
      matchesExperience
    );
  });

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setJobTypeFilter("");
    setExperienceFilter("");
  };

  return (
    <div className="jobs-page page-animate">
      <section className="jobs-hero">
        <div className="jobs-hero-content">
          <div className="jobs-hero-badge">
            <Briefcase size={17} />
            Find Your Opportunity
          </div>

          <h1>
            Find Jobs That
            <span> Match Your Skills</span>
          </h1>

          <p>
            Search for jobs based on your skills, location and experience.
          </p>
        </div>
      </section>

      <section className="jobs-filter-section">
        <div className="jobs-filter-box visual-jobs-filter">
          <div className="jobs-search-row">
            <div className="jobs-filter-input visual-filter-input">
              <Search size={22} />

              <div>
                <span className="filter-label">Search Job</span>
                <input
                  type="text"
                  placeholder="Electrician, Driver, Plumber..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="Search jobs by title, company, or skill"
                />
              </div>
            </div>

            <button
              type="button"
              className={`voice-search-btn ${isListening ? "listening" : ""}`}
              onClick={handleVoiceSearch}
              aria-label={isListening ? "Stop voice search" : "Start voice search"}
              title={isListening ? "Stop listening" : "Search using your voice"}
            >
              {isListening ? <MicOff size={21} /> : <Mic size={21} />}
            </button>
          </div>

          <div className="jobs-filter-row">
            <div className="jobs-filter-input visual-filter-input">
              <MapPin size={21} />

              <div>
                <span className="filter-label">Location</span>
                <input
                  type="text"
                  placeholder="City or area..."
                  value={locationFilter}
                  onChange={(event) => setLocationFilter(event.target.value)}
                  aria-label="Filter jobs by location"
                />
              </div>
            </div>

            <div className="jobs-filter-input visual-filter-input">
              <Filter size={21} />

              <div>
                <span className="filter-label">Job Type</span>
                <select
                  value={jobTypeFilter}
                  onChange={(event) => setJobTypeFilter(event.target.value)}
                  aria-label="Filter jobs by type"
                >
                  <option value="">All Types</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div className="jobs-filter-input visual-filter-input">
              <Clock3 size={21} />

              <div>
                <span className="filter-label">Experience</span>
                <select
                  value={experienceFilter}
                  onChange={(event) => setExperienceFilter(event.target.value)}
                  aria-label="Filter jobs by experience"
                >
                  <option value="">Any Experience</option>
                  <option value="0-2 years">0-2 years</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="2-5 years">2-5 years</option>
                </select>
              </div>
            </div>
          </div>

          {(searchTerm || locationFilter || jobTypeFilter || experienceFilter) && (
            <div className="clear-filter-container">
              <button
                type="button"
                className="clear-filter-btn"
                onClick={clearFilters}
              >
                <X size={16} />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="jobs-results-section">
        <div className="results-header">
          <h2>
            Available Jobs <span>({loading ? "..." : filteredJobs.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="no-jobs visual-no-jobs">
            <p>Loading jobs from backend...</p>
          </div>
        ) : error ? (
          <div className="no-jobs visual-no-jobs">
            <p style={{ color: "#ef4444" }}>
              {error.message || "Failed to load jobs."}
            </p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <Link
                to={`/job/${job.id}`}
                state={{ job: job.raw }}
                className="job-card visual-job-card"
                key={job.id}
              >
                <div className="job-card-header">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                  </div>

                  <ArrowRight className="job-card-arrow" size={21} />
                </div>

                <div className="job-card-details">
                  <span>
                    <MapPin size={16} />
                    {job.location}
                  </span>

                  <span>
                    <Clock3 size={16} />
                    {job.type}
                  </span>

                  <span>{job.experience}</span>
                </div>

                <div className="job-card-bottom">
                  <div className="job-salary">
                    <IndianRupee size={17} />
                    <strong>{job.salary}</strong>
                  </div>

                  <div className="job-card-skills">
                    {job.skills.map((skill) => (
                      <span className="job-card-skill" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-jobs visual-no-jobs">
            <div className="no-jobs-icon">
              <Search size={40} />
            </div>

            <h3>No Jobs Found</h3>

            <p>
              Try changing your search or filters to find more opportunities.
            </p>

            <button
              className="clear-filter-btn large-action-btn secondary"
              onClick={clearFilters}
              type="button"
            >
              <X size={17} />
              Clear All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Jobs;