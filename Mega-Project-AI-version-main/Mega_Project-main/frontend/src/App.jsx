import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WorkerDashboard from "./pages/WorkerDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import PostJob from "./pages/PostJob";
import Applicants from "./pages/Applicants";
import Profile from "./pages/Profile";

import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <Routes>

        {/* Public Pages */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/jobs"
          element={<Jobs />}
        />

        <Route
          path="/jobs/:id"
          element={<JobDetails />}
        />

        <Route
          path="/job/:id"
          element={<JobDetails />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Worker Pages */}

        <Route
          path="/worker-dashboard"
          element={
            <ProtectedRoute role="worker">
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute role="worker">
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Employer Pages */}

        <Route
          path="/employer-dashboard"
          element={
            <ProtectedRoute role="employer">
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-job"
          element={
            <ProtectedRoute role="employer">
              <PostJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applicants"
          element={
            <ProtectedRoute role="employer">
              <Applicants />
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  );
}

export default App;