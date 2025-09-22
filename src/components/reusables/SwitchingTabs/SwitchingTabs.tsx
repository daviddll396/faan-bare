import React from "react";
import "./switchingtabs.css";

type TabItem = { id: string; label: string };

type SwitchingTabsProps = {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
};

const SwitchingTabs: React.FC<SwitchingTabsProps> = ({
  items,
  activeId,
  onChange,
  className = "",
}) => (
  <div className={`switching-tabs ${className}`}>
    {items.map((t) => (
      <button
        key={t.id}
        type="button"
        className={`switching-tab${activeId === t.id ? " active" : ""}`}
        onClick={() => onChange(t.id)}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export default SwitchingTabs;
