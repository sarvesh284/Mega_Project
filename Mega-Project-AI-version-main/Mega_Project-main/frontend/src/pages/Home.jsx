import { useState } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Wrench,
  Droplets,
  Car,
  Package,
  HardHat,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  IndianRupee,
  Clock3,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

import { useLanguage } from "../context/LanguageContext";
import { useApi } from "../hooks/useApi";
import { searchJobs } from "../api/jobs.api";
import { toUiJob } from "../api/adapters";

function Home() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");

  const { data } = useApi(
    () => searchJobs({ limit: 6, lang: language }),
    [language]
  );

  const rawDocs = data?.docs || (Array.isArray(data) ? data : []);
  const featuredJobs = rawDocs.map(toUiJob).filter(Boolean);

  const categories = [
    {
      name: "Electrician",
      icon: Wrench,
      description: "Wiring & repair jobs",
      className: "stagger-1",
    },
    {
      name: "Plumber",
      icon: Droplets,
      description: "Pipe & plumbing work",
      className: "stagger-2",
    },
    {
      name: "Driver",
      icon: Car,
      description: "Driving opportunities",
      className: "stagger-3",
    },
    {
      name: "Delivery Partner",
      icon: Package,
      description: "Delivery & logistics",
      className: "stagger-4",
    },
    {
      name: "Construction Worker",
      icon: HardHat,
      description: "Construction work",
      className: "stagger-5",
    },
    {
      name: "Security Guard",
      icon: ShieldCheck,
      description: "Security jobs",
      className: "stagger-6",
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate("/jobs");
  };

  return (
    <div className="app page-animate">
      {/* HERO SECTION */}
      <section className="hero visual-hero">
        <div className="hero-content">
          <div className="hero-badge fade-in">
            <Sparkles size={17} />
            AI-Powered Job Matching
          </div>

          <h1 className="hero-title slide-up">
            Find the Right Job.
            <br />
            <span>Build Your Future.</span>
          </h1>

          <p className="hero-description fade-in">
            LOKROZGAR AI connects skilled workers with trusted job opportunities near them.
          </p>

          {/* SEARCH */}
          <form className="search-box visual-search-box slide-up" onSubmit={handleSearch}>
            <div className="search-field visual-search-field">
              <Search size={23} />
              <div>
                <span className="search-label">What job are you looking for?</span>
                <input
                  type="text"
                  placeholder="Electrician, Driver, Plumber..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="search-field visual-search-field">
              <MapPin size={23} />
              <div>
                <span className="search-label">Where?</span>
                <input
                  type="text"
                  placeholder="Kolhapur, Pune, Mumbai..."
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="search-btn visual-search-btn">
              <Search size={21} />
              Find Jobs
            </button>
          </form>

          {/* QUICK ACTION */}
          <div className="hero-quick-actions fade-in">
            <Link to="/jobs" className="quick-action">
              <span className="quick-action-icon">
                <Briefcase size={20} />
              </span>
              <span>Browse All Jobs</span>
              <ArrowRight size={17} />
            </Link>

            <Link to="/register" className="quick-action">
              <span className="quick-action-icon">👷</span>
              <span>Create Worker Account</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section className="categories visual-categories">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">EXPLORE OPPORTUNITIES</span>
            <h2>Find Jobs by Category</h2>
            <p>Choose a job category and discover opportunities made for your skills.</p>
          </div>

          <Link to="/jobs" className="view-all-link">
            View All Jobs
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="category-grid visual-category-grid">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                to="/jobs"
                className={`category-card visual-category-card animated-card fade-in ${category.className}`}
                key={category.name}
              >
                <div className="category-icon animated-icon">
                  <Icon size={32} />
                </div>

                <div className="category-card-content">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>

                <div className="category-arrow">
                  <ArrowRight size={19} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED JOBS SECTION (If jobs exist) */}
      {featuredJobs.length > 0 && (
        <section className="jobs-results-section" style={{ padding: "0 8% 40px" }}>
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">RECENT LISTINGS</span>
              <h2>Featured Jobs</h2>
            </div>
            <Link to="/jobs" className="view-all-link">
              View All
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="jobs-grid">
            {featuredJobs.slice(0, 6).map((job) => (
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
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SIMPLE TRUST SECTION */}
      <section className="home-trust-section">
        <div className="trust-card">
          <div className="trust-icon">👷</div>
          <div>
            <h3>Built for Workers</h3>
            <p>Simple, visual and easy-to-use job discovery for everyone.</p>
          </div>
        </div>

        <div className="trust-card">
          <div className="trust-icon">🤝</div>
          <div>
            <h3>Connect Directly</h3>
            <p>Discover opportunities from employers looking for your skills.</p>
          </div>
        </div>

        <div className="trust-card">
          <div className="trust-icon">⚡</div>
          <div>
            <h3>Find Faster</h3>
            <p>AI-powered matching helps you discover relevant jobs quickly.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;