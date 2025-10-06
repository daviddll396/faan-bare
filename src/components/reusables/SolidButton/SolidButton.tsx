import React from "react";
import "./solidbutton.css";

type SolidButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  text?: string;
  fullWidth?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
  loading?: boolean;
  rounded?: boolean;
};

const SolidButton: React.FC<SolidButtonProps> = ({
  text,
  children,
  fullWidth = false,
  size = "medium",
  variant = "primary",
  icon,
  loading = false,
  rounded = false,
  disabled,
  className: classNameProp = "",
  ...rest
}) => {
  const computed = [
    "solid-button",
    `solid-button--${size}`,
    `solid-button--${variant}`,
    rounded ? "solid-button--rounded" : "",
    fullWidth ? "solid-button--full" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const finalClassName = [computed, classNameProp].filter(Boolean).join(" ");

  return (
    <button className={finalClassName} disabled={disabled || loading} {...rest}>
      <div
        className={`solid-button-content ${
          loading ? "solid-button-content--loading" : ""
        }`}
      >
        {icon && <span className="solid-button-icon">{icon}</span>}
        <span className="solid-button-label">{text ?? children}</span>
        {loading && (
          <span className="solid-button-spinner" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M18 10a8 8 0 0 1-8 8"
                stroke="rgba(255, 255, 255, 1)"
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
        )}
      </div>
    </button>
  );
};

export default SolidButton;
