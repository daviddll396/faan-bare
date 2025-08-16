import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import MessageToast from "../../reusables/MessageToast";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import FaanLogo from "/images/faan-logo.svg";
import OnboardingImage from "/images/onboarding-image.svg";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="auth-illustration-side">
        <div className="auth-outer-container">
          <div className="auth-inner-container">
            <img
              src={OnboardingImage}
              alt="Airport operations"
              className="auth-background-image"
            />
            <div className="auth-image-overlay">
              <img src={FaanLogo} alt="FAAN Logo" className="auth-logo" />
              <div className="auth-image-text">
                Seamless access to airport operations, services, and staff
                resources <span className="highlight">anytime, anywhere.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <form className="auth-form-modern" onSubmit={handleSubmit}>
          <h2 className="auth-form-title-modern desktop-only">Log In</h2>
          <h2 className="auth-form-title-modern mobile-only">
            Sign in to your account
          </h2>
          <p className="auth-form-subtitle-modern desktop-only">
            Don't have an account?{" "}
            <Link to="/register" className="auth-form-link-modern">
              Sign Up
            </Link>
          </p>
          <p className="auth-form-subtitle-modern mobile-only">
            Enter your email and password details to log in
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
              placeholder="example@gmail.com"
              disabled={isSubmitting}
              required
            />
            {validationErrors.email && (
              <span className="validation-error">{validationErrors.email}</span>
            )}
          </div>
          <div className="form-row-modern">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`form-input-modern ${
                  validationErrors.password ? "error" : ""
                }`}
                value={password}
                onChange={handlePasswordChange}
                placeholder="********"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validationErrors.password && (
              <span className="validation-error">
                {validationErrors.password}
              </span>
            )}
          </div>
          <div className="form-row-modern form-row-remember">
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>
          <GradientButton
            type="submit"
            fullWidth
            disabled={isSubmitting || !isFormValid()}
            loading={isSubmitting}
          >
            LOG IN
          </GradientButton>
          <p
            className="auth-form-subtitle-modern mobile-only"
            style={{ marginTop: "10px", textAlign: "center" }}
          >
            Don't have an account?{" "}
            <Link to="/register" className="auth-form-link-modern">
              Sign Up
            </Link>
          </p>

          <div className="one-time-service-option">
            <div className="divider">
              <span>or</span>
            </div>
            <p className="one-time-text">
              Need airport services without creating an account?{" "}
              <Link to="/one-time" className="one-time-link">
                use one-time service
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
