import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthIllustrationCarousel from "../../reusables/AuthIllustrationCarousel";
import axios, { AxiosError } from "axios";
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

// Type guard for AxiosError
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as AxiosError).isAxiosError === true
  );
}

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Configuration for encryption
  const secretKey = "Dyny+oPMeF1VfkOjDjgxJOxjq8Mpo7A/"; // 32 bytes (AES-256)
  const ivKey = "RVFU9+dRKhYkiCZI"; // 16 bytes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
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

      // Encrypt the body
      const encryptedPayload = encryptAESCBC(body, secretKey, ivKey);

      // Make the API call with encrypted payload and required headers
      const response = await axios.post("/auth/register", encryptedPayload, {
        headers: {
          "Content-Type": "application/json",
          "Client-Auth": "Basic dGVzdDp0ZXN0",
          "X-Source": "web",
        },
      });

      console.log("Register response:", response);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: unknown) {
      // Log everything from the error
      if (isAxiosError(err) && err.response) {
        const response = err.response;
        console.error("Error response:", response);
        console.error("Error data:", response.data);
        console.error("Error status:", response.status);
        console.error("Error headers:", response.headers);
        let errorMsg = "An error occurred during registration";
        if (response.data && typeof response.data === "object") {
          if (
            "message" in response.data &&
            typeof response.data.message === "string"
          ) {
            errorMsg = response.data.message;
          } else if (
            "error" in response.data &&
            typeof response.data.error === "string"
          ) {
            errorMsg = response.data.error;
          }
        }
        setError(errorMsg);
      } else {
        console.error("Error:", err);
        setError("An error occurred during registration");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-split-screen">
      <div className="auth-form-side">
        <form className="auth-form-modern" onSubmit={handleSubmit}>
          <h2 className="auth-form-title-modern">Sign Up</h2>
          <p className="auth-form-subtitle-modern">
            Create an account to continue!
          </p>
          {error && (
            <div className="auth-form-error" style={{ marginBottom: 6 }}>
              {error}
            </div>
          )}
          {success && (
            <div className="auth-form-success" style={{ marginBottom: 6 }}>
              {success}
            </div>
          )}
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
