import React from "react";
import "./GradientButton.css";

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "close";
  size?: "small" | "medium" | "large" | "tiny";
  fullWidth?: boolean;
  loading?: boolean;
  id?: string;
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
  id,
}) => {
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Show plus icon instead of text when tiny size and mobile
  const shouldShowPlusIcon = size === "tiny" && windowWidth <= 768;

  return (
    <button
      id={id}
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
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{ color: "currentColor" }}
          >
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M18 10a8 8 0 0 1-8 8"
              stroke="currentColor"
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
      ) : shouldShowPlusIcon ? (
        <img
          src="/icons/plus-icon.svg"
          alt="Add"
          style={{ width: "16px", height: "16px" }}
        />
      ) : (
        children
      )}
    </button>
  );
};

export default GradientButton;
