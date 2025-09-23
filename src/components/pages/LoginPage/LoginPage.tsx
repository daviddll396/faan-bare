import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import MessageToast from "../../reusables/MessageToast";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import Input from "../../reusables/Input/Input";
import FaanLogo from "/images/faan-logo.svg";
import OnboardingImage from "/images/boarding1.jpg";
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
      const result = await login(email, password);
      if (result.success) {
        navigate("/dashboard");
      } else {
        // Show server-provided message if available, otherwise a default
        showToast(result.message ?? "Invalid email or password", "error");
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
            </Link>{" "}
            or use
            <Link to="/one-time" className="auth-form-link-modern">
              One-Time Service
            </Link>
            .
          </p>
          <p className="auth-form-subtitle-modern mobile-only">
            Enter your email and password details to log in
          </p>
          <div className="form-row-modern">
            <Input
              label="Email"
              type="email"
              id="email"
              className={`${validationErrors.email ? "error" : ""}`}
              value={email}
              onChange={handleEmailChange}
              placeholder="example@gmail.com"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-row-modern">
            <Input
              label="Password"
              type="password"
              id="password"
              className={`${validationErrors.password ? "error" : ""}`}
              value={password}
              onChange={handlePasswordChange}
              placeholder="********"
              disabled={isSubmitting}
              required
              passwordToggle
            />
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

          {/* <div className="one-time-service-option">
            <div className="divider">
              <span>or</span>
            </div>
            <p className="one-time-text">
              Need airport services without creating an account?{" "}
              <Link to="/one-time" className="one-time-link">
                use one-time service
              </Link>
            </p>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
