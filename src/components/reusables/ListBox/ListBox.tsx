import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import "./ListBox.css";

export interface ListBoxOption {
  id?: string | number;
  value: string;
  /** label or name may be used by callers */
  label?: string;
  name?: string;
}

interface ListBoxProps {
  options: ListBoxOption[];
  /** either supply the current value string or the selected option */
  value?: string;
  selected?: ListBoxOption | null;
  onChange: (option: ListBoxOption) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Optional visible label rendered above the control */
  label?: React.ReactNode;
  /** Optional error state. If boolean true will show generic message; if string shows provided message */
  error?: boolean | string;
}

const ListBox: React.FC<ListBoxProps> = ({
  options,
  value,
  selected,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  label,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const listboxRef = useRef<HTMLDivElement>(null);

  const currentValue = value ?? selected?.value ?? "";
  const selectedOption = options.find(
    (option) => option.value === currentValue
  );

  const filteredOptions = options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        listboxRef.current &&
        !listboxRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // no-op: kept for click outside handling only
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (option: ListBoxOption) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  // derive hasError from explicit prop or legacy className usage
  const hasError =
    !!error || (className && className.toString().includes("error"));

  const wrapperClass = `listbox-wrapper ${className ?? ""} ${
    hasError ? "error" : ""
  }`;

  return (
    <label className={wrapperClass}>
      {label && <span className="listbox-label">{label}</span>}
      <div className={`listbox-container`} ref={listboxRef}>
        <div
          className={`listbox-button ${isOpen ? "open" : ""} ${
            disabled ? "disabled" : ""
          }`}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          aria-invalid={!!hasError}
        >
          <span
            className={`listbox-button-text ${
              selectedOption ? "has-value" : ""
            }`}
          >
            {selectedOption
              ? selectedOption.label ||
                selectedOption.name ||
                selectedOption.value
              : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`listbox-button-icon ${isOpen ? "rotated" : ""}`}
          />
        </div>

        {isOpen && (
          <div className="listbox-dropdown">
            <div className="listbox-options" role="listbox">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const labelTxt = option.label || option.name || option.value;
                  return (
                    <div
                      key={option.value}
                      className={`listbox-option ${
                        option.value === currentValue ? "selected" : ""
                      }`}
                      onClick={() => handleOptionClick(option)}
                      role="option"
                      aria-selected={option.value === currentValue}
                    >
                      <span
                        className={`listbox-option-text ${
                          option.value === currentValue ? "selected" : ""
                        }`}
                      >
                        {labelTxt}
                      </span>
                      {option.value === currentValue && (
                        <span className="listbox-option-check">✓</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="listbox-no-options">No options found</div>
              )}
            </div>
          </div>
        )}

        {/* Render error message when present */}
        {hasError && (
          <div className="listbox-error">
            {typeof error === "string" ? error : "This field is required"}
          </div>
        )}
      </div>
    </label>
  );
};

export default ListBox;
