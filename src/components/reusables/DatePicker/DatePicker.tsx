import React, { useEffect, useState, useRef } from "react";
import ListBox, { type ListBoxOption } from "../ListBox/ListBox";
import "../ListBox/ListBox.css";

interface DatePickerProps {
  value?: string; // ISO YYYY-MM-DD
  onChange: (value: string) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  error?: boolean | string;
  min?: string; // ISO
  max?: string; // ISO
  className?: string;
}

const pad = (n: number) => n.toString().padStart(2, "0");

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

const isoToParts = (iso?: string) => {
  if (!iso)
    return {
      y: undefined as number | undefined,
      m: undefined as number | undefined,
      d: undefined as number | undefined,
    };
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return { y: undefined, m: undefined, d: undefined };
  return {
    y: parseInt(m[1], 10),
    m: parseInt(m[2], 10),
    d: parseInt(m[3], 10),
  };
};

const buildYearOptions = (min?: string, max?: string) => {
  const today = new Date();
  // Default range: current year + 5 down to 1930
  const defaultMax = today.getFullYear() + 5;
  const defaultMin = 1930;
  const maxY = max ? isoToParts(max).y ?? defaultMax : defaultMax;
  const minY = min ? isoToParts(min).y ?? defaultMin : defaultMin;
  const years: ListBoxOption[] = [];
  for (let y = maxY; y >= minY; y--)
    years.push({ id: y, name: String(y), value: String(y) });
  return years;
};

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  error,
  min,
  max,
  className = "",
}) => {
  const parts = isoToParts(value);

  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    parts.y ? String(parts.y) : undefined
  );
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(
    parts.m ? pad(parts.m) : undefined
  );
  const [selectedDay, setSelectedDay] = useState<string | undefined>(
    parts.d ? pad(parts.d) : undefined
  );

  // keep in sync when value prop changes
  useEffect(() => {
    const p = isoToParts(value);
    setSelectedYear(p.y ? String(p.y) : undefined);
    setSelectedMonth(p.m ? pad(p.m) : undefined);
    setSelectedDay(p.d ? pad(p.d) : undefined);
  }, [value]);

  // build options
  const yearOptions = buildYearOptions(min, max);
  const monthOptions: ListBoxOption[] = monthNames.map((name, idx) => ({
    id: idx + 1,
    name,
    value: pad(idx + 1),
  }));

  const computeDayOptions = (y?: number, m?: number) => {
    // If year not provided but month is, assume current year to determine days (handles Feb leap-year preview)
    const yearForCalc = y ?? new Date().getFullYear();
    const num = m ? daysInMonth(yearForCalc, m) : 31;
    const arr: ListBoxOption[] = [];
    for (let d = 1; d <= num; d++)
      arr.push({ id: d, name: pad(d), value: pad(d) });
    return arr;
  };

  const dayOptions = computeDayOptions(
    selectedYear ? parseInt(selectedYear, 10) : undefined,
    selectedMonth ? parseInt(selectedMonth, 10) : undefined
  );

  // If selected day exceeds days in selected month, clamp it to the max day
  useEffect(() => {
    // If month changed but year not selected, use current year to clamp
    const y = selectedYear
      ? parseInt(selectedYear, 10)
      : new Date().getFullYear();
    if (!selectedMonth) return;
    const m = parseInt(selectedMonth, 10);
    const maxD = daysInMonth(y, m);
    if (selectedDay) {
      const sd = parseInt(selectedDay, 10);
      if (sd > maxD) {
        // clamp to maxD so UI shows a valid day
        setSelectedDay(String(maxD).padStart(2, "0"));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  // Only call onChange after mount (avoid spurious clears like TimePicker)
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (selectedYear && selectedMonth && selectedDay) {
      // clamp day if necessary
      const y = parseInt(selectedYear, 10);
      const m = parseInt(selectedMonth, 10);
      let d = parseInt(selectedDay, 10);
      const maxD = daysInMonth(y, m);
      if (d > maxD) d = maxD;
      const iso = `${String(y).padStart(4, "0")}-${pad(m)}-${pad(d)}`;
      onChange(iso);
    }
  }, [selectedYear, selectedMonth, selectedDay]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasError = !!error;
  const wrapperClass = `timepicker-row ${className} ${hasError ? "error" : ""}`;

  return (
    <label className="reusable-input-label">
      {label && <span className="reusable-input-label-text">{label}</span>}

      <div
        className={wrapperClass}
        style={{ display: "flex", gap: 5, width: "100%" }}
      >
        <div style={{ flex: "1 1 0" }}>
          <ListBox
            options={dayOptions}
            selected={
              dayOptions.find((o) => o.value === (selectedDay ?? "")) ?? null
            }
            onChange={(opt) => setSelectedDay(String(opt.value))}
            placeholder="DD"
            className="timepicker-day"
            disabled={disabled}
          />
        </div>

        <div style={{ flex: "1 1 0" }}>
          <ListBox
            options={monthOptions}
            selected={
              monthOptions.find((o) => o.value === (selectedMonth ?? "")) ??
              null
            }
            onChange={(opt) => setSelectedMonth(String(opt.value))}
            placeholder="MM"
            className="timepicker-month"
            disabled={disabled}
          />
        </div>

        <div style={{ flex: "1 1 0" }}>
          <ListBox
            options={yearOptions}
            selected={
              yearOptions.find((o) => o.value === (selectedYear ?? "")) ?? null
            }
            onChange={(opt) => setSelectedYear(String(opt.value))}
            placeholder="YYYY"
            className="timepicker-year"
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

export default DatePicker;
