import React from "react";
import "./GradientButton.css";

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "close";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  loading?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  variant = "primary",
  size = "medium",
  fullWidth = false,
  loading = false,
}) => {
  const buttonClasses = [
    "gradient-button",
    `gradient-button--${variant}`,
    `gradient-button--${size}`,
    fullWidth ? "gradient-button--full-width" : "",
    disabled || loading ? "gradient-button--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      style={{ position: "relative" }}
    >
      {loading ? (
        <span
          className="gradient-btn-spinner"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="#666666"
              strokeWidth="3"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M18 10a8 8 0 0 1-8 8"
              stroke="#666666"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 10 10"
                to="360 10 10"
                dur="0.8s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default GradientButton;
