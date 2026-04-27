'use client';

import { useMemo, useState, useCallback, useRef } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  startOfDay,
} from 'date-fns';
import type { PublicHoliday, EmployeeLeave, DateRange } from '@/types';
import { isWeekend, isHoliday, getHolidayName } from '@/lib/date-utils';

interface CalendarProps {
  dateRange: DateRange;
  onDateSelect: (date: Date) => void;
  holidays: PublicHoliday[];
  employeeLeaves: EmployeeLeave[];
  onMonthChange?: (date: Date) => void;
}

export default function Calendar({
  dateRange,
  onDateSelect,
  holidays,
  employeeLeaves,
  onMonthChange,
}: CalendarProps) {
  const todayRef = useRef(new Date());
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const navigateMonth = useCallback(
    (direction: 'prev' | 'next') => {
      const newMonth =
        direction === 'prev'
          ? subMonths(currentMonth, 1)
          : addMonths(currentMonth, 1);
      setCurrentMonth(newMonth);
      onMonthChange?.(newMonth);
    },
    [currentMonth, onMonthChange]
  );

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const getEmployeeLeavesForDate = useCallback(
    (date: Date) => {
      const normalized = startOfDay(date);
      return employeeLeaves.filter((leave) => {
        const start = startOfDay(leave.startDate);
        // endDate in ICS is exclusive, so subtract 1 day
        const end = startOfDay(new Date(leave.endDate.getTime() - 86400000));
        return (
          isSameDay(normalized, start) ||
          isSameDay(normalized, end) ||
          (normalized >= start && normalized <= end)
        );
      });
    },
    [employeeLeaves]
  );

  const isInSelectedRange = useCallback(
    (date: Date) => {
      if (!dateRange.start) return false;

      const end = dateRange.end || hoveredDate;
      if (!end) return false;

      const rangeStart = dateRange.start < end ? dateRange.start : end;
      const rangeEnd = dateRange.start < end ? end : dateRange.start;

      return isWithinInterval(startOfDay(date), {
        start: startOfDay(rangeStart),
        end: startOfDay(rangeEnd),
      });
    },
    [dateRange, hoveredDate]
  );

  const handleMouseEnter = useCallback(
    (date: Date, event: React.MouseEvent) => {
      if (dateRange.start && !dateRange.end) {
        setHoveredDate(date);
      }

      const leavesOnDate = getEmployeeLeavesForDate(date);
      const holidayName = getHolidayName(date, holidays);

      const tooltipLines: string[] = [];
      if (holidayName) tooltipLines.push(`🏷️ ${holidayName}`);
      if (leavesOnDate.length > 0) {
        leavesOnDate.forEach((l) => tooltipLines.push(`👤 ${l.summary}`));
      }

      if (tooltipLines.length > 0) {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        setTooltip({
          text: tooltipLines.join('\n'),
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
        });
      }
    },
    [dateRange, holidays, getEmployeeLeavesForDate]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    if (dateRange.start && !dateRange.end) {
      // Keep hovered date
    }
  }, [dateRange]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="calendar-container">
      {/* Header */}
      <div className="calendar-header">
        <div className="flex items-center gap-3">
          <h2 className="calendar-title">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => {
              const now = new Date();
              setCurrentMonth(now);
              onMonthChange?.(now);
            }}
            className="today-btn"
          >
            Today
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="calendar-nav-btn"
            aria-label="Previous month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="calendar-nav-btn"
            aria-label="Next month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="calendar-weekdays">
        {weekDays.map((day) => (
          <div
            key={day}
            className={`calendar-weekday-label ${
              day === 'Sat' || day === 'Sun' ? 'weekend-label' : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="calendar-grid">
        {calendarDays.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const weekend = isWeekend(day);
          const holiday = isHoliday(day, holidays);
          const holidayName = getHolidayName(day, holidays);
          const today = isSameDay(day, todayRef.current);
          const leavesOnDay = getEmployeeLeavesForDate(day);
          const inRange = isInSelectedRange(day);
          const isStart =
            dateRange.start && isSameDay(day, dateRange.start);
          const isEnd = dateRange.end && isSameDay(day, dateRange.end);
          const hasEmployeeLeave = leavesOnDay.length > 0;

          let cellClass = 'calendar-day';
          if (!isCurrentMonth) cellClass += ' other-month';
          if (weekend) cellClass += ' weekend';
          if (holiday) cellClass += ' holiday';
          if (today) cellClass += ' today';
          if (inRange) cellClass += ' in-range';
          if (isStart) cellClass += ' range-start';
          if (isEnd) cellClass += ' range-end';
          if (hasEmployeeLeave) cellClass += ' has-leave';

          return (
            <button
              key={idx}
              className={cellClass}
              onClick={() => onDateSelect(day)}
              onMouseEnter={(e) => handleMouseEnter(day, e)}
              onMouseLeave={handleMouseLeave}
              aria-label={`${format(day, 'MMMM d, yyyy')}${
                holiday ? ` - Holiday: ${holidayName}` : ''
              }${hasEmployeeLeave ? ` - ${leavesOnDay.length} employee(s) on leave` : ''}`}
            >
              <span className="day-number">{format(day, 'd')}</span>
              {holiday && (
                <span className="day-indicator holiday-dot" title={holidayName}></span>
              )}
              {hasEmployeeLeave && (
                <span className="day-indicator leave-dot">
                  {leavesOnDay.length > 1 && (
                    <span className="leave-count">{leavesOnDay.length}</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="calendar-tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.text.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot legend-weekend"></span>
          <span>Weekend</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-holiday"></span>
          <span>Holiday</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-selected"></span>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-leave"></span>
          <span>Employee Leave</span>
        </div>
      </div>
    </div>
  );
}
