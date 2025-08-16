import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import MessageToast from "../../reusables/MessageToast";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import FaanLogo from "/images/faan-logo.svg";
import OnboardingImage from "/images/onboarding-image.svg";
import "./OneTimeOnboardingPage.css";

interface OneTimeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

const OneTimeOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<OneTimeFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
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

  // Improved email regex (RFC 5322 Official Standard)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName": {
        if (!value.trim()) return "First name is required";
        if (value.trim().length < 2)
          return "First name must be at least 2 characters";
        if (!/^[a-zA-Z\s'-]+$/.test(value))
          return "First name can only contain letters, spaces, hyphens, and apostrophes";
        return "";
      }
      case "lastName": {
        if (!value.trim()) return "Last name is required";
        if (value.trim().length < 2)
          return "Last name must be at least 2 characters";
        if (!/^[a-zA-Z\s'-]+$/.test(value))
          return "Last name can only contain letters, spaces, hyphens, and apostrophes";
        return "";
      }
      case "email": {
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        return "";
      }
      case "phoneNumber": {
        if (!value.trim()) return "Phone number is required";
        const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
        if (!phoneRegex.test(value.replace(/\s/g, "")))
          return "Please enter a valid Nigerian phone number";
        return "";
      }
      default:
        return "";
    }
  };

  // Memoize form validation to prevent infinite re-renders
  const formValidation = useMemo(() => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof OneTimeFormData]);
      // Only show error if field has been touched
      if (error && touchedFields[key]) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    return { errors: newErrors, isValid };
  }, [formData, touchedFields]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Mark field as touched when user starts typing
    if (!touchedFields[name]) {
      setTouchedFields((prev) => ({ ...prev, [name]: true }));
    }
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

    // Mark all fields as touched when form is submitted
    const allFieldsTouched = {
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
    };
    setTouchedFields(allFieldsTouched);

    // Re-validate with all fields marked as touched
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof OneTimeFormData]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    if (!isValid) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call - simulate sending OTP
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Store form data in session storage for the next step
      sessionStorage.setItem("oneTimeFormData", JSON.stringify(formData));

      showToast("OTP sent to your email! Please check your inbox.", "success");

      // Navigate to OTP verification page
      setTimeout(() => {
        navigate("/one-time-otp");
      }, 2000);
    } catch (error) {
      console.error("Error sending OTP:", error);
      showToast("Failed to send OTP. Please try again.", "error");
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
                Quick access to airport services for one-time customers
                <span className="highlight"> No account needed.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <form className="auth-form-modern" onSubmit={handleSubmit}>
          <h2 className="auth-form-title-modern desktop-only">
            One-Time Service
          </h2>
          <h2 className="auth-form-title-modern mobile-only">
            Quick Service Access
          </h2>
          <p className="auth-form-subtitle-modern desktop-only">
            Need airport services without creating an account?{" "}
            <span className="highlight">Get started in minutes.</span>
          </p>
          <p className="auth-form-subtitle-modern mobile-only">
            Enter your details to access airport services quickly
          </p>

          <div className="form-row-side-by-side">
            <div className="form-row-modern">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={`form-input-modern ${
                  formValidation.errors.firstName ? "error" : ""
                }`}
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                disabled={isSubmitting}
                required
              />
              {formValidation.errors.firstName && (
                <span className="validation-error">
                  {formValidation.errors.firstName}
                </span>
              )}
            </div>

            <div className="form-row-modern">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={`form-input-modern ${
                  formValidation.errors.lastName ? "error" : ""
                }`}
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                disabled={isSubmitting}
                required
              />
              {formValidation.errors.lastName && (
                <span className="validation-error">
                  {formValidation.errors.lastName}
                </span>
              )}
            </div>
          </div>

          <div className="form-row-side-by-side">
            <div className="form-row-modern">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input-modern ${
                  formValidation.errors.email ? "error" : ""
                }`}
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@gmail.com"
                disabled={isSubmitting}
                required
              />
              {formValidation.errors.email && (
                <span className="validation-error">
                  {formValidation.errors.email}
                </span>
              )}
            </div>

            <div className="form-row-modern">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className={`form-input-modern ${
                  formValidation.errors.phoneNumber ? "error" : ""
                }`}
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+234 801 234 5678"
                disabled={isSubmitting}
                required
              />
              {formValidation.errors.phoneNumber && (
                <span className="validation-error">
                  {formValidation.errors.phoneNumber}
                </span>
              )}
            </div>
          </div>

          <div className="form-row-modern form-row-remember">
            <Link to="/login" className="forgot-link">
              Back to Login
            </Link>
          </div>

          <GradientButton
            type="submit"
            fullWidth
            disabled={isSubmitting || !formValidation.isValid}
            loading={isSubmitting}
          >
            SEND OTP
          </GradientButton>

          <p
            className="auth-form-subtitle-modern mobile-only"
            style={{ marginTop: "10px", textAlign: "center" }}
          >
            Already have an account?{" "}
            <a href="/login" className="auth-form-link-modern">
              Sign In
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default OneTimeOnboardingPage;
