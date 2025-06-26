import React from "react";
import "./borderbutton.css";

interface BorderButtonProps {
  text: string;
  icon?: string;
  onClick?: () => void;
  className?: string;
}

const BorderButton: React.FC<BorderButtonProps> = ({
  text,
  icon,
  onClick,
  className = "",
}) => {
  return (
    <button className={`border-button ${className}`} onClick={onClick}>
      {icon && <img src={icon} alt={text} className="button-icon" />}
      {text}
    </button>
  );
};

export default BorderButton;
