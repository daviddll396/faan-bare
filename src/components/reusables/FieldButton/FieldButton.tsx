import React from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
// We intentionally avoid using BorderButton/SearchInput here so FieldButton styles everything directly
import "./fieldbutton.css";
import SolidButton from "../SolidButton";

interface FieldInputConfig {
  placeholder?: string;
  value?: string;
  /** input type (e.g. "text", "date") */
  type?: string;
  onChange?: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { value: string } }
  ) => void;
  options?: string[];
  withDropdown?: boolean;
  hideIcon?: boolean;
}

interface FieldButtonProps {
  inputs?: FieldInputConfig[]; // optional array of search inputs
  buttons?: Array<{
    text?: string;
    icon?: string; // optional svg path
    iconClassName?: string; // optional custom class for icon styling
    onClick?: () => void;
    className?: string; // optional extra class for custom overrides
    type?: "button" | "submit" | "reset";
  }>;
  gap?: number; // spacing between elements
  className?: string;
}

const FieldButton: React.FC<FieldButtonProps> = ({
  inputs = [],
  buttons = [],
  gap = 12,
  className = "",
}) => {
  return (
    <div className={`fieldbutton-root ${className}`} style={{ gap }}>
      <div className="fieldbutton-inputs">
        {inputs.map((cfg, idx) => (
          <div className="fieldbutton-input" key={idx}>
            <div
              className={`fieldbutton-search-wrapper ${
                cfg.options ? "fieldbutton-search-dropdown-wrapper" : ""
              }`}
            >
              {!cfg.hideIcon && (
                <FiSearch className="fieldbutton-search-icon" color="#626262" />
              )}
              {cfg.options ? (
                <select
                  className="fieldbutton-search-select"
                  value={cfg.value ?? ""}
                  onChange={(e) =>
                    cfg.onChange &&
                    cfg.onChange(
                      e as React.ChangeEvent<
                        HTMLInputElement | HTMLSelectElement
                      >
                    )
                  }
                >
                  <option value="">{cfg.placeholder}</option>
                  {cfg.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="fieldbutton-search-input"
                  type={cfg.type ?? "text"}
                  placeholder={cfg.placeholder ?? "Search"}
                  value={cfg.value}
                  onChange={(e) =>
                    cfg.onChange &&
                    cfg.onChange(
                      e as React.ChangeEvent<
                        HTMLInputElement | HTMLSelectElement
                      >
                    )
                  }
                />
              )}
              {cfg.withDropdown && (
                <FiChevronDown className="fieldbutton-search-chevron" />
              )}
            </div>
          </div>
        ))}

        {/* render buttons immediately after inputs so they sit next to them */}
        {buttons.map((btn, idx) => (
          <SolidButton
            key={`inline-btn-${idx}`}
            type={btn.type ?? "button"}
            onClick={btn.onClick}
            text={btn.text}
            size="medium"
            variant="secondary"
            rounded={false}
            className={btn.className}
            style={{ height: "56px" }}
          >
            {btn.icon && (
              <img
                src={btn.icon}
                alt={btn.text}
                className={`fieldbutton-btn-icon ${btn.iconClassName || ""}`}
              />
            )}
          </SolidButton>
        ))}
      </div>
    </div>
  );
};

export default FieldButton;
