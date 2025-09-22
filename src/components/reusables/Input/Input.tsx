import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./input.css";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  ariaLabel?: string;
  label?: React.ReactNode;
  /** If true and type="password", shows an inline toggle to reveal the password */
  passwordToggle?: boolean;
  /** Optional error state. If string, shown as message below input */
  error?: boolean | string;
};

const Input: React.FC<InputProps> = ({
  className = "",
  ariaLabel,
  label,
  passwordToggle = false,
  type,
  error,
  ...rest
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const effectiveType =
    passwordToggle && type === "password"
      ? passwordVisible
        ? "text"
        : "password"
      : type || "text";

  const hasError =
    !!error || (className && className.toString().includes("error"));

  return (
    <label className="reusable-input-label">
      {label && <span className="reusable-input-label-text">{label}</span>}
      <div className={passwordToggle ? "password-input-container" : undefined}>
        <input
          className={`reusable-input ${className} ${hasError ? "error" : ""}`}
          aria-label={ariaLabel}
          type={effectiveType}
          aria-invalid={!!hasError}
          {...rest}
        />

        {passwordToggle && type === "password" && (
          <button
            type="button"
            className="password-toggle-btn"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            onClick={() => setPasswordVisible((v) => !v)}
          >
            {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {hasError && (
        <div className="reusable-input-error">
          {typeof error === "string" ? error : "This field is required"}
        </div>
      )}
    </label>
  );
};

export default Input;
