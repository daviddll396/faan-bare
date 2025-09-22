import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MessageToast from "../../reusables/MessageToast";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import FaanLogo from "/images/faan-logo.svg";
import CryptoJS from "crypto-js";
import "./IndemnityFormPage.css";
import OnboardingImage from "/images/onboarding-image.svg";

// API Base URL - configure for different environments
const getApiBaseUrl = (): string => {
  // Detect if we're in production by checking the hostname
  const isProduction =
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname.includes("netlify.app") ||
    !window.location.hostname.includes("localhost");

  if (isProduction) {
    // In production (Vercel), use the proxy path
    return "";
  }
  // Local development - use the direct API server
  return "http://197.253.19.78:9091";
};

const API_BASE_URL = getApiBaseUrl();
const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/auth/faan/register`,
};

// AES encryption function (CBC with PKCS5 padding)
const encryptAESCBC = (
  plaintext: string,
  secret: string,
  iv: string
): string => {
  const key = CryptoJS.enc.Utf8.parse(secret);
  const ivBytes = CryptoJS.enc.Utf8.parse(iv);
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv: ivBytes,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  return encrypted.toString(); // base64-encoded
};

// AES decryption function (CBC with PKCS5 padding)
const decryptAESCBC = (
  encryptedText: string,
  secret: string,
  iv: string
): string => {
  const key = CryptoJS.enc.Utf8.parse(secret);
  const ivBytes = CryptoJS.enc.Utf8.parse(iv);
  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
    iv: ivBytes,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};

interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  customerType: string;
  password: string;
  nin: string;
  dob: string;
  cacNumber: string | null;
  [key: string]: string | null; // For additional fields
}

const IndemnityFormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  useEffect(() => {
    // Get customer data from location state or sessionStorage
    const data =
      location.state?.customerData ||
      sessionStorage.getItem("registrationData");
    if (data) {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      setCustomerData(parsedData);
    } else {
      // If no data, redirect back to registration
      navigate("/register");
    }
  }, [location.state, navigate]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  const downloadIndemnityDocument = () => {
    // Create a link to download the actual FAAN indemnity form
    const link = document.createElement("a");
    link.href = "/FAAN_FORM"; // Path to the Word document in public folder
    link.download = `FAAN_Indemnity_Form_${customerData?.firstName}_${
      customerData?.lastName
    }_${new Date().toISOString().split("T")[0]}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAccept = async () => {
    setIsLoading(true);

    try {
      // Download the document
      downloadIndemnityDocument();

      // Store acceptance in sessionStorage
      sessionStorage.setItem("indemnityAccepted", "true");
      sessionStorage.setItem("indemnityDate", new Date().toISOString());

      // Configuration for encryption
      const secretKey = "Dyny+oPMeF1VfkOjDjgxJOxjq8Mpo7A/"; // 32 bytes (AES-256)
      const ivKey = "RVFU9+dRKhYkiCZI"; // 16 bytes

      // Build the request body for registration
      const requestBody: Record<string, string | boolean | null> = {
        firstName: customerData!.firstName,
        lastName: customerData!.lastName,
        dob: customerData!.dob || "",
        phoneNumber: customerData!.phoneNumber,
        address: customerData!.address,
        password: customerData!.password,
        email: customerData!.email,
        nin: customerData!.nin || "",
        userType: "CUSTOMER", // Set userType for all customer registrations
        creationType: "CUSTOMER", // Set creationType for customer registration
        customerType: customerData!.customerType,
      };

      // Add type-specific fields
      if (customerData!.customerType === "INDIVIDUAL") {
        requestBody.cacNumber = null;
      } else if (customerData!.customerType === "CORPORATE") {
        requestBody.cacNumber = customerData!.cacNumber;
        // Add corporate-specific fields if needed
        if (customerData!.businessName)
          requestBody.businessName = customerData!.businessName;
        if (customerData!.natureOfBusiness)
          requestBody.natureOfBusiness = customerData!.natureOfBusiness;
        if (customerData!.serviceType)
          requestBody.serviceType = customerData!.serviceType;
        if (customerData!.yearOfIncorporation)
          requestBody.yearOfIncorporation = customerData!.yearOfIncorporation;
        if (customerData!.registrationNumber)
          requestBody.registrationNumber = customerData!.registrationNumber;
      } else if (customerData!.customerType === "GOVERNMENT") {
        requestBody.cacNumber = null;
        // Add government-specific fields if needed
        if (customerData!.officeName)
          requestBody.officeName = customerData!.officeName;
        if (customerData!.officeType)
          requestBody.officeType = customerData!.officeType;
        if (customerData!.state) requestBody.state = customerData!.state;
        if (customerData!.serviceType)
          requestBody.serviceType = customerData!.serviceType;
      } else if (customerData!.customerType === "FAMILY") {
        requestBody.cacNumber = null;
        // Add family-specific fields if needed
        if (customerData!.gender) requestBody.gender = customerData!.gender;
        if (customerData!.isStudent)
          requestBody.isStudent = customerData!.isStudent;
        if (customerData!.meansOfId)
          requestBody.meansOfId = customerData!.meansOfId;
      }

      console.log("Register request body:", requestBody);

      // Encrypt the body
      const body = JSON.stringify(requestBody);
      const encryptedPayload = encryptAESCBC(body, secretKey, ivKey);

      // Make the API call
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Client-Auth": "Basic dGVzdDp0ZXN0",
          "X-Source": "web",
        },
        body: encryptedPayload,
      });

      // Get the raw response text (encrypted)
      const rawResponseText = await response.text();
      let decryptedResponse;
      try {
        decryptedResponse = decryptAESCBC(rawResponseText, secretKey, ivKey);
      } catch {
        console.log(
          "Failed to decrypt response. Encrypted text:",
          rawResponseText
        );
        showToast("Failed to process server response", "error");
        return;
      }

      // Parse the decrypted JSON
      let responseData;
      try {
        responseData = JSON.parse(decryptedResponse);
      } catch {
        console.log("Failed to parse decrypted response:", decryptedResponse);
        showToast("Invalid server response format", "error");
        return;
      }

      // Check if registration was successful
      if (
        responseData.status === true &&
        (responseData.statusCode === 200 || responseData.statusCode === 201)
      ) {
        showToast(
          "Registration successful! Redirecting to login...",
          "success"
        );

        // Clear stored data
        sessionStorage.removeItem("registrationData");

        // Navigate to login
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorMessage = responseData.message || "Registration failed";
        showToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error accepting indemnity:", error);
      showToast(
        "Error processing indemnity acceptance. Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    showToast(
      "Indemnity agreement declined. Redirecting to registration.",
      "error"
    );

    // Clear any stored registration data
    sessionStorage.removeItem("registrationData");
    sessionStorage.removeItem("indemnityAccepted");

    // Redirect back to registration
    setTimeout(() => {
      navigate("/register");
    }, 2000);
  };

  if (!customerData) {
    return (
      <div className="auth-split-screen indemnity-full">
        <div className="auth-form-side">
          <div className="auth-form-modern">
            <h2 className="auth-form-title-modern">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="auth-form-modern">
          <h2 className="auth-form-title-modern">Indemnity Agreement</h2>
          <p className="auth-form-subtitle-modern">
            Please review and accept the indemnity agreement to complete your
            registration
          </p>

          <div className="indemnity-document-section">
            {/* <h3>Indemnity Agreement</h3> */}
            <div className="document-preview">
              {customerData && (
                <div className="indemnity-paper">
                  <div className="indemnity-letterhead">
                    <div className="indemnity-logo-wrap">
                      <img
                        src={FaanLogo}
                        alt="FAAN"
                        className="indemnity-logo"
                      />
                    </div>
                    <div className="indemnity-org">
                      <div className="org-name">
                        FEDERAL AIRPORTS AUTHORITY OF NIGERIA
                      </div>
                      <div className="org-address">
                        Corporate Headquarters Murtala Mohammed Int'l Airport,
                        Domestic Wing, Lagos, Nigeria
                      </div>
                    </div>
                  </div>
                  <div className="form-code">FORM: AC-AWS001L</div>
                  <div className="indemnity-title">INDEMNITY</div>

                  <div className="indemnity-body">
                    <p>
                      Pursuant to Part 4.2.1.7 Federal Airports Regulations 2xxx
                      (Nig CARs),
                    </p>
                    <p>
                      I/We{" "}
                      <span className="inline-blank">{`${customerData.firstName} ${customerData.lastName}`}</span>
                      <span>do hereby</span> unconditionally undertake to defend
                      the Federal Airports Authority of Nigeria (FAAN) or any of
                      its
                      <span className="linkish"> Directors</span> or Officers
                      against any suit or action howsoever arising out of the
                      registration or deregistration of the protocol services.
                    </p>
                    <p>
                      I/We further covenant and agree to hold the FAAN, its
                      <span className="linkish"> Directors</span> or Officers
                      harmless against any claim, demands and charges by
                      <span className="inline-blank">
                        {" "}
                        {`${customerData.firstName} ${customerData.lastName}`}{" "}
                      </span>
                      or any third persons for damages arising out of the
                      registration or deregistration of services.
                    </p>
                    <p className="given-this">
                      Given this{" "}
                      <span className="inline-blank small">
                        {new Date().getDate()}
                      </span>{" "}
                      day of
                      <span className="inline-blank small">
                        {" "}
                        {new Date().toLocaleString("default", {
                          month: "long",
                        })}{" "}
                      </span>
                      <span className="inline-blank small">
                        {new Date().getFullYear()}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="indemnity-actions">
            <p className="agreement-notice">
              By clicking "Accept & Download", you acknowledge that you have
              read, understood, and agree to the terms of this indemnity
              agreement.
            </p>

            <div className="action-buttons">
              <BorderButton
                text="Decline"
                onClick={handleDecline}
                className="decline-button"
              />
              <GradientButton
                onClick={handleAccept}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
              >
                Accept & Download Form
              </GradientButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndemnityFormPage;
