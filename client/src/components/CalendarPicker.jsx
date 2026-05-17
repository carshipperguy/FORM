import React, { useState, useEffect, useRef } from "react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function parseYYYYMMDD(str) {
  if (!str || typeof str !== "string") return null;
  const parts = str.split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(y, m, d);
}

const CalendarPicker = ({ value, onChange }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState("up");
  const [viewDate, setViewDate] = useState(() => {
    const base = value ? parseYYYYMMDD(value) : new Date();
    const d = base || new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [isOpen]);

  const selectedDate = value ? parseYYYYMMDD(value) : null;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const handleSelect = (day) => {
    const picked = new Date(year, month, day);
    picked.setHours(0, 0, 0, 0);
    if (picked < today) return;
    const y = picked.getFullYear();
    const m = String(picked.getMonth() + 1).padStart(2, "0");
    const d = String(picked.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const goToPrevMonth = () => {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const goToNextMonth = () => {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const isPrevDisabled =
    year === today.getFullYear() && month === today.getMonth();

  const displayText = value
    ? (() => {
        const d = parseYYYYMMDD(value);
        if (!d) return "Select a date";
        return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
      })()
    : "Select a date";

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!isOpen && wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            const spaceAbove = rect.top;
            const calendarHeight = 230;
            setOpenDirection(spaceAbove >= calendarHeight ? "up" : "down");
          }
          setIsOpen((o) => !o);
        }}
        onKeyDown={(e) => e.key === "Enter" && setIsOpen((o) => !o)}
        style={{
          width: "100%",
          height: "40px",
          padding: "0 10px",
          border: "1px solid #E5E7EB",
          fontSize: "14px",
          color: value ? "#262626" : "#a0aec0",
          backgroundColor: "white",
          cursor: "pointer",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          touchAction: "manipulation",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {displayText}
      </div>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            ...(openDirection === "up"
              ? { bottom: "calc(100% + 2px)" }
              : { top: "calc(100% + 2px)" }),
            left: 0,
            width: "100%",
            backgroundColor: "white",
            border: "1px solid #E5E7EB",
            boxShadow: openDirection === "up"
              ? "0 -2px 8px rgba(0,0,0,0.12)"
              : "0 2px 8px rgba(0,0,0,0.12)",
            zIndex: 1100,
            padding: "8px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <button
              type="button"
              onClick={goToPrevMonth}
              disabled={isPrevDisabled}
              style={{
                background: "none",
                border: "none",
                padding: "4px 10px",
                cursor: isPrevDisabled ? "not-allowed" : "pointer",
                color: isPrevDisabled ? "#d1d5db" : "#002C42",
                fontSize: "20px",
                lineHeight: 1,
                touchAction: "manipulation",
              }}
            >
              ‹
            </button>
            <span
              style={{
                fontWeight: 600,
                fontSize: "14px",
                color: "#002C42",
                fontFamily: "Arial, sans-serif",
              }}
            >
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              style={{
                background: "none",
                border: "none",
                padding: "4px 10px",
                cursor: "pointer",
                color: "#002C42",
                fontSize: "20px",
                lineHeight: 1,
                touchAction: "manipulation",
              }}
            >
              ›
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              textAlign: "center",
              marginBottom: "4px",
            }}
          >
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                style={{
                  fontSize: "11px",
                  color: "#718096",
                  fontWeight: 600,
                  padding: "2px 0",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "1px",
            }}
          >
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const thisDate = new Date(year, month, day);
              thisDate.setHours(0, 0, 0, 0);
              const isPast = thisDate < today;
              const isToday = thisDate.getTime() === today.getTime();
              const isSelected =
                selectedDate &&
                thisDate.getTime() === selectedDate.getTime();

              return (
                <div
                  key={i}
                  onClick={() => !isPast && handleSelect(day)}
                  style={{
                    padding: "6px 2px",
                    fontSize: "13px",
                    textAlign: "center",
                    borderRadius: "2px",
                    cursor: isPast ? "default" : "pointer",
                    color: isPast
                      ? "#d1d5db"
                      : isSelected
                      ? "white"
                      : "#262626",
                    backgroundColor: isSelected ? "#002C42" : "transparent",
                    fontWeight: isToday ? 700 : 400,
                    outline:
                      isToday && !isSelected ? "1px solid #002C42" : "none",
                    touchAction: "manipulation",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPicker;
