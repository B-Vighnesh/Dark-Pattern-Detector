import React, { useState, useEffect } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import "../assets/ReportIssue.css";

// --- Configuration and API Calls ---

const CONFIG = {
  API_URL: "http://localhost:8080/feedback/add",
};

const STATUS = {
  IDLE: "idle",
  SUBMITTING: "submitting",
  SUCCESS: "success",
  ERROR: "error",
};

// This function is now correct because the formData object it receives
// will have the right keys: { url, issue, message }
const submitFeedback = async (formData, googleToken) => {
  console.log(googleToken)
  const response = await fetch(CONFIG.API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${googleToken}`,
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error("Submission failed with status: " + response.status);
  }

  return response.json();
};

// --- Child Component for the Form ---

const FeedbackForm = ({ userEmail, googleToken, onLogout }) => {
  // State is correctly structured for the backend
  const [formData, setFormData] = useState({
    url: "",
    issue: "",
    message: "",
  });
  const [status, setStatus] = useState(STATUS.IDLE);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(STATUS.SUBMITTING);

    try {
      await submitFeedback(formData, googleToken);
      setStatus(STATUS.SUCCESS);
      setFormData({ url: "", issue: "", message: "" }); // Reset form
      
      setTimeout(() => {
        onLogout();
      }, 2000);

    } catch (err) {
      console.error("Error submitting feedback:", err);
      setStatus(STATUS.ERROR);
    }
  };

  return (
    <>
      <div className="verified-info">
        <p>✅ Verified as <b>{userEmail}</b></p>
        <button onClick={onLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <form className="feedback-form" onSubmit={handleSubmit}>
        <h3>Step 2: Submit Your Feedback</h3>

        <div className="form-group">
          <label htmlFor="url">Website URL</label>
          <input
            type="url"
            id="url"
            name="url"
            placeholder="https://example.com"
            value={formData.url}
            onChange={handleChange}
            required
            disabled={status === STATUS.SUCCESS}
          />
        </div>

        <div className="form-group">
          {/* FIX: Corrected label's htmlFor to "issue" */}
          <label htmlFor="issue">Type of Issue</label> 
          <select
             // FIX: Corrected id and name to "issue" to match state and backend
            id="issue"
            name="issue"
            value={formData.issue}
            onChange={handleChange}
            required
            disabled={status === STATUS.SUCCESS}
          >
            <option value="">--Choose an option--</option>
            <option value="false-positive">False Positive</option>
            <option value="false-negative">False Negative</option>
            <option value="suggestion">Feature Suggestion</option>
            <option value="feedback">General Feedback</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
           {/* FIX: Corrected label's htmlFor to "message" */}
          <label htmlFor="message">Description</label>
          <textarea
            // FIX: Corrected id and name to "message" to match state and backend
            id="message"
            name="message"
            rows="5"
            placeholder="Describe the issue or suggestion..."
            value={formData.message}
            onChange={handleChange}
            required
            disabled={status === STATUS.SUCCESS}
          ></textarea>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === STATUS.SUBMITTING || status === STATUS.SUCCESS}
        >
          {status === STATUS.SUBMITTING ? "Submitting..." : "Submit Feedback"}
        </button>
        
        {status === STATUS.SUCCESS && (
          <p className="status-message status-success">
            ✅ Success! You will be logged out shortly.
          </p>
        )}
        {status === STATUS.ERROR && (
          <p className="status-message status-error">
            Could not submit feedback. Please try again.
          </p>
        )}
      </form>
    </>
  );
};

// --- Main Parent Component ---

const ReportIssue = () => {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (credentialResponse) => {
    if (!credentialResponse.credential) {
      console.error("Login failed: no credential returned.");
      return;
    }

    try {
      const decoded = jwt_decode(credentialResponse.credential);
      if (!decoded.email_verified) {
        alert("⚠️ Please verify your Google email before continuing.");
        return;
      }
      setUser({
        email: decoded.email,
        token: credentialResponse.credential,
      });
    } catch (error) {
      console.error("Failed to decode JWT:", error);
    }
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
  };

  const handleLoginError = () => {
    console.error("Google Login Failed");
    alert("Login failed. Please try again.");
  };

return (
  <section id="report-issue" className="section report-issue">
    <div className="container">
      <h2 className="section-title">Report an Issue or Share Feedback</h2>
      <p className="section-subtitle">
        <span>Whether you've found a bug, spotted an inaccuracy, or have an idea for a new feature, your input is invaluable.</span>
        <strong>Follow our simple two-step process to share your thoughts.</strong>
      </p>

      {!user ? (
        <div className="verify-step">
          <h3>Step 1: Verify Your Email</h3>
          
          <div className="verification-explanation">
            <h4>Why We Ask for Verification</h4>
            <p>
              We ask for a quick sign-in to ensure the feedback we receive is genuine and actionable. This helps us:
            </p>
            <ul>
              <li><b>Prevent spam</b> and focus engineering time on real user issues.</li>
              <li><b>Follow up with you</b> if we need more details to resolve your report.</li>
              <li><b>Build a trusted feedback loop</b> with our community of users.</li>
            </ul>
          </div>
          
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              text="continue_with"
              theme="outline" 
              size="large"
            />
          </div>
        </div>
      ) : (
        <FeedbackForm
          userEmail={user.email}
          googleToken={user.token}
          onLogout={handleLogout}
        />
      )}
    </div>
  </section>
);
};

export default ReportIssue;
