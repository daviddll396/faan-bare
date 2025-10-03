import React, { useRef, useEffect, useState, useCallback } from "react";
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

// Runs side effects tied to the dropdown open state
const DropdownPositionerEffect: React.FC<{
  open: boolean;
  update: () => void;
}> = ({ open, update }) => {
  useEffect(() => {
    if (!open) return;

    update();
    const handleResize = () => update();
    const handleScroll = () => update();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, update]);

  return null;
};

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

  const updateDropdownPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const estimatedItemHeight = 40; // px per option
      const verticalPadding = 16; // px padding inside dropdown
      const gap = 4; // px gap between button and dropdown

      const dropdownHeight = Math.min(
        options.length * estimatedItemHeight + verticalPadding,
        240
      );

      // Space relative to viewport since overlay is fixed
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      const shouldFlipUp =
        spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      // Compute top/left relative to viewport (no scroll offsets for fixed overlay)
      let top = shouldFlipUp
        ? rect.top - dropdownHeight - gap
        : rect.bottom + gap;
      let left = rect.left;

      // Clamp within viewport to avoid rendering off-screen on small viewports
      top = Math.max(gap, Math.min(top, viewportHeight - dropdownHeight - gap));
      left = Math.max(gap, Math.min(left, viewportWidth - rect.width - gap));

      // Max height should never be negative; enforce a sensible minimum
      let maxHeight = shouldFlipUp
        ? Math.min(dropdownHeight, Math.max(0, spaceAbove - 8))
        : Math.min(dropdownHeight, Math.max(0, spaceBelow - 8));
      maxHeight = Math.max(40, maxHeight);

      setDropdownPosition({
        top,
        left,
        width: rect.width,
        maxHeight,
      });
    }
  }, [options]);

  return (
    <div className={wrapperClass}>
      {label && <span className="listbox-label">{label}</span>}
      <Listbox
        value={selectedOption || undefined}
        onChange={onChange}
        disabled={disabled}
      >
        {({ open }: { open: boolean }) => {
          return (
            <>
              <DropdownPositionerEffect
                open={open}
                update={updateDropdownPosition}
              />
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
                          options
                            .filter((option) => {
                              // Filter out empty or null options
                              const labelTxt =
                                option.label || option.name || option.value;
                              return labelTxt && labelTxt.trim() !== "";
                            })
                            .map((option) => {
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
