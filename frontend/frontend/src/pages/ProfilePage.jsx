
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  Mic,
  Star,
  Briefcase,
  HardHat,
  Camera,
  UserRound,
  Trash2,
  ImagePlus,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";

import * as workerProfileApi from "../api/workerProfile";
import * as employerProfileApi from "../api/employerProfile";
import * as workerSkillsApi from "../api/workerSkills";
import * as catalogApi from "../api/catalog";
import * as authApi from "../api/auth";

import { normalizeError } from "../api/client";
import { USER_ROLES } from "../utils/enums";

import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { ErrorBanner } from "../components/common/ErrorBanner";

import { WorkerProfileForm } from "../components/workers/WorkerProfileForm";
import { AvailabilityToggle } from "../components/workers/AvailabilityToggle";
import { WorkerSkillsManager } from "../components/workers/WorkerSkillsManager";
import { EmployerProfileForm } from "../components/employers/EmployerProfileForm";
import { RatingList } from "../components/reviews/RatingList";

import "./ProfilePage.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function ProfilePage() {
  const {
    user,
    workerProfile,
    employerProfile,
    refreshBootstrap,
  } = useAuth();

  const { t, language } = useLanguage();

  const roles = user?.roles || [];

  const isWorker = roles.includes(USER_ROLES.WORKER);
  const isEmployer = roles.includes(USER_ROLES.EMPLOYER);
  const hasBothRoles = isWorker && isEmployer;

  const [activeTab, setActiveTab] = useState(
    isWorker ? "worker" : "employer"
  );

  const [categories, setCategories] = useState([]);
  const [workerSkills, setWorkerSkills] = useState([]);
  const [catalogSkills, setCatalogSkills] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [addingRole, setAddingRole] = useState(null);

  const [profileImage, setProfileImage] = useState("");
  const [imageError, setImageError] = useState("");

  const fileInputRef = useRef(null);

  const lang = String(language || "en")
    .toLowerCase()
    .slice(0, 2);

  const labels = {
    profilePicture:
      lang === "mr"
        ? "प्रोफाइल फोटो"
        : lang === "hi"
        ? "प्रोफ़ाइल फ़ोटो"
        : "Profile Picture",

    addPhoto:
      lang === "mr"
        ? "फोटो जोडा"
        : lang === "hi"
        ? "फ़ोटो जोड़ें"
        : "Add Photo",

    changePhoto:
      lang === "mr"
        ? "फोटो बदला"
        : lang === "hi"
        ? "फ़ोटो बदलें"
        : "Change Photo",

    removePhoto:
      lang === "mr"
        ? "फोटो काढा"
        : lang === "hi"
        ? "फ़ोटो हटाएं"
        : "Remove Photo",

    photoHelp:
      lang === "mr"
        ? "JPG, PNG किंवा WebP फोटो निवडा. कमाल 5 MB."
        : lang === "hi"
        ? "JPG, PNG या WebP फ़ोटो चुनें। अधिकतम 5 MB।"
        : "Choose a JPG, PNG or WebP photo. Maximum 5 MB.",

    invalidType:
      lang === "mr"
        ? "कृपया JPG, PNG किंवा WebP फोटो निवडा."
        : lang === "hi"
        ? "कृपया JPG, PNG या WebP फ़ोटो चुनें।"
        : "Please select a JPG, PNG or WebP image.",

    tooLarge:
      lang === "mr"
        ? "फोटो 5 MB पेक्षा लहान असावा."
        : lang === "hi"
        ? "फ़ोटो 5 MB से छोटा होना चाहिए।"
        : "Photo must be smaller than 5 MB.",

    saveFailed:
      lang === "mr"
        ? "फोटो सेव करता आला नाही."
        : lang === "hi"
        ? "फ़ोटो सेव नहीं हो सका।"
        : "Could not save the photo.",

    worker:
      lang === "mr"
        ? "कामगार"
        : lang === "hi"
        ? "कामगार"
        : "Worker",

    employer:
      lang === "mr"
        ? "नियोक्ता"
        : lang === "hi"
        ? "नियोक्ता"
        : "Employer",

    localNotice:
      lang === "mr"
        ? "फोटो सध्या फक्त या ब्राउझरमध्ये सेव होतो."
        : lang === "hi"
        ? "फ़ोटो अभी केवल इस ब्राउज़र में सेव होता है।"
        : "Photo is currently saved only in this browser.",
  };

  const userId = user?._id || user?.id;

  const storageKey = userId
    ? `lokrozgar-profile-photo-${userId}-${activeTab}`
    : null;

  /* Load saved photo for the selected role */

  useEffect(() => {
    setImageError("");

    if (!storageKey) {
      setProfileImage("");
      return;
    }

    try {
      const savedImage = localStorage.getItem(storageKey);
      setProfileImage(savedImage || "");
    } catch {
      setProfileImage("");
    }
  }, [storageKey]);

  /* Existing catalog loading */

  useEffect(() => {
    catalogApi
      .getCategories()
      .then(setCategories)
      .catch(() => {});

    catalogApi
      .getSkills()
      .then(setCatalogSkills)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === "worker" && isWorker) {
      workerSkillsApi
        .getMine()
        .then(setWorkerSkills)
        .catch(() => {});
    }
  }, [activeTab, isWorker]);

  /* Profile photo upload */

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageError("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError(labels.invalidType);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError(labels.tooLarge);
      event.target.value = "";
      return;
    }

    if (!storageKey) {
      setImageError(labels.saveFailed);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      if (typeof imageData !== "string") {
        setImageError(labels.saveFailed);
        return;
      }

      try {
        localStorage.setItem(storageKey, imageData);
        setProfileImage(imageData);
      } catch {
        setImageError(labels.saveFailed);
      }
    };

    reader.onerror = () => {
      setImageError(labels.saveFailed);
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const handleRemovePhoto = () => {
    if (!storageKey) return;

    try {
      localStorage.removeItem(storageKey);
      setProfileImage("");
      setImageError("");
    } catch {
      setImageError(labels.saveFailed);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  /* Existing worker profile functionality */

  const handleSaveWorkerProfile = async (payload) => {
    setSaving(true);
    setError(null);

    try {
      await workerProfileApi.upsert(payload);
      await refreshBootstrap();
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setSaving(false);
    }
  };

  /* Existing employer profile functionality */

  const handleSaveEmployerProfile = async (payload) => {
    setSaving(true);
    setError(null);

    try {
      await employerProfileApi.upsert(payload);
      await refreshBootstrap();
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAvailabilityChange = async (value) => {
    try {
      await workerProfileApi.updateAvailability(value);
      await refreshBootstrap();
    } catch (err) {
      setError(normalizeError(err));
    }
  };

  const handleAddSkill = async (payload) => {
    await workerSkillsApi.add(payload);
    setWorkerSkills(await workerSkillsApi.getMine());
  };

  const handleRemoveSkill = async (id) => {
    await workerSkillsApi.remove(id);

    setWorkerSkills((prev) =>
      prev.filter((skill) => skill._id !== id)
    );
  };

  const handleAddRole = async (role) => {
    setAddingRole(role);
    setError(null);

    try {
      await authApi.addRole({
        role,
        fullName: user?.fullName || undefined,
      });

      await refreshBootstrap();
      setActiveTab(role);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setAddingRole(null);
    }
  };

  const profileName =
    activeTab === "worker"
      ? workerProfile?.fullName ||
        user?.fullName ||
        labels.worker
      : employerProfile?.businessName ||
        employerProfile?.fullName ||
        user?.fullName ||
        labels.employer;

  return (
    <div className="container profile-page page-animate">
      <h1 className="profile-page-title">
        {t("profile")}
      </h1>

      {/* WORKER / EMPLOYER TABS */}

      {hasBothRoles && (
        <div className="profile-tabs">
          <button
            type="button"
            className={
              activeTab === "worker" ? "active" : ""
            }
            onClick={() => setActiveTab("worker")}
          >
            {t("profile.title")}
          </button>

          <button
            type="button"
            className={
              activeTab === "employer" ? "active" : ""
            }
            onClick={() => setActiveTab("employer")}
          >
            {t("employerProfile")}
          </button>
        </div>
      )}

      {error && <ErrorBanner error={error} />}

      {/* PROFILE PICTURE */}

      {(isWorker || isEmployer) && (
        <Card className="profile-photo-section">
          <div className="profile-photo-heading">
            <Camera size={21} aria-hidden="true" />
            <h2>{labels.profilePicture}</h2>
          </div>

          <div className="profile-photo-content">
            <div className="profile-photo-avatar">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={labels.profilePicture}
                  className="profile-photo-image"
                />
              ) : (
                <UserRound
                  size={54}
                  aria-hidden="true"
                />
              )}

              <button
                type="button"
                className="profile-photo-camera"
                onClick={openFilePicker}
                aria-label={labels.addPhoto}
                title={labels.addPhoto}
              >
                <Camera size={17} aria-hidden="true" />
              </button>
            </div>

            <div className="profile-photo-details">
              <h3>{profileName}</h3>

              <span className="profile-photo-role">
                {activeTab === "worker"
                  ? labels.worker
                  : labels.employer}
              </span>

              <p>{labels.photoHelp}</p>

              <div className="profile-photo-actions">
                <button
                  type="button"
                  className="profile-add-photo-btn"
                  onClick={openFilePicker}
                >
                  <ImagePlus
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    {profileImage
                      ? labels.changePhoto
                      : labels.addPhoto}
                  </span>
                </button>

                {profileImage && (
                  <button
                    type="button"
                    className="profile-remove-photo-btn"
                    onClick={handleRemovePhoto}
                  >
                    <Trash2
                      size={17}
                      aria-hidden="true"
                    />

                    <span>{labels.removePhoto}</span>
                  </button>
                )}
              </div>

              {imageError && (
                <p
                  className="profile-photo-error"
                  role="alert"
                >
                  {imageError}
                </p>
              )}

              <p className="profile-photo-notice">
                {labels.localNotice}
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="profile-photo-file-input"
            aria-label={labels.addPhoto}
          />
        </Card>
      )}

      {/* ADD ANOTHER ROLE */}

      {!hasBothRoles && (isWorker || isEmployer) && (
        <Card className="profile-role-cta animated-card">
          <div>
            <h2>
              {isWorker ? (
                <>
                  <Briefcase
                    size={20}
                    aria-hidden="true"
                  />
                  {t("wantToHire")}
                </>
              ) : (
                <>
                  <HardHat
                    size={20}
                    aria-hidden="true"
                  />
                  {t("lookingForWork")}
                </>
              )}
            </h2>

            <p>
              {isWorker
                ? t("addEmployerAccessDesc")
                : t("addWorkerAccessDesc")}
            </p>
          </div>

          <Button
            onClick={() =>
              handleAddRole(
                isWorker
                  ? USER_ROLES.EMPLOYER
                  : USER_ROLES.WORKER
              )
            }
            disabled={addingRole !== null}
            className="animated-button"
          >
            {addingRole
              ? t("common.loading")
              : isWorker
              ? t("becomeEmployer")
              : t("becomeWorker")}
          </Button>
        </Card>
      )}

      {/* WORKER PROFILE */}

      {activeTab === "worker" && isWorker && (
        <>
          <Card className="profile-voice-cta animated-card">
            <div>
              <h2>
                <Mic size={20} aria-hidden="true" />
                {t("voiceProfile")}
              </h2>

              <p>{t("voiceProfileDesc")}</p>
            </div>

            <Link
              to="/voice-profile"
              className="btn btn-primary btn-lg animated-button"
            >
              <Mic size={18} aria-hidden="true" />

              <span>
                {workerProfile
                  ? t("updateWithVoice")
                  : t("createWithVoice")}
              </span>
            </Link>
          </Card>

          {workerProfile && (
            <Card className="profile-section">
              <h2>
                {t("voice.guided.availability.label")}
              </h2>

              <AvailabilityToggle
                availability={workerProfile.availability}
                onChange={handleAvailabilityChange}
              />
            </Card>
          )}

          <Card className="profile-section">
            <h2>{t("personalDetails")}</h2>

            <WorkerProfileForm
              key={
                workerProfile?.updatedAt ||
                workerProfile?._id ||
                "new-worker-profile"
              }
              profile={workerProfile}
              categories={categories}
              saving={saving}
              onSave={handleSaveWorkerProfile}
            />
          </Card>

          {workerProfile && (
            <Card className="profile-section">
              <h2>{t("common.skills")}</h2>

              <WorkerSkillsManager
                skills={workerSkills}
                catalogSkills={catalogSkills}
                onAdd={handleAddSkill}
                onRemove={handleRemoveSkill}
              />
            </Card>
          )}

          {user && (
            <Card className="profile-section">
              <h2>
                <Star size={18} aria-hidden="true" />
                {t("reviews")}
              </h2>

              <RatingList
                userId={user._id}
                ratingAvg={workerProfile?.ratingAvg}
                ratingCount={workerProfile?.ratingCount}
              />
            </Card>
          )}
        </>
      )}

      {/* EMPLOYER PROFILE */}

      {activeTab === "employer" && isEmployer && (
        <>
          <Card className="profile-voice-cta animated-card">
            <div>
              <h2>
                <Mic size={20} aria-hidden="true" />
                {t("profile.employer.voiceBanner.title")}
              </h2>

              <p>
                {t("profile.employer.voiceBanner.desc")}
              </p>
            </div>

            <Link
              to="/voice-profile?role=employer"
              className="btn btn-primary btn-lg animated-button"
            >
              <Mic size={18} aria-hidden="true" />

              <span>
                {employerProfile
                  ? t("updateWithVoice")
                  : t("profile.employer.voiceBanner.action")}
              </span>
            </Link>
          </Card>

          <Card className="profile-section">
            <h2>{t("businessDetails")}</h2>

            <EmployerProfileForm
              key={
                employerProfile?.updatedAt ||
                employerProfile?._id ||
                "new-employer-profile"
              }
              profile={employerProfile}
              saving={saving}
              onSave={handleSaveEmployerProfile}
            />
          </Card>

          {user && (
            <Card className="profile-section">
              <h2>
                <Star size={18} aria-hidden="true" />
                {t("reviews")}
              </h2>

              <RatingList
                userId={user._id}
                ratingAvg={employerProfile?.ratingAvg}
                ratingCount={employerProfile?.ratingCount}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
