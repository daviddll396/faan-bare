import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import AuthIllustrationCarousel from "../../reusables/AuthIllustrationCarousel";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-split-screen">
      <div className="auth-form-side">
        <form className="auth-form-modern" onSubmit={handleSubmit}>
          <h2 className="auth-form-title-modern">Sign in to your Account</h2>
          <p className="auth-form-subtitle-modern">
          Enter your email and password details to access your account 
          </p>
          {error && <div className="auth-form-error">{error}</div>}
          <div className="form-row-modern">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-input-modern"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="form-input-modern"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-row-modern form-row-remember">
            {/* <label className="remember-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="remember-checkbox"
              />
              Remember me
            </label> */}
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="login-btn-modern"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Log In"}
          </button>
          <div className="auth-form-footer-modern">
            Don’t have an account?{" "}
            <Link to="/register" className="auth-form-link-modern">
              Sign Up
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

export default LoginPage;
