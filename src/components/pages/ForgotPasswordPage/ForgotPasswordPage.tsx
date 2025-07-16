import { useState } from "react";
import { Link } from "react-router-dom";
import AuthIllustrationCarousel from "../../reusables/AuthIllustrationCarousel";
import MessageToast from "../../reusables/MessageToast";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import "./ForgotPasswordPage.css";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
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

  const validateEmail = (value: string): string => {
    if (!value.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setValidationError(validateEmail(e.target.value));
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, isVisible: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const error = validateEmail(email);
    setValidationError(error);
    if (error) {
      showToast("Please enter a valid email address", "error");
      setIsSubmitting(false);
      return;
    }
    // Simulate API call
    setTimeout(() => {
      showToast(
        "If an account with that email exists, a password reset link has been sent.",
        "success"
      );
      setIsSubmitting(false);
    }, 1200);
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
          <h2 className="auth-form-title-modern">Forgot Password</h2>
          <p className="auth-form-subtitle-modern">
            Enter your email address and we'll send you a password reset link.
          </p>
          <div className="form-row-modern" style={{ marginBottom: "15px" }}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className={`form-input-modern ${validationError ? "error" : ""}`}
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              disabled={isSubmitting}
              required
            />
            {validationError && (
              <span className="validation-error">{validationError}</span>
            )}
          </div>
          <GradientButton
            type="submit"
            fullWidth
            disabled={isSubmitting || !!validationError || !email}
            
          >
            {isSubmitting ? "SENDING..." : "SEND RESET LINK"}
          </GradientButton>
          <div className="auth-form-footer-modern">
            <Link to="/login" className="auth-form-link-modern">
              Back to Login
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

export default ForgotPasswordPage;
