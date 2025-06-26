import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import FaanLogo from "../../../../public/images/faan-logo.svg";
import { Link } from "react-router-dom";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Invalid email or password");
      }
    } catch {
      setError("An error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-split-screen">
      <div className="auth-left">
        <div className="auth-left-content">
          <img src={FaanLogo} alt="FAAN Logo" className="auth-logo-large" />
          <h1 className="auth-brand-title">FAAN Customer Portal</h1>
          <p className="auth-brand-desc">
            Welcome to the Federal Airports Authority of Nigeria customer
            portal. Manage your bookings, payments, and more with ease.
          </p>
        </div>
      </div>
      <div className="auth-right">
        <div className="login-card split">
          <div className="login-header">
            <h1 className="login-title">Sign In</h1>
            <p className="login-subtitle">Access your FAAN account</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isSubmitting}
                required
              />
            </div>
            <button
              type="submit"
              className="login-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="loading-spinner">
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke="#ffffff"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.3"
                    />
                    <path
                      d="M18 10a8 8 0 0 1-8 8"
                      stroke="#ffffff"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 10 10"
                        to="360 10 10"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </path>
                  </svg>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          <div className="login-footer">
            <div className="login-register-link">
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </div>
            <p className="demo-credentials">
              <strong>Demo Credentials:</strong>
              <br />
              <span>
                Admin — Email: admin@faan.gov.ng | Password: password123
              </span>
              <br />
              <span>
                Customer — Email: customer@faan.gov.ng | Password: customer123
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
