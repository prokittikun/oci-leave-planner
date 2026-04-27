'use client';

import { useCallback, useState, useEffect } from 'react';
import { isBefore, startOfDay } from 'date-fns';
import Calendar from '@/components/Calendar';
import DisplayPanel from '@/components/DisplayPanel';
import EmployeeLeaveList from '@/components/EmployeeLeaveList';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useHolidays } from '@/hooks/useHolidays';
import { useCompanyLeaveCalendar } from '@/hooks/useCompanyLeaveCalendar';
import { useLeaveCalculator } from '@/hooks/useLeaveCalculator';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026); // safe static default
  const [viewedDate, setViewedDate] = useState(new Date());

  useEffect(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setViewedDate(now);
    setMounted(true);
  }, []);

  const {
    holidays,
    isLoading: isLoadingHolidays,
    error: holidaysError,
  } = useHolidays(currentYear);

  const {
    leaves: employeeLeaves,
    isLoading: isLoadingLeaves,
    error: leavesError,
  } = useCompanyLeaveCalendar();

  const {
    dateRange,
    setDateRange,
    clearDateRange,
    includeHolidays,
    toggleHolidays,
    calculation,
    validationError,
    submissionStatus,
  } = useLeaveCalculator(holidays);

  const isLoading = isLoadingHolidays || isLoadingLeaves;
  const error = holidaysError || leavesError;

  // Handle date selection for range picking
  const handleDateSelect = useCallback(
    (date: Date) => {
      if (!dateRange.start || (dateRange.start && dateRange.end)) {
        // Start new selection
        setDateRange({ start: date, end: null });
      } else {
        // Complete the range
        if (isBefore(startOfDay(date), startOfDay(dateRange.start))) {
          // If clicked date is before start, swap
          setDateRange({ start: date, end: dateRange.start });
        } else {
          setDateRange({ start: dateRange.start, end: date });
        }
      }
    },
    [dateRange, setDateRange]
  );

  const handleMonthChange = useCallback(
    (date: Date) => {
      setViewedDate(date);
      const year = date.getFullYear();
      if (year !== currentYear) {
        setCurrentYear(year);
      }
    },
    [currentYear]
  );

  return (
    <div className="app-container">
      {/* Background decoration */}
      <div className="bg-decoration">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="url(#logo-grad)" />
                <path
                  d="M10 14H26M10 14V26C10 27.1 10.9 28 12 28H24C25.1 28 26 27.1 26 26V14M10 14V12C10 10.9 10.9 10 12 10H14M26 14V12C26 10.9 25.1 10 24 10H22M14 8V12M22 8V12M14 10H22"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="15" cy="19" r="1.5" fill="white" />
                <circle cx="21" cy="19" r="1.5" fill="white" />
                <circle cx="15" cy="24" r="1.5" fill="white" />
                <defs>
                  <linearGradient id="logo-grad" x1="0" y1="0" x2="36" y2="36">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h1 className="app-title">OCI Leave Planner</h1>
              <p className="app-subtitle">
                Plan your leave with confidence
              </p>
            </div>
          </div>
          <div className="header-right">
            {dateRange.start && (
              <span className="selection-hint">
                {dateRange.end
                  ? '✅ Range selected'
                  : '👆 Click end date'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="14" r="0.75" fill="currentColor" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {!mounted || isLoading ? (
          <LoadingSpinner message="Loading holidays & team leaves..." />
        ) : (
          <div className="content-grid">
            {/* Left: Calendar + Employee Leaves */}
            <div className="calendar-section">
              <Calendar
                dateRange={dateRange}
                onDateSelect={handleDateSelect}
                holidays={holidays}
                employeeLeaves={employeeLeaves}
                onMonthChange={handleMonthChange}
              />
              <EmployeeLeaveList
                leaves={employeeLeaves}
                isLoading={isLoadingLeaves}
                currentMonth={viewedDate}
              />
            </div>

            {/* Right: Display Panel */}
            <div className="panel-section">
              <DisplayPanel
                dateRange={dateRange}
                calculation={calculation}
                validationError={validationError}
                submissionStatus={submissionStatus}
                includeHolidays={includeHolidays}
                onToggleHolidays={toggleHolidays}
                onClear={clearDateRange}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          OCI Leave Calculator • Thailand Holidays •{' '}
          2026
        </p>
      </footer>
    </div>
  );
}
