import React, { useEffect, useState, useRef } from "react";
import ListBox, { type ListBoxOption } from "../ListBox/ListBox";
import "../ListBox/ListBox.css";

export interface TimeOption {
  id?: string | number;
  value: string; // ISO time like "08:00" or "13:30"
  label?: string; // Display label like "8:00 AM"
}

interface TimePickerProps {
  /** Automatically generate options if not provided */
  options?: TimeOption[];
  value?: string;
  selected?: TimeOption | null;
  onChange: (opt: TimeOption) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: React.ReactNode;
  error?: boolean | string;
  /** step in minutes for generated options (default 30) */
  step?: number;
}

const formatLabel = (hour24: number, minute: number) => {
  const period = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  const mm = minute.toString().padStart(2, "0");
  return `${hour12}:${mm} ${period}`;
};

/* generateOptions removed — TimePicker now renders three ListBox dropdowns (hour/minute/period) */

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  className = "",
  disabled = false,
  label,
  error,
  step = 30,
}) => {
  // Build hour/minute/period options using ListBoxOption shape so we reuse ListBox styling
  const pad = (n: number) => n.toString().padStart(2, "0");

  const hourOptions: ListBoxOption[] = Array.from({ length: 12 }, (_, i) => {
    const hourValue = i + 1;
    const value = pad(hourValue);
    return { id: hourValue, name: String(hourValue), value };
  });

  // Minute options: show every minute from 00 to 59
  const minuteOptions: ListBoxOption[] = Array.from({ length: 60 }, (_, i) => {
    const mm = pad(i);
    return { id: mm, name: mm, value: mm };
  });

  const periodOptions: ListBoxOption[] = [
    { id: "AM", name: "AM", value: "AM" },
    { id: "PM", name: "PM", value: "PM" },
  ];

  // parse incoming value which may be "HH:MM" (24h) or "h:MM AM/PM"
  const parseIncoming = (val?: string) => {
    if (!val) return { hour12: "12", minute: "00", period: "AM", hour24: 0 };
    const trimmed = String(val).trim();
    const ampmMatch = /(AM|PM)$/i.test(trimmed);
    if (ampmMatch) {
      const m = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (m) {
        const parsedHour = parseInt(m[1], 10);
        const minute = parseInt(m[2], 10);
        const period = m[3].toUpperCase();
        let hour24 = parsedHour % 12;
        if (period === "PM") hour24 += 12;
        return {
          hour12: String(parsedHour).padStart(2, "0"),
          minute: pad((Math.round(minute / step) * step) % 60),
          period,
          hour24,
        };
      }
    }

    const m24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (m24) {
      const hour24 = parseInt(m24[1], 10);
      const minute = parseInt(m24[2], 10);
      const period = hour24 >= 12 ? "PM" : "AM";
      let hour12 = hour24 % 12;
      if (hour12 === 0) hour12 = 12;
      return {
        hour12: String(hour12).padStart(2, "0"),
        minute: pad((Math.round(minute / step) * step) % 60),
        period,
        hour24,
      };
    }

    return { hour12: "12", minute: "00", period: "AM", hour24: 0 };
  };

  const parsed = parseIncoming(value);

  const [selectedHour, setSelectedHour] = useState<string>(
    parsed.hour12.padStart(2, "0")
  );
  const [selectedMinute, setSelectedMinute] = useState<string>(parsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(parsed.period);

  // Keep local state in sync when external value changes
  useEffect(() => {
    const p = parseIncoming(value);
    setSelectedHour(p.hour12.padStart(2, "0"));
    setSelectedMinute(p.minute);
    setSelectedPeriod(p.period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // When any part changes, compute 24-hour value and call onChange
  // Skip calling onChange on first mount to avoid spurious clears of form-level errors
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    let hour24 = parseInt(selectedHour, 10) % 12;
    if (selectedPeriod === "PM") hour24 += 12;
    const minuteNum = parseInt(selectedMinute, 10) || 0;
    const val24 = `${pad(hour24)}:${pad(minuteNum)}`;
    const labelText = formatLabel(hour24, minuteNum);
    onChange({ id: val24, value: val24, label: labelText });
  }, [selectedHour, selectedMinute, selectedPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasError = !!error;
  const wrapperClass = `timepicker-row ${className} ${hasError ? "error" : ""}`;

  return (
    <label className="reusable-input-label" style={{ width: undefined }}>
      {label && <span className="reusable-input-label-text">{label}</span>}

      <div
        className={wrapperClass}
        style={{ display: "flex", gap: 5, width: "100%" }}
      >
        <div style={{ flex: "1 1 0" }}>
          <ListBox
            options={hourOptions.map((o) => ({
              id: o.id,
              name: o.name,
              value: o.value,
            }))}
            selected={hourOptions.find((o) => o.value === selectedHour) ?? null}
            onChange={(opt) => setSelectedHour(String(opt.value))}
            placeholder="HH"
            className="timepicker-hour"
            disabled={disabled}
          />
        </div>

        <div style={{ flex: "1 1 0" }}>
          <ListBox
            options={minuteOptions.map((o) => ({
              id: o.id,
              name: o.name,
              value: o.value,
            }))}
            selected={
              minuteOptions.find((o) => o.value === selectedMinute) ?? null
            }
            onChange={(opt) => setSelectedMinute(String(opt.value))}
            placeholder="MM"
            className="timepicker-minute"
            disabled={disabled}
          />
        </div>

        <div style={{ flex: "1 1 0" }}>
          <ListBox
            options={periodOptions}
            selected={
              periodOptions.find((o) => o.value === selectedPeriod) ?? null
            }
            onChange={(opt) => setSelectedPeriod(String(opt.value))}
            placeholder="AM/PM"
            className="timepicker-period"
            disabled={disabled}
          />
        </div>
      </div>

      {hasError && (
        <div className="reusable-input-error">
          {typeof error === "string" ? error : "This field is required"}
        </div>
      )}
    </label>
  );
};

export default TimePicker;
