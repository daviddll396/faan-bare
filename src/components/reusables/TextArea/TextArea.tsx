import React from "react";
import "./TextArea.css";

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
  ariaLabel?: string;
  label?: React.ReactNode;
  /** Optional error state. If boolean true will show generic message; if string shows provided message */
  error?: boolean | string;
  /** Optional width prop to control textarea width */
  width?: string | number;
  /** Optional hint text below the textarea */
  hint?: string;
};

const TextArea: React.FC<TextAreaProps> = ({
  className = "",
  ariaLabel,
  label,
  error,
  width,
  hint,
  ...rest
}) => {
  const hasError =
    !!error || (className && className.toString().includes("error"));

  // Convert width to CSS value
  const widthStyle = width
    ? typeof width === "number"
      ? `${width}px`
      : width
    : undefined;

  return (
    <label className="reusable-input-label" style={{ width: widthStyle }}>
      {label && <span className="reusable-input-label-text">{label}</span>}
      <textarea
        className={`reusable-textarea ${className} ${hasError ? "error" : ""}`}
        aria-label={ariaLabel}
        aria-invalid={!!hasError}
        {...rest}
      />
      {hint && <div className="reusable-input-hint">{hint}</div>}
      {hasError && (
        <div className="reusable-input-error">
          {typeof error === "string" ? error : "This field is required"}
        </div>
      )}
    </label>
  );
};

export default TextArea;
