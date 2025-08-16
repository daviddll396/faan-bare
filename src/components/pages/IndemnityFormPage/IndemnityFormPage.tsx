import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MessageToast from "../../reusables/MessageToast";
import GradientButton from "../../reusables/GradientButton/GradientButton";
import BorderButton from "../../reusables/BorderButton/BorderButton";
import FaanLogo from "/images/faan-logo.svg";
import OnboardingImage from "/images/onboarding-image.svg";
import CryptoJS from "crypto-js";
import "./IndemnityFormPage.css";

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

  const generateIndemnityDocument = (): string => {
    if (!customerData) return "";

    const currentDate = new Date().toLocaleDateString();
    const customerName = `${customerData.firstName} ${customerData.lastName}`;
    const customerType = customerData.customerType;

    return `
INDEMNITY AGREEMENT

Date: ${currentDate}

This Indemnity Agreement ("Agreement") is entered into between:

Federal Airports Authority of Nigeria (FAAN)
[FAAN Address]
(hereinafter referred to as "FAAN")

AND

${customerName}
${customerData.address}
Email: ${customerData.email}
Phone: ${customerData.phoneNumber}
Customer Type: ${customerType}
(hereinafter referred to as "Customer")

WHEREAS:
1. The Customer wishes to access and utilize airport services provided by FAAN;
2. FAAN requires an indemnity agreement as a condition for providing such services;
3. Both parties wish to establish their respective rights and obligations;

NOW THEREFORE, the parties agree as follows:

1. INDEMNIFICATION
The Customer hereby agrees to indemnify, defend, and hold harmless FAAN, its officers, directors, employees, agents, and representatives from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to:
   a) The Customer's use of FAAN services;
   b) Any breach of this Agreement by the Customer;
   c) Any negligent or intentional acts or omissions by the Customer;
   d) Any violation of applicable laws or regulations by the Customer.

2. LIMITATION OF LIABILITY
FAAN's liability shall be limited to the extent permitted by applicable law. FAAN shall not be liable for any indirect, incidental, special, consequential, or punitive damages.

3. COMPLIANCE WITH LAWS
The Customer agrees to comply with all applicable laws, regulations, and FAAN policies while using FAAN services.

4. TERMINATION
This Agreement may be terminated by either party with written notice. The indemnification obligations shall survive termination.

5. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of Nigeria.

6. ENTIRE AGREEMENT
This Agreement constitutes the entire understanding between the parties regarding the subject matter hereof.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

FAAN Representative: _________________
Date: ${currentDate}

Customer: ${customerName}
Date: ${currentDate}
Signature: _________________

Customer Details:
- Full Name: ${customerName}
- Email: ${customerData.email}
- Phone: ${customerData.phoneNumber}
- Address: ${customerData.address}
- Customer Type: ${customerType}
- Agreement Date: ${currentDate}
    `.trim();
  };

  const downloadIndemnityDocument = () => {
    const documentContent = generateIndemnityDocument();
    const blob = new Blob([documentContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `indemnity-agreement-${customerData?.firstName}-${
      customerData?.lastName
    }-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      const requestBody: any = {
        firstName: customerData!.firstName,
        lastName: customerData!.lastName,
        email: customerData!.email,
        password: customerData!.password,
        phoneNumber: customerData!.phoneNumber,
        address: customerData!.address,
        customerType: customerData!.customerType,
      };

      // Add type-specific fields
      if (customerData!.customerType === "INDIVIDUAL") {
        requestBody.nin = customerData!.nin;
        requestBody.dob = customerData!.dob;
        requestBody.cacNumber = null;
      } else if (customerData!.customerType === "CORPORATE") {
        requestBody.nin = "";
        requestBody.dob = "";
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
        requestBody.nin = "";
        requestBody.dob = "";
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
        requestBody.nin = customerData!.nin;
        requestBody.dob = customerData!.dob;
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
      <div className="auth-split-screen">
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
                  resources{" "}
                  <span className="highlight">anytime, anywhere.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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

          <div className="customer-details-section">
            <h3>Customer Details</h3>
            <div className="customer-details-grid">
              <div className="detail-item">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">
                  {customerData.firstName} {customerData.lastName}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{customerData.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{customerData.phoneNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{customerData.address}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Customer Type:</span>
                <span className="detail-value">
                  {customerData.customerType}
                </span>
              </div>
            </div>
          </div>

          <div className="indemnity-document-section">
            {/* <h3>Indemnity Agreement</h3> */}
            <div className="document-preview">
              <pre>{generateIndemnityDocument()}</pre>
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
                Accept & Download
              </GradientButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndemnityFormPage;
