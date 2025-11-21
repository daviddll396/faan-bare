import React, { useState, useRef, useEffect } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
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
        <FiSearch className="search-input-icon" color="currentColor" />
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
          <FiChevronDown className="search-input-chevron" color="currentColor" />
        )}
      </div>
    );
  }

  return (
    <div className="search-input-wrapper">
      <FiSearch className="search-input-icon" color="currentColor" />
      <input
        className="search-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {withDropdown && (
        <FiChevronDown className="search-input-chevron" color="currentColor" />
      )}
    </div>
  );
};

export default SearchInput;
