import React, { useState, useRef, useEffect } from "react";
import "./searchinput.css";

interface SearchInputProps {
  placeholder: string;
  withDropdown?: boolean;
  value?: string;
  onChange?: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { value: string } }
  ) => void;
  options?: string[];
}

import SearchIcon from "../../../../public/icons/search-icon.svg";
import ChevronDown from "../../../../public/icons/chevron-down.svg";

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  withDropdown = false,
  value,
  onChange,
  options,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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

  if (options) {
    return (
      <div
        className={`search-input-wrapper search-input-dropdown-wrapper${
          open ? " open" : ""
        }`}
        ref={wrapperRef}
        tabIndex={0}
        onClick={() => setOpen((prev) => !prev)}
      >
        <img src={SearchIcon} alt="search" className="search-input-icon" />
        <div className="search-dropdown-value">
          {value ? (
            value
          ) : (
            <span className="search-dropdown-placeholder">{placeholder}</span>
          )}
        </div>
        <img
          src={ChevronDown}
          alt="dropdown"
          className={`search-input-chevron${open ? " rotated" : ""}`}
        />
        {open && (
          <div className="search-dropdown-list">
            {options.map((opt) => (
              <div
                key={opt}
                className={`search-dropdown-option${
                  opt === value ? " selected" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onChange) onChange({ target: { value: opt } });
                  setOpen(false);
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="search-input-wrapper">
      <img src={SearchIcon} alt="search" className="search-input-icon" />
      <input
        className="search-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {withDropdown && (
        <img
          src={ChevronDown}
          alt="dropdown"
          className="search-input-chevron"
        />
      )}
    </div>
  );
};

export default SearchInput;
