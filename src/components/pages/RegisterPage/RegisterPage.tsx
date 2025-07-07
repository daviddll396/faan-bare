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
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    nin: "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

    if (
      !form.firstName ||
      !form.lastName ||
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.nin
    ) {
      showToast("Please fill in all fields", "error");
      setIsSubmitting(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      showToast("Passwords do not match", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create the request body
      const body = JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        password: form.password,
        email: form.email,
        nin: form.nin,
      });

      console.log("Sending register request:", JSON.parse(body));
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
      } else if (responseData.statusCode === 409) {
        console.log("User already exists:", responseData.message);
        showToast(
          "User already exists. Please try logging in instead.",
          "error"
        );
      } else {
        console.log("Registration failed:", responseData.message);
        showToast(responseData.message || "Registration failed", "error");
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
          <div className="form-row-modern">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="form-input-modern"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-row-modern">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className="form-input-modern"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-row-modern">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input-modern"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-row-modern">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input-modern"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-row-modern">
            <label htmlFor="nin">NIN</label>
            <input
              type="text"
              id="nin"
              name="nin"
              className="form-input-modern"
              value={form.nin}
              onChange={handleChange}
              placeholder="Enter your NIN"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-row-modern">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input-modern"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-row-modern">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input-modern"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isSubmitting}
              required
            />
          </div>
          <button
            type="submit"
            className="login-btn-modern"
            disabled={isSubmitting}
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
