import React, { useRef, useCallback } from "react";
import "./FileUpload.css";

export interface FileUploadProps {
  /** File input ID */
  id?: string;
  /** Accepted file types */
  accept?: string;
  /** Current file value (base64 string) */
  value?: string;
  /** Current file name */
  fileName?: string;
  /** File change handler */
  onChange: (file: File | null) => void;
  /** Optional visible label rendered above the control */
  label?: React.ReactNode;
  /** Placeholder text for the button */
  placeholder?: string;
  /** Optional error state. If boolean true will show generic message; if string shows provided message */
  error?: boolean | string;
  /** Optional hint text below the input */
  hint?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  id = "file-upload",
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif",
  value,
  fileName,
  onChange,
  label,
  placeholder = "Choose File",
  error,
  hint,
  disabled = false,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // derive hasError from explicit prop or legacy className usage
  const hasError =
    !!error || (className && className.toString().includes("error"));

  const wrapperClass = `file-upload-wrapper ${className ?? ""} ${
    hasError ? "error" : ""
  } ${disabled ? "disabled" : ""}`;

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      onChange(file);
    },
    [onChange]
  );

  const handleButtonClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleButtonClick();
      }
    },
    [handleButtonClick]
  );

  const buttonText = fileName || (value ? "Change File" : placeholder);

  return (
    <div className={wrapperClass}>
      {label && <span className="reusable-input-label-text">{label}</span>}
      <div className="file-upload-container">
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="file-input-hidden"
        />
        <button
          type="button"
          className={`file-upload-button ${hasError ? "error" : ""} ${
            disabled ? "disabled" : ""
          }`}
          onClick={handleButtonClick}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
        >
          <div className="file-upload-content">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="file-upload-icon"
            >
              <path
                d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2V8H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 13H8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 17H8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 9H8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="file-upload-text">{buttonText}</span>
          </div>
        </button>
        {fileName && (
          <div className="file-selected">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="file-selected-icon"
            >
              <path
                d="M9 12L11 14L15 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        )}
      </div>
      {hint && <div className="file-upload-hint">{hint}</div>}
      {hasError && (
        <div className="file-upload-error">
          {typeof error === "string" ? error : "This field is required"}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
