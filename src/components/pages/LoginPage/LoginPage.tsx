import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import AuthIllustrationCarousel from "../../reusables/AuthIllustrationCarousel";
import MessageToast from "../../reusables/MessageToast";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "email": {
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        return "";
      }

      case "password": {
        if (!value) return "Password is required";
        return "";
      }

      default:
        return "";
    }
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    const isEmailValid =
      email.trim() !== "" && validateField("email", email) === "";
    const isPasswordValid =
      password.trim() !== "" && validateField("password", password) === "";
    return isEmailValid && isPasswordValid;
  };

  // Handle field changes with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    const error = validateField("email", value);
    setValidationErrors((prev) => ({ ...prev, email: error }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    const error = validateField("password", value);
    setValidationErrors((prev) => ({ ...prev, password: error }));
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Final validation check
    if (!isFormValid()) {
      showToast("Please fix the errors in the form", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        showToast("Invalid email or password", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("An error occurred during login", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-split-screen">
      <MessageToast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
      <div className="auth-form-side">
        <form className="auth-form-modern" onSubmit={handleSubmit}>
          <h2 className="auth-form-title-modern">Sign in to your Account</h2>
          <p className="auth-form-subtitle-modern">
            Enter your email and password details to access your account
          </p>
          <div className="form-row-modern">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className={`form-input-modern ${
                validationErrors.email ? "error" : ""
              }`}
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              disabled={isSubmitting}
              required
            />
            {validationErrors.email && (
              <span className="validation-error">{validationErrors.email}</span>
            )}
          </div>
          <div className="form-row-modern">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className={`form-input-modern ${
                validationErrors.password ? "error" : ""
              }`}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              disabled={isSubmitting}
              required
            />
            {validationErrors.password && (
              <span className="validation-error">
                {validationErrors.password}
              </span>
            )}
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
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
          <div className="auth-form-footer-modern">
            Don't have an account?{" "}
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
