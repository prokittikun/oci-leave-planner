import { useState } from 'react';
import type { LeaveCalculation, DateRange } from '@/types';
import { formatDate } from '@/lib/date-utils';

interface DisplayPanelProps {
  dateRange: DateRange;
  calculation: LeaveCalculation | null;
  validationError: string | null;
  submissionStatus: { status: 'ok' | 'warning' | 'late'; message: string };
  includeHolidays: boolean;
  onToggleHolidays: () => void;
  onClear: () => void;
}

export default function DisplayPanel({
  dateRange,
  calculation,
  validationError,
  submissionStatus,
  includeHolidays,
  onToggleHolidays,
  onClear,
}: DisplayPanelProps) {
  const [copied, setCopied] = useState(false);
  const hasSelection = dateRange.start && dateRange.end;

  const handleCopySummary = () => {
    if (!calculation || !dateRange.start || !dateRange.end) return;

    const summary = `
📅 Leave Request Summary
Period: ${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}
Total Leave Days: ${calculation.leaveDays} days
Last Date to Submit: ${formatDate(calculation.lastSubmitDate!, 'EEEE, dd MMMM yyyy')}

Breakdown:
- Weekdays: ${calculation.breakdown.weekdaysCount}
- Weekends skipped: ${calculation.breakdown.weekendsSkipped}
- Holidays skipped: ${calculation.breakdown.holidaysSkipped}
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="display-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="flex flex-col">
          <h2 className="panel-title">Leave Calculation</h2>
          <span className="simulation-badge">
            <span className="simulation-dot"></span>
            Real-time Simulation
          </span>
        </div>
        {hasSelection && (
          <button onClick={onClear} className="clear-btn">
            Clear
          </button>
        )}
      </div>

      {/* Date Range Display */}
      {hasSelection ? (
        <div className="date-range-display">
          <div className="date-range-row">
            <span className="date-label">From</span>
            <span className="date-value">{formatDate(dateRange.start!)}</span>
          </div>
          <div className="date-range-divider">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4L10 16M10 16L15 11M10 16L5 11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="date-range-row">
            <span className="date-label">To</span>
            <span className="date-value">{formatDate(dateRange.end!)}</span>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon flex justify-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect
                x="6"
                y="10"
                width="36"
                height="32"
                rx="4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M6 18H42"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16 6V14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M32 6V14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="24" cy="28" r="2" fill="currentColor" />
              <circle cx="16" cy="28" r="2" fill="currentColor" />
              <circle cx="32" cy="28" r="2" fill="currentColor" />
              <circle cx="24" cy="36" r="2" fill="currentColor" />
              <circle cx="16" cy="36" r="2" fill="currentColor" />
            </svg>
          </div>
          <p className="empty-text">
            Select a date range on the calendar to calculate your leave
          </p>
          <p className="empty-hint">
            Click a start date, then an end date
          </p>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="validation-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M8 4.5V9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
          </svg>
          <span>{validationError}</span>
        </div>
      )}

      {/* Toggle */}
      <div className="toggle-row">
        <span className="toggle-label">Exclude public holidays</span>
        <button
          onClick={onToggleHolidays}
          className={`toggle-switch ${includeHolidays ? 'active' : ''}`}
          role="switch"
          aria-checked={includeHolidays}
          aria-label="Toggle exclude holidays"
        >
          <span className="toggle-thumb" />
        </button>
      </div>

      {/* Calculation Results */}
      {calculation && (
        <div className="calculation-results">
          {/* Primary Stats */}
          <div className="stat-grid">
            <div className="stat-card primary">
              <span className="stat-number">{calculation.leaveDays}</span>
              <span className="stat-label">Leave Days</span>
              <span className="stat-hint">Weekdays only</span>
            </div>
            <div className="stat-card accent">
              <span className="stat-number">{calculation.advanceLeaveDays}</span>
              <span className="stat-label">Advance Days</span>
              <span className="stat-hint">×3 multiplier</span>
            </div>
          </div>

          {/* Last Submit Date */}
          {calculation.lastSubmitDate && (
            <div className={`submit-date-card ${submissionStatus.status}`}>
              <div className="submit-date-header">
                <span className="submit-date-label">Last Date to Submit</span>
                <span className={`status-badge ${submissionStatus.status}`}>
                  {submissionStatus.status === 'late'
                    ? 'Overdue'
                    : submissionStatus.status === 'warning'
                    ? 'Soon'
                    : 'On Time'}
                </span>
              </div>
              <span className="submit-date-value">
                {formatDate(calculation.lastSubmitDate, 'EEEE, dd MMMM yyyy')}
              </span>
              {submissionStatus.message && (
                <p className="submit-date-message">{submissionStatus.message}</p>
              )}
              <button 
                onClick={handleCopySummary}
                className={`copy-summary-btn ${copied ? 'copied' : ''}`}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <rect x="5.33331" y="5.33331" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M10.6667 2.66669H4C3.26362 2.66669 2.66669 3.26362 2.66669 4V10.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Copy Plan
                  </>
                )}
              </button>
            </div>
          )}

          {/* Breakdown */}
          <div className="breakdown-card">
            <h3 className="breakdown-title">Breakdown</h3>
            <div className="breakdown-rows">
              <div className="breakdown-row">
                <span className="breakdown-label">
                  <span className="breakdown-icon">📅</span>
                  Total calendar days
                </span>
                <span className="breakdown-value">{calculation.breakdown.totalDays}</span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">
                  <span className="breakdown-icon">💼</span>
                  Weekdays counted
                </span>
                <span className="breakdown-value highlight">
                  {calculation.breakdown.weekdaysCount}
                </span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">
                  <span className="breakdown-icon">🛋️</span>
                  Weekends skipped
                </span>
                <span className="breakdown-value dimmed">
                  −{calculation.breakdown.weekendsSkipped}
                </span>
              </div>
              <div className="breakdown-row">
                <span className="breakdown-label">
                  <span className="breakdown-icon">🎌</span>
                  Holidays skipped
                </span>
                <span className="breakdown-value dimmed">
                  −{calculation.breakdown.holidaysSkipped}
                </span>
              </div>
            </div>

            {/* Holiday Details */}
            {calculation.breakdown.holidayDetails.length > 0 && (
              <div className="holiday-details">
                <h4 className="holiday-details-title">Holidays in range</h4>
                {calculation.breakdown.holidayDetails.map((h, i) => (
                  <div key={i} className="holiday-detail-row">
                    <span className="holiday-detail-date">
                      {formatDate(h.date, 'dd MMM')}
                    </span>
                    <span className="holiday-detail-name">{h.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formula Explanation */}
          <div className="formula-card">
            <h3 className="formula-title">
              Calculation Logic
              <div className="info-tooltip-container">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="info-icon">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M8 11V8M8 5V5.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div className="info-tooltip-content">
                  Rules follow the company standard for leave planning: (Working Days × 3) in advance.
                </div>
              </div>
            </h3>
            <div className="formula-steps">
              <div className="formula-step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <div className="flex items-center gap-2">
                    <span className="step-label">Identify Leave Days</span>
                  </div>
                  <span className="step-detail">
                    Counts only Mon–Fri. {includeHolidays ? 'Holidays are excluded.' : 'Holidays are included.'}
                  </span>
                </div>
              </div>
              <div className="formula-step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <span className="step-label">Calculate Advance Buffer</span>
                  <span className="step-detail">
                    Multiplier is 3x. For {calculation.leaveDays} day(s) leave, you need {calculation.advanceLeaveDays} weekdays buffer.
                  </span>
                </div>
              </div>
              <div className="formula-step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <span className="step-label">Submission Deadline</span>
                  <span className="step-detail">
                    Count back {calculation.advanceLeaveDays} weekdays from start date.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
