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
  digitsOnly?: boolean;
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
  digitsOnly = false,
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

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (digitsOnly) {
      const filtered = val.replace(/\D/g, "");
      if (filtered !== val) {
        // create a synthetic event with filtered value to pass to parent's onChange
        const synthetic = {
          ...e,
          target: { ...e.target, value: filtered },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(synthetic);
        return;
      }
    }
    onChange?.(e);
  };

  return (
    <label className="reusable-input-label" style={{ width: widthStyle }}>
      {label && <span className="reusable-input-label-text">{label}</span>}

      <div
        className={`input-upload-container ${className} ${
          hasError ? "error" : ""
        }`}
      >
        <input
          type="text"
          name={name}
          className={`reusable-input ${hasError ? "error" : ""}`}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={handleTextChange}
          inputMode={digitsOnly ? "numeric" : undefined}
          pattern={digitsOnly ? "[0-9]*" : undefined}
          disabled={disabled}
          readOnly={false}
          style={{ paddingRight: 240 }}
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
          >
            <Upload size={18} color="#fff" />
            <span className="input-upload-text">Upload</span>
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
