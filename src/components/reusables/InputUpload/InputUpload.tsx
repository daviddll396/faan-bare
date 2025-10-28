import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import "../Input/input.css";

type InputUploadProps = {
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilesChange?: (files: File[]) => void;
  placeholder?: string;
  label?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  error?: boolean | string;
  width?: string | number;
};

const InputUpload: React.FC<InputUploadProps> = ({
  name,
  value,
  onChange,
  onFilesChange,
  placeholder,
  label,
  className = "",
  disabled = false,
  accept = ".pdf,.jpg,.jpeg",
  multiple = false,
  error,
  width,
}) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const hasError = !!error;

  const widthStyle = width
    ? typeof width === "number"
      ? `${width}px`
      : width
    : undefined;

  const triggerFileDialog = () => {
    if (disabled) return;
    fileRef.current?.click();
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFileNames(files.map((f) => f.name));
    if (onFilesChange) onFilesChange(files);
  };

  return (
    <label className="reusable-input-label" style={{ width: widthStyle }}>
      {label && <span className="reusable-input-label-text">{label}</span>}

      <div
        className={`input-upload-container ${className} ${
          hasError ? "error" : ""
        }`}
        style={{ position: "relative", width: "100%" }}
      >
        <input
          type="text"
          name={name}
          className={`reusable-input ${hasError ? "error" : ""}`}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          readOnly={false}
          style={{ paddingRight: 140 }}
        />

        {/* show uploaded filename at the far right inside the field, else show upload icon */}
        {fileNames.length > 0 ? (
          <div
            className="input-upload-filename"
            onClick={triggerFileDialog}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") triggerFileDialog();
            }}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 13,
              color: "#374151",
              maxWidth: 220,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "pointer",
            }}
            title={fileNames.join(", ")}
          >
            {fileNames[0]}
          </div>
        ) : (
          <button
            type="button"
            className="input-upload-btn"
            onClick={triggerFileDialog}
            aria-label="Upload file"
            disabled={disabled}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "transparent",
              cursor: disabled ? "not-allowed" : "pointer",
              padding: 6,
            }}
          >
            <Upload size={18} color="#9CA3AF" />
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          style={{ display: "none" }}
          accept={accept}
          multiple={multiple}
          onChange={handleFiles}
        />
      </div>

      {hasError && (
        <div className="reusable-input-error">
          {typeof error === "string" ? error : "This field is required"}
        </div>
      )}
    </label>
  );
};

export default InputUpload;
