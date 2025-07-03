import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthIllustrationCarousel from "../../reusables/AuthIllustrationCarousel";
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
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
    setSuccess("Registration successful! Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 1500);
    setIsSubmitting(false);
  };

  return (
    <div className="auth-split-screen">
      <div className="auth-form-side">
        <form className="auth-form-modern" onSubmit={handleSubmit}>
          <h2 className="auth-form-title-modern">Sign Up</h2>
          <p className="auth-form-subtitle-modern">
          Create an account to continue!
          </p>
          {error && (
            <div className="auth-form-error" style={{ marginBottom: 6 }}>
              {error}
            </div>
          )}
          {success && (
            <div className="auth-form-success" style={{ marginBottom: 6 }}>
              {success}
            </div>
          )}
          <div className="form-row-modern">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="form-input-modern"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-row-modern">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className="form-input-modern"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-row-modern">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input-modern"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-row-modern">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input-modern"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-row-modern">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input-modern"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isSubmitting}
              required
            />
          </div>
          <button
            type="submit"
            className="login-btn-modern"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
          <div className="auth-form-footer-modern">
            Already have an account?{" "}
            <Link to="/login" className="auth-form-link-modern">
              Sign In
            </Link>
          </div>
        </form>
      </div>
      <div className="auth-illustration-side purple-gradient-bg">
        <AuthIllustrationCarousel />
      </div>
    </div>
  );
};

export default RegisterPage;
