import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthIllustrationCarousel from "../../reusables/AuthIllustrationCarousel";
import MessageToast from "../../reusables/MessageToast";
import CryptoJS from "crypto-js";
import "./RegisterPage.css";

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

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    nin: "",
    phoneNumber: "",
    dob: "",
    address: "",
    customerType: "INDIVIDUAL" as "INDIVIDUAL" | "CORPORATE",
    cacNumber: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    nin: "",
    phoneNumber: "",
    dob: "",
    address: "",
    cacNumber: "",
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
  const navigate = useNavigate();

  // Configuration for encryption
  const secretKey = "Dyny+oPMeF1VfkOjDjgxJOxjq8Mpo7A/"; // 32 bytes (AES-256)
  const ivKey = "RVFU9+dRKhYkiCZI"; // 16 bytes

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
      case "lastName": {
        if (!value.trim())
          return `${name === "firstName" ? "First" : "Last"} name is required`;
        if (value.trim().length < 2)
          return `${
            name === "firstName" ? "First" : "Last"
          } name must be at least 2 characters`;
        if (!/^[a-zA-Z\s'-]+$/.test(value))
          return `${
            name === "firstName" ? "First" : "Last"
          } name can only contain letters, spaces, hyphens, and apostrophes`;
        return "";
      }

      case "email": {
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

      case "nin": {
        if (!value.trim()) return "NIN is required";
        if (!/^\d{11}$/.test(value)) return "NIN must be exactly 11 digits";
        return "";
      }

      case "dob": {
        if (!value) return "Date of birth is required";
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) return "You must be at least 18 years old";
        if (age > 120) return "Please enter a valid date of birth";
        return "";
      }

      case "address": {
        if (!value.trim()) return "Address is required";
        if (value.trim().length < 10)
          return "Please enter a complete address (minimum 10 characters)";
        return "";
      }

      case "password": {
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])/.test(value))
          return "Password must contain at least one lowercase letter";
        if (!/(?=.*[A-Z])/.test(value))
          return "Password must contain at least one uppercase letter";
        if (!/(?=.*\d)/.test(value))
          return "Password must contain at least one number";
        if (!/(?=.*[@$!%*?&])/.test(value))
          return "Password must contain at least one special character";
        return "";
      }

      case "confirmPassword": {
        if (!value) return "Please confirm your password";
        if (value !== form.password) return "Passwords do not match";
        return "";
      }

      case "cacNumber": {
        if (form.customerType === "CORPORATE") {
          if (!value.trim())
            return "CAC number is required for corporate customers";
          if (!/^(RC|BN|IT)\d{6,7}$/i.test(value))
            return "Please enter a valid CAC number (e.g., RC123456)";
        }
        return "";
      }

      default:
        return "";
    }
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "nin",
      "dob",
      "address",
      "password",
      "confirmPassword",
    ];

    // Check if CAC number is required and valid for corporate customers
    const isCacValid =
      form.customerType === "INDIVIDUAL" ||
      (form.customerType === "CORPORATE" &&
        form.cacNumber.trim() !== "" &&
        validateField("cacNumber", form.cacNumber) === "");

    // Check all required fields are filled and valid
    const areRequiredFieldsValid = requiredFields.every((field) => {
      const value = form[field as keyof typeof form] as string;
      return value.trim() !== "" && validateField(field, value) === "";
    });

    return areRequiredFieldsValid && isCacValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Update form state
    if (name === "customerType" && value === "INDIVIDUAL") {
      setForm((prev) => ({ ...prev, [name]: value, cacNumber: "" }));
      setValidationErrors((prev) => ({ ...prev, cacNumber: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    // Validate field in real-time
    const error = validateField(name, value);
    setValidationErrors((prev) => ({ ...prev, [name]: error }));

    // Revalidate confirm password if password changes
    if (name === "password" && form.confirmPassword) {
      const confirmError = validateField(
        "confirmPassword",
        form.confirmPassword
      );
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }

    setToast((prev) => ({ ...prev, isVisible: false }));
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
    setToast((prev) => ({ ...prev, isVisible: false }));
    setIsSubmitting(true);

    // Validation
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.nin ||
      !form.phoneNumber ||
      !form.dob ||
      !form.address ||
      !form.customerType
    ) {
      showToast("Please fill in all required fields", "error");
      setIsSubmitting(false);
      return;
    }

    if (form.customerType === "CORPORATE" && !form.cacNumber) {
      showToast("CAC Number is required for corporate customers", "error");
      setIsSubmitting(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      showToast("Passwords do not match", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create the request body according to new format
      const requestData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        nin: form.nin,
        phoneNumber: form.phoneNumber,
        dob: form.dob,
        address: form.address,
        customerType: form.customerType,
        cacNumber: form.customerType === "CORPORATE" ? form.cacNumber : null,
      };

      const body = JSON.stringify(requestData);

      console.log("Sending register request:", requestData);
      console.log("Request URL: /auth/register");
      console.log("Request method: POST");

      // Encrypt the body
      const encryptedPayload = encryptAESCBC(body, secretKey, ivKey);

      // Make the API call with encrypted payload and required headers
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Client-Auth": "Basic dGVzdDp0ZXN0",
          "X-Source": "web",
        },
        body: encryptedPayload,
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Get the raw response text (encrypted)
      const rawResponseText = await response.text();
      console.log("Raw encrypted response text:", rawResponseText);

      // Decrypt the response
      let decryptedResponse;
      try {
        decryptedResponse = decryptAESCBC(rawResponseText, secretKey, ivKey);
        console.log("Decrypted response:", decryptedResponse);
      } catch (decryptError) {
        console.error("Decryption error:", decryptError);
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
        console.log("Parsed response data:", responseData);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.log("Failed to parse decrypted response:", decryptedResponse);
        showToast("Invalid server response format", "error");
        return;
      }

      // Check if registration was successful
      if (
        responseData.status === true &&
        (responseData.statusCode === 200 || responseData.statusCode === 201)
      ) {
        console.log("Registration successful:", responseData.message);
        showToast(
          "Registration successful! Redirecting to login...",
          "success"
        );
        setTimeout(() => {
          navigate("/login");
        }, 3500);
      } else {
        // Handle all error cases - display the server message
        console.log("Registration failed:", responseData.message);
        const errorMessage = responseData.message || "Registration failed";

        if (responseData.statusCode === 409) {
          console.log("Conflict error (409):", errorMessage);
          showToast(errorMessage, "error");
        } else {
          console.log("Other error:", errorMessage);
          showToast(errorMessage, "error");
        }
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      showToast("An error occurred during registration", "error");
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
          <h2 className="auth-form-title-modern">Sign Up</h2>
          <p className="auth-form-subtitle-modern">
            Create an account to continue!
          </p>

          {/* Name fields - side by side */}
          <div className="form-row-group">
            <div className="form-row-modern">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={`form-input-modern ${
                  validationErrors.firstName ? "error" : ""
                }`}
                value={form.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                disabled={isSubmitting}
                required
              />
              {validationErrors.firstName && (
                <span className="validation-error">
                  {validationErrors.firstName}
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
                  validationErrors.lastName ? "error" : ""
                }`}
                value={form.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                disabled={isSubmitting}
                required
              />
              {validationErrors.lastName && (
                <span className="validation-error">
                  {validationErrors.lastName}
                </span>
              )}
            </div>
          </div>

          {/* Email - full width */}
          <div className="form-row-full">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input-modern ${
                validationErrors.email ? "error" : ""
              }`}
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isSubmitting}
              required
            />
            {validationErrors.email && (
              <span className="validation-error">{validationErrors.email}</span>
            )}
          </div>

          {/* Phone and NIN - side by side */}
          <div className="form-row-group">
            <div className="form-row-modern">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className={`form-input-modern ${
                  validationErrors.phoneNumber ? "error" : ""
                }`}
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                disabled={isSubmitting}
                required
              />
              {validationErrors.phoneNumber && (
                <span className="validation-error">
                  {validationErrors.phoneNumber}
                </span>
              )}
            </div>

            <div className="form-row-modern">
              <label htmlFor="nin">NIN</label>
              <input
                type="text"
                id="nin"
                name="nin"
                className={`form-input-modern ${
                  validationErrors.nin ? "error" : ""
                }`}
                value={form.nin}
                onChange={handleChange}
                placeholder="Enter your NIN"
                disabled={isSubmitting}
                required
              />
              {validationErrors.nin && (
                <span className="validation-error">{validationErrors.nin}</span>
              )}
            </div>
          </div>

          {/* Date of Birth and Customer Type - side by side */}
          <div className="form-row-group">
            <div className="form-row-modern">
              <label htmlFor="dob">Date of Birth</label>
              <input
                type="date"
                id="dob"
                name="dob"
                className={`form-input-modern ${
                  validationErrors.dob ? "error" : ""
                }`}
                value={form.dob}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
              {validationErrors.dob && (
                <span className="validation-error">{validationErrors.dob}</span>
              )}
            </div>

            <div className="form-row-modern">
              <label htmlFor="customerType">Customer Type</label>
              <select
                id="customerType"
                name="customerType"
                className="form-input-modern"
                value={form.customerType}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="CORPORATE">Corporate</option>
              </select>
            </div>
          </div>

          {/* Address - full width */}
          <div className="form-row-full">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              className={`form-input-modern ${
                validationErrors.address ? "error" : ""
              }`}
              value={form.address}
              onChange={handleChange}
              placeholder="Enter your address"
              disabled={isSubmitting}
              required
            />
            {validationErrors.address && (
              <span className="validation-error">
                {validationErrors.address}
              </span>
            )}
          </div>

          {/* CAC Number - full width */}
          <div className="form-row-full">
            <label htmlFor="cacNumber">CAC Number</label>
            <input
              type="text"
              id="cacNumber"
              name="cacNumber"
              className={`form-input-modern ${
                form.customerType === "INDIVIDUAL" ? "disabled" : ""
              } ${validationErrors.cacNumber ? "error" : ""}`}
              value={form.cacNumber}
              onChange={handleChange}
              placeholder={
                form.customerType === "INDIVIDUAL"
                  ? "Not required for individual customers"
                  : "Enter CAC number"
              }
              disabled={isSubmitting || form.customerType === "INDIVIDUAL"}
              required={form.customerType === "CORPORATE"}
            />
            {validationErrors.cacNumber && (
              <span className="validation-error">
                {validationErrors.cacNumber}
              </span>
            )}
          </div>

          {/* Password fields - side by side */}
          <div className="form-row-group">
            <div className="form-row-modern">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-input-modern ${
                  validationErrors.password ? "error" : ""
                }`}
                value={form.password}
                onChange={handleChange}
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

            <div className="form-row-modern">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-input-modern ${
                  validationErrors.confirmPassword ? "error" : ""
                }`}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={isSubmitting}
                required
              />
              {validationErrors.confirmPassword && (
                <span className="validation-error">
                  {validationErrors.confirmPassword}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="login-btn-modern"
            disabled={isSubmitting || !isFormValid()}
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
