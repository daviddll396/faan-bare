import React, { useState, useRef, useEffect } from "react";
import ChevronDown from "../../../../public/icons/chevron-down.svg";
import NgFlag from "../../../../public/icons/ng-flag.svg";
import "./currencydropdown.css";

interface CurrencyDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div
      className={`currency-dropdown-wrapper${open ? " open" : ""}`}
      ref={wrapperRef}
      onClick={() => setOpen((prev) => !prev)}
      tabIndex={0}
    >
      <span className="currency-dropdown-label">{label}</span>
      <span className="currency-dropdown-value">
        <img src={NgFlag} alt="flag" className="currency-flag" />
        <span className="currency-code">{value}</span>
        <img src={ChevronDown} alt="dropdown" className="currency-chevron" />
      </span>
      {open && (
        <div className="currency-dropdown-list">
          {options.map((opt) => (
            <div
              key={opt}
              className={`currency-dropdown-option${
                opt === value ? " selected" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onChange(opt);
                setOpen(false);
              }}
            >
              <img src={NgFlag} alt="flag" className="currency-flag" />
              <span className="currency-code">{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencyDropdown;
