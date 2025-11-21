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
  /** Optional width prop to control input width */
  width?: string | number;
  /** Optional input restriction: 'alpha' | 'numeric' | 'alphanumeric' */
  restrict?: "alpha" | "numeric" | "alphanumeric";
};

const Input: React.FC<InputProps> = ({
  className = "",
  ariaLabel,
  label,
  passwordToggle = false,
  type,
  error,
  width,
  restrict,
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

  // Convert width to CSS value
  const widthStyle = width
    ? typeof width === "number"
      ? `${width}px`
      : width
    : undefined;

  // Normalize and filter input values according to `restrict`
  const filterValue = (value: string) => {
    if (!restrict) return value;
    switch (restrict) {
      case "alpha":
        // allow letters, spaces, apostrophes and hyphens
        return value.replace(/[^A-Za-z\s'-]/g, "");
      case "numeric":
        return value.replace(/[^0-9]/g, "");
      case "alphanumeric":
        return value.replace(/[^A-Za-z0-9\s'-]/g, "");
      default:
        return value;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.currentTarget.value;
    const filtered = filterValue(raw);

    // If unchanged, forward original event
    if (filtered === raw) {
      if (typeof rest.onChange === "function") rest.onChange(e);
      return;
    }

    // For controlled inputs the parent should update value based on this event.
    // Mutate the DOM value so uncontrolled inputs also reflect filtered value.
    try {
      (e.currentTarget as HTMLInputElement).value = filtered;
    } catch {
      // ignore
    }
    const name = e.currentTarget.name;
    const synthetic = {
      nativeEvent: e.nativeEvent,
      target: { name, value: filtered },
      currentTarget: { name, value: filtered },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    if (typeof rest.onChange === "function") rest.onChange(synthetic);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!restrict) {
      const onPasteFn = (
        rest as unknown as {
          onPaste?: (ev: React.ClipboardEvent<HTMLInputElement>) => void;
        }
      ).onPaste;
      if (typeof onPasteFn === "function") onPasteFn(e);
      return;
    }
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const filtered = filterValue(pasted);
    const el = e.currentTarget;
    const newValue =
      el.value.substring(0, el.selectionStart ?? 0) +
      filtered +
      el.value.substring(el.selectionEnd ?? 0);
    // set DOM value
    try {
      (el as HTMLInputElement).value = newValue;
    } catch {
      // ignore
    }
    const name = el.name;
    const synthetic = {
      nativeEvent: e.nativeEvent,
      target: { name, value: newValue },
      currentTarget: { name, value: newValue },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    if (typeof rest.onChange === "function") rest.onChange(synthetic);
  };

  return (
    <label className="reusable-input-label" style={{ width: widthStyle }}>
      {label && <span className="reusable-input-label-text">{label}</span>}
      <div className={passwordToggle ? "password-input-container" : undefined}>
        <input
          {...rest}
          className={`reusable-input ${className} ${hasError ? "error" : ""}`}
          aria-label={ariaLabel}
          type={effectiveType}
          inputMode={restrict === "numeric" ? "numeric" : undefined}
          pattern={restrict === "numeric" ? "\\d*" : undefined}
          aria-invalid={!!hasError}
          onChange={handleChange}
          onPaste={handlePaste}
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
