import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import MessageToast from "../../reusables/MessageToast";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import FaanLogo from "/images/faan-logo.svg";
import OnboardingImage from "/images/onboarding-image.svg";
import "./OneTimeOtpPage.css";

const OneTimeOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const { setGuestUser } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: number;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);
    }
  };

  const isOtpValid = (): boolean => {
    return otp.every((digit) => digit !== "") && otp.join("").length === 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOtpValid()) {
      showToast("Please enter the complete 6-digit OTP", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call - simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful verification
      const otpCode = otp.join("");
      if (otpCode === "123456") {
        // Mock valid OTP
        showToast("OTP verified successfully!", "success");

        // Get form data from sessionStorage and set guest user
        const formData = sessionStorage.getItem("oneTimeFormData");
        if (formData) {
          const parsedFormData = JSON.parse(formData);
          setGuestUser(parsedFormData);
        }

        // Navigate to service selection page
        setTimeout(() => {
          navigate("/services");
        }, 2000);
      } else {
        showToast("Invalid OTP. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      showToast("Failed to verify OTP. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true);
    setResendCountdown(60); // 60 seconds countdown

    try {
      // Mock API call - simulate resending OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast("OTP resent to your email!", "success");
    } catch (error) {
      console.error("Error resending OTP:", error);
      showToast("Failed to resend OTP. Please try again.", "error");
      setResendDisabled(false);
      setResendCountdown(0);
    }
  };

  // Get user email from session storage
  const formData = sessionStorage.getItem("oneTimeFormData");
  const userEmail = formData ? JSON.parse(formData).email : "your email";

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
                Verify your email to continue with airport services
                <span className="highlight"> Secure and fast.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <form
          className="auth-form-modern one-time-form"
          onSubmit={handleSubmit}
        >
          <h2 className="auth-form-title-modern desktop-only">Verify OTP</h2>
          <h2 className="auth-form-title-modern mobile-only">
            Enter Verification Code
          </h2>
          <p className="auth-form-subtitle-modern desktop-only">
            We've sent a 6-digit code to{" "}
            <span className="highlight">{userEmail}</span>
          </p>
          <p className="auth-form-subtitle-modern mobile-only">
            Enter the 6-digit code sent to your email
          </p>

          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className="otp-input"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isSubmitting}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <GradientButton
            type="submit"
            fullWidth
            disabled={isSubmitting || !isOtpValid()}
            loading={isSubmitting}
          >
            VERIFY OTP
          </GradientButton>

          <div className="resend-otp-container">
            <p className="resend-otp-text">Didn't receive the code?</p>
            <button
              type="button"
              className="resend-otp-button"
              onClick={handleResendOtp}
              disabled={resendDisabled}
            >
              {resendDisabled ? `Resend in ${resendCountdown}s` : "Resend OTP"}
            </button>
          </div>

          <p
            className="auth-form-subtitle-modern mobile-only"
            style={{ marginTop: "20px", textAlign: "center" }}
          >
            <a href="/one-time" className="auth-form-link-modern">
              ← Back to form
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default OneTimeOtpPage;
