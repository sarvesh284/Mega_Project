import { useState, useEffect } from "react";
import {
  UserRound,
  MapPin,
  Phone,
  Briefcase,
  Edit3,
  Save,
  X,
  Star,
  Navigation,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getWorkerProfile, saveWorkerProfile } from "../api/profile.api";

import "../App.css";

function Profile() {
  const { user, refreshMe } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    city: "",
    experienceYears: 0,
    expectedPay: 0,
    bio: "",
    coordinates: null,
  });

  useEffect(() => {
    let isMounted = true;

    getWorkerProfile()
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setFormData({
            fullName: data.fullName || user?.name || "",
            phone: user?.phone || data.userId?.phone || "",
            email: user?.email || "",
            city: data.city || "",
            experienceYears: data.experienceYears || 0,
            expectedPay: data.expectedPay || 0,
            bio: data.bio || "Skilled professional looking for local opportunities.",
            coordinates: data.location?.coordinates || null,
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        // If 404 worker profile not found, populate with user defaults
        if (err.status !== 404) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser");
      return;
    }

    setLocationStatus("Fetching location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        setFormData((prev) => ({ ...prev, coordinates: coords }));
        setLocationStatus(`Location acquired (${coords[1].toFixed(2)}, ${coords[0].toFixed(2)})`);
      },
      () => {
        setLocationStatus("Unable to retrieve location");
      }
    );
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    const payload = {
      fullName: formData.fullName.trim() || user?.name || "Worker",
      city: formData.city.trim(),
      bio: formData.bio.trim(),
      experienceYears: Number(formData.experienceYears) || 0,
      expectedPay: Number(formData.expectedPay) || 0,
      ...(formData.coordinates ? { coordinates: formData.coordinates } : {}),
    };

    try {
      await saveWorkerProfile(payload);
      await refreshMe();
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page page-animate">
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page page-animate">
      {/* PROFILE HERO */}
      <section className="profile-hero">
        <div className="profile-hero-inner">
          <div className="profile-avatar-large">
            <UserRound size={48} />
          </div>

          <div className="profile-hero-info">
            <span className="profile-eyebrow">WORKER PROFILE</span>

            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="profile-edit-input"
                style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "8px" }}
              />
            ) : (
              <h1>{formData.fullName || user?.name || "Worker"}</h1>
            )}

            <div className="profile-job-title">
              <Briefcase size={17} />
              {formData.experienceYears} years experience
            </div>

            <div className="profile-location">
              <MapPin size={16} />
              {formData.city || "Location not set"}
            </div>
          </div>

          <div className="profile-hero-actions">
            {!isEditing ? (
              <button
                className="profile-edit-btn animated-button"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 size={18} />
                Edit Profile
              </button>
            ) : (
              <div className="profile-edit-actions">
                <button
                  className="profile-save-btn animated-button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  className="profile-cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  <X size={17} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PROFILE CONTENT */}
      <main className="profile-content">
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
            {error}
          </div>
        )}

        <div className="profile-main-grid">
          {/* LEFT COLUMN */}
          <div className="profile-main-column">
            {/* About */}
            <section className="profile-card">
              <div className="profile-card-heading">
                <div className="profile-card-icon">
                  <UserRound size={20} />
                </div>
                <div>
                  <span className="profile-section-label">ABOUT ME</span>
                  <h2>About</h2>
                </div>
              </div>

              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="profile-textarea"
                  rows="4"
                  placeholder="Describe your work experience and skills..."
                />
              ) : (
                <p className="profile-about-text">{formData.bio || "No description provided."}</p>
              )}
            </section>

            {/* Experience & Expected Pay */}
            <section className="profile-card">
              <div className="profile-card-heading">
                <div className="profile-card-icon">
                  <Briefcase size={20} />
                </div>
                <div>
                  <span className="profile-section-label">DETAILS</span>
                  <h2>Experience & Pay Expectations</h2>
                </div>
              </div>

              {isEditing ? (
                <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label style={{ fontSize: "0.85rem", color: "#64748b" }}>Experience (Years)</label>
                    <input
                      type="number"
                      name="experienceYears"
                      min="0"
                      value={formData.experienceYears}
                      onChange={handleChange}
                      className="profile-edit-input"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.85rem", color: "#64748b" }}>Expected Pay (₹)</label>
                    <input
                      type="number"
                      name="expectedPay"
                      min="0"
                      value={formData.expectedPay}
                      onChange={handleChange}
                      className="profile-edit-input"
                    />
                  </div>
                </div>
              ) : (
                <div className="profile-experience-card">
                  <div className="profile-experience-icon">
                    <Briefcase size={22} />
                  </div>
                  <div>
                    <h3>{formData.experienceYears} Years Experience</h3>
                    <p>Expected Pay: ₹{formData.expectedPay}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Location & GPS */}
            {isEditing && (
              <section className="profile-card">
                <div className="profile-card-heading">
                  <div className="profile-card-icon">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="profile-section-label">LOCATION</span>
                    <h2>GPS & Address</h2>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button
                    type="button"
                    className="profile-edit-btn"
                    onClick={handleUseLocation}
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", width: "fit-content" }}
                  >
                    <Navigation size={17} />
                    Use My Location
                  </button>

                  {locationStatus && (
                    <small style={{ color: "#2563eb", fontWeight: "500" }}>
                      {locationStatus}
                    </small>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <aside className="profile-side-column">
            {/* Contact Information */}
            <section className="profile-card">
              <div className="profile-card-heading">
                <div className="profile-card-icon">
                  <Phone size={20} />
                </div>
                <div>
                  <span className="profile-section-label">CONTACT</span>
                  <h2>Contact Information</h2>
                </div>
              </div>

              <div className="profile-contact-list">
                <div className="profile-contact-item">
                  <div className="profile-contact-icon">
                    <Phone size={17} />
                  </div>
                  <div>
                    <span>Mobile Number</span>
                    <strong>{formData.phone || "—"}</strong>
                  </div>
                </div>

                <div className="profile-contact-item">
                  <div className="profile-contact-icon">
                    <MapPin size={17} />
                  </div>
                  <div>
                    <span>City</span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="profile-edit-input"
                        placeholder="Enter city"
                      />
                    ) : (
                      <strong>{formData.city || "Not set"}</strong>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Profile Status */}
            <section className="profile-card profile-strength-card">
              <div className="profile-strength-icon">
                <Star size={22} />
              </div>
              <div>
                <span className="profile-section-label">PROFILE STATUS</span>
                <h3>Profile Active</h3>
                <p>Keep your details up to date for better job recommendations.</p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Profile;