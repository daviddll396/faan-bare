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

import SearchIcon from "/icons/search-icon.svg";
import ChevronDown from "/icons/chevron-down.svg";

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  withDropdown = false,
  value,
  onChange,
  options,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Keep the outside-click effect (harmless when using native select)
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
        className={`search-input-wrapper search-input-dropdown-wrapper`}
        ref={wrapperRef}
      >
        <img src={SearchIcon} alt="search" className="search-input-icon" />
        <select
          className="search-input-select"
          value={value ?? ""}
          onChange={(e) => {
            if (onChange) onChange(e as unknown as any);
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {withDropdown && (
          <img
            src={ChevronDown}
            alt="dropdown"
            className="search-input-chevron"
          />
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
