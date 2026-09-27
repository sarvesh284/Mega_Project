import { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Clock,
  Users,
  FileText,
  Calendar,
  Layers,
  Navigation,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../api/catalog.api";
import { createJob } from "../api/jobs.api";
import { useLanguage } from "../context/LanguageContext";
import "../App.css";

function PostJob() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Tomorrow's date default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [city, setCity] = useState("Pune");
  const [address, setAddress] = useState("");
  const [payType, setPayType] = useState("daily");
  const [payAmount, setPayAmount] = useState("");
  const [requiredWorkers, setRequiredWorkers] = useState("1");
  const [startDate, setStartDate] = useState(defaultDateStr);
  const [shiftType, setShiftType] = useState("day");
  const [coordinates, setCoordinates] = useState([73.8567, 18.5204]); // Default Pune
  const [locationStatus, setLocationStatus] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getCategories(language || "en")
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : res?.docs || [];
        setCategories(list);
        if (list.length > 0) {
          setCategoryId(list[0]._id);
        }
      })
      .catch(() => {
        if (isMounted) setCategories([]);
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });
    return () => {
      isMounted = false;
    };
  }, [language]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported by your browser");
      return;
    }

    setLocationStatus("Fetching location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        setCoordinates(coords);
        setLocationStatus(`Coordinates: ${coords[1].toFixed(2)}, ${coords[0].toFixed(2)}`);
      },
      () => {
        setLocationStatus("Could not fetch location; using default (Pune)");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);

    if (!categoryId) {
      setError("Please select a job category");
      return;
    }

    if (!payAmount || Number(payAmount) <= 0) {
      setError("Please enter a valid pay amount");
      return;
    }

    setSubmitting(true);

    const body = {
      title: { en: title.trim() },
      ...(description.trim() ? { description: { en: description.trim() } } : {}),
      categoryId,
      coordinates: coordinates || [73.8567, 18.5204],
      city: city.trim() || undefined,
      address: address.trim() || undefined,
      payType,
      payAmount: Number(payAmount),
      requiredWorkers: Number(requiredWorkers) || 1,
      startDate: startDate || defaultDateStr,
      originalLanguage: "en",
      shiftType,
    };

    try {
      await createJob(body);
      navigate("/employer-dashboard");
    } catch (err) {
      setError(err.message || "Failed to post job. Please check all required fields.");
      if (Array.isArray(err.fieldErrors)) {
        setFieldErrors(err.fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="post-job-page">
      <div className="post-job-container">
        <Link to="/employer-dashboard" className="back-link">
          ← Back to Dashboard
        </Link>

        <div className="post-job-card">
          <div className="post-job-header">
            <div className="post-job-icon">
              <Briefcase size={30} />
            </div>

            <div>
              <h1>Post a New Job</h1>
              <p>Create a job posting and find the right skilled worker.</p>
            </div>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
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

          <form onSubmit={handleSubmit}>
            {/* Job Title */}
            <div className="form-group">
              <label>Job Title (English)</label>
              <div className="input-wrapper">
                <Briefcase size={19} />
                <input
                  type="text"
                  placeholder="e.g. Electrician, Construction Helper..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Job Category */}
            <div className="form-group">
              <label>Job Category</label>
              <div className="input-wrapper">
                <Layers size={19} />
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  {loadingCategories ? (
                    <option value="" disabled>
                      Loading categories...
                    </option>
                  ) : categories.length === 0 ? (
                    <option value="" disabled>
                      No categories available (Seed database)
                    </option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name?.en || cat.name || cat._id}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Job Description */}
            <div className="form-group">
              <label>Job Description</label>
              <div className="textarea-wrapper">
                <FileText size={19} />
                <textarea
                  placeholder="Describe the job responsibilities and details..."
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* City & Address */}
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <div className="input-wrapper">
                  <MapPin size={19} />
                  <input
                    type="text"
                    placeholder="e.g. Pune, Kolhapur"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Specific Address / Area</label>
                <div className="input-wrapper">
                  <MapPin size={19} />
                  <input
                    type="text"
                    placeholder="e.g. Swargate, Bus Stand Road"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Pay Type & Pay Amount */}
            <div className="form-row">
              <div className="form-group">
                <label>Pay Type</label>
                <div className="input-wrapper">
                  <Clock size={19} />
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value)}
                  >
                    <option value="daily">Daily Wage</option>
                    <option value="monthly">Monthly Salary</option>
                    <option value="fixed">Fixed Contract</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Pay Amount (₹)</label>
                <div className="input-wrapper">
                  <IndianRupee size={19} />
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 600 for daily, 15000 for monthly"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Required Workers, Start Date & Shift */}
            <div className="form-row">
              <div className="form-group">
                <label>Required Workers</label>
                <div className="input-wrapper">
                  <Users size={19} />
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 2"
                    value={requiredWorkers}
                    onChange={(e) => setRequiredWorkers(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <div className="input-wrapper">
                  <Calendar size={19} />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Shift Type</label>
                <div className="input-wrapper">
                  <Clock size={19} />
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value)}
                  >
                    <option value="day">Day Shift</option>
                    <option value="night">Night Shift</option>
                    <option value="flexible">Flexible Shift</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Geolocation optional button */}
            <div className="form-group">
              <label>Location Coordinates (Default: Pune)</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  type="button"
                  className="profile-edit-btn"
                  onClick={handleUseLocation}
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <Navigation size={16} />
                  Use Current Location
                </button>
                {locationStatus && (
                  <small style={{ color: "#2563eb", fontWeight: "500" }}>
                    {locationStatus}
                  </small>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="post-job-submit"
              disabled={submitting}
            >
              {submitting ? "Posting Job..." : "Post Job"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostJob;