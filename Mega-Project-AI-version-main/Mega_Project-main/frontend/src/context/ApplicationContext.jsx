import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext.jsx";
import * as applicationsApi from "../api/applications.api.js";
import { toUiApplication } from "../api/adapters.js";

const ApplicationContext = createContext();

function ApplicationProvider({ children }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApplications = useCallback(() => {
    return Promise.resolve().then(() => {
      if (!user || user.role !== "worker") {
        setApplications([]);
        setLoading(false);
        return;
      }

      setError(null);
      return applicationsApi
        .mine()
        .then((data) => {
          const rawList = Array.isArray(data) ? data : [];
          const mapped = rawList.map(toUiApplication).filter(Boolean);
          setApplications(mapped);
        })
        .catch((err) => {
          setError(err);
          setApplications([]);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const applyForJob = async (job) => {
    const targetJobId = typeof job === "object" && job !== null ? job.raw?._id || job.id : job;
    try {
      await applicationsApi.apply({ jobId: targetJobId });
    } catch (err) {
      if (err.status !== 409) {
        throw err;
      }
    } finally {
      await fetchApplications();
    }
  };

  const withdraw = async (applicationId) => {
    await applicationsApi.withdraw(applicationId);
    await fetchApplications();
  };

  const hasApplied = (jobId) => {
    if (!jobId) return false;
    const targetIdStr = String(jobId);
    return applications.some(
      (app) =>
        (String(app.jobId) === targetIdStr || String(app.id) === targetIdStr || String(app.raw?._id) === targetIdStr) &&
        app.status?.toLowerCase() !== "withdrawn"
    );
  };

  const updateApplicationStatus = (jobId, status) => {
    setApplications((prev) =>
      prev.map((app) =>
        String(app.jobId) === String(jobId) ? { ...app, status } : app
      )
    );
  };

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        loading,
        error,
        applyForJob,
        withdraw,
        hasApplied,
        reload: fetchApplications,
        updateApplicationStatus,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

function useApplications() {
  return useContext(ApplicationContext);
}

export { ApplicationProvider, useApplications };