import React, { useState } from "react";
import { Link } from "react-router-dom";
import FaanLogo from "../../../../public/images/faan-logo.svg";
import "./RegisterPage.css";

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Registration successful! (API integration coming soon)");
    }, 1200);
  };

  return (
    <div className="auth-split-screen">
      <div className="auth-left">
        <div className="auth-left-content">
          <img src={FaanLogo} alt="FAAN Logo" className="auth-logo-large" />
          <h1 className="auth-brand-title">FAAN Customer Portal</h1>
          <p className="auth-brand-desc">
            Create your account to manage bookings, payments, and more with the
            Federal Airports Authority of Nigeria.
          </p>
        </div>
      </div>
      <div className="auth-right">
        <div className="register-card split">
          <div className="register-header">
            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">Register for a new FAAN account</p>
          </div>
          <form className="register-form" onSubmit={handleSubmit}>
            {error && <div className="register-error">{error}</div>}
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="form-input"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="form-input"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={form.email}
                onChange={handleChange}
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
                name="password"
                className="form-input"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={isSubmitting}
                required
              />
            </div>
            <button
              type="submit"
              className="register-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </form>
          <div className="register-footer">
            <span>Already have an account? </span>
            <Link to="/login" className="register-login-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
