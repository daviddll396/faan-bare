import React, { useRef, useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { createPortal } from "react-dom";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 240,
  });

  const currentValue = value ?? selected?.value ?? "";
  const selectedOption =
    options.find((option) => option.value === currentValue) || null;

  // derive hasError from explicit prop or legacy className usage
  const hasError =
    !!error || (className && className.toString().includes("error"));

  const wrapperClass = `listbox-wrapper ${className ?? ""} ${
    hasError ? "error" : ""
  }`;

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = Math.min(options.length * 40 + 16, 240); // Estimate dropdown height (40px per option, max 240px)

      // Check if dropdown would go below viewport
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top: number;
      let maxHeight: number;

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        // Not enough space below, but more space above - flip upwards
        top = rect.top + window.scrollY - dropdownHeight - 4;
        maxHeight = Math.min(dropdownHeight, spaceAbove - 8);
      } else {
        // Default: position below
        top = rect.bottom + window.scrollY + 4;
        maxHeight = Math.min(dropdownHeight, spaceBelow - 8);
      }

      setDropdownPosition({
        top,
        left: rect.left + window.scrollX,
        width: rect.width,
        maxHeight,
      });
    }
  };

  return (
    <div className={wrapperClass}>
      {label && <span className="listbox-label">{label}</span>}
      <Listbox
        value={selectedOption || undefined}
        onChange={onChange}
        disabled={disabled}
      >
        {({ open }: { open: boolean }) => {
          // Update position when dropdown opens
          useEffect(() => {
            if (open) {
              updateDropdownPosition();
              const handleResize = () => updateDropdownPosition();
              const handleScroll = () => updateDropdownPosition();

              window.addEventListener("resize", handleResize);
              window.addEventListener("scroll", handleScroll, true);

              return () => {
                window.removeEventListener("resize", handleResize);
                window.removeEventListener("scroll", handleScroll, true);
              };
            }
          }, [open]);

          return (
            <>
              <div className="listbox-container">
                <Listbox.Button
                  ref={buttonRef}
                  className={`listbox-button ${open ? "open" : ""} ${
                    disabled ? "disabled" : ""
                  }`}
                  onClick={updateDropdownPosition}
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
                    className={`listbox-button-icon ${open ? "rotated" : ""}`}
                  />
                </Listbox.Button>

                {/* Render error message when present */}
                {hasError && (
                  <div className="listbox-error">
                    {typeof error === "string"
                      ? error
                      : "This field is required"}
                  </div>
                )}
              </div>

              {/* Render dropdown in portal to completely avoid z-index issues */}
              {open &&
                createPortal(
                  <div
                    className="listbox-portal-overlay"
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      pointerEvents: "none",
                      zIndex: 999999,
                    }}
                  >
                    <Listbox.Options
                      className="listbox-dropdown-portal"
                      style={{
                        position: "absolute",
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                        maxHeight: dropdownPosition.maxHeight,
                        pointerEvents: "auto",
                      }}
                    >
                      <div
                        className="listbox-options"
                        style={
                          options.length * 40 + 16 > dropdownPosition.maxHeight
                            ? {
                                maxHeight: dropdownPosition.maxHeight,
                                overflowY: "auto",
                              }
                            : {
                                // No maxHeight constraint for small dropdowns
                              }
                        }
                      >
                        {options.length > 0 ? (
                          options.map((option) => {
                            const labelTxt =
                              option.label || option.name || option.value;
                            return (
                              <Listbox.Option
                                key={option.value}
                                value={option}
                                className={({
                                  active,
                                  selected,
                                }: {
                                  active: boolean;
                                  selected: boolean;
                                }) =>
                                  `listbox-option ${
                                    selected ? "selected" : ""
                                  } ${active ? "focused" : ""}`
                                }
                              >
                                {({ selected }: { selected: boolean }) => (
                                  <>
                                    <span
                                      className={`listbox-option-text ${
                                        selected ? "selected" : ""
                                      }`}
                                    >
                                      {labelTxt}
                                    </span>
                                    {selected && (
                                      <span className="listbox-option-check">
                                        ✓
                                      </span>
                                    )}
                                  </>
                                )}
                              </Listbox.Option>
                            );
                          })
                        ) : (
                          <div className="listbox-no-options">
                            No options found
                          </div>
                        )}
                      </div>
                    </Listbox.Options>
                  </div>,
                  document.body
                )}
            </>
          );
        }}
      </Listbox>
    </div>
  );
};

export default ListBox;
