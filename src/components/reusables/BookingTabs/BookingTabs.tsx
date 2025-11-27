import React from "react";
import "./bookingtabs.css";

type TabItem = { id: string; label: React.ReactNode };

interface BookingTabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

const BookingTabs: React.FC<BookingTabsProps> = ({
  items,
  activeId,
  onChange,
  className = "",
}) => {
  return (
    <div className={`booking-tabs-row ${className}`}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          aria-pressed={it.id === activeId}
          className={`booking-tab${it.id === activeId ? " active" : ""}`}
          onClick={() => onChange(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
};

export default BookingTabs;


