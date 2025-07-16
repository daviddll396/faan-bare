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
}) => {
  const buttonClasses = [
    "gradient-button",
    `gradient-button--${variant}`,
    `gradient-button--${size}`,
    fullWidth ? "gradient-button--full-width" : "",
    disabled ? "gradient-button--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {children}
    </button>
  );
};

export default GradientButton;
 