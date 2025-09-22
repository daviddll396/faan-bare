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
      {loading ? (
        <span className="solid-button-spinner" aria-hidden />
      ) : (
        <>
          {icon && <span className="solid-button-icon">{icon}</span>}
          <span className="solid-button-label">{text ?? children}</span>
        </>
      )}
    </button>
  );
};

export default SolidButton;
