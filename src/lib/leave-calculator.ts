import type { PublicHoliday, LeaveCalculation, DateRange } from '@/types';
import { getWeekdaysBetween, subtractWeekdays, validateDateRange, isBeforeToday } from './date-utils';

const ADVANCE_LEAVE_MULTIPLIER = 3;

/**
 * Calculate leave details based on a date range
 * 
 * Rules:
 * 1. leaveDays = count of weekdays (Mon-Fri) in range, excluding holidays
 * 2. advanceLeaveDays = leaveDays * 3
 * 3. lastSubmitDate = start date - advanceLeaveDays (weekdays only, excluding holidays)
 */
export function calculateLeave(
  dateRange: DateRange,
  holidays: PublicHoliday[],
  excludeHolidays: boolean = true
): LeaveCalculation | null {
  const validation = validateDateRange(dateRange.start, dateRange.end);
  if (!validation.valid || !dateRange.start || !dateRange.end) {
    return null;
  }

  const breakdown = getWeekdaysBetween(
    dateRange.start,
    dateRange.end,
    holidays,
    excludeHolidays
  );

  const leaveDays = breakdown.weekdaysCount;
  const advanceLeaveDays = leaveDays * ADVANCE_LEAVE_MULTIPLIER;

  const lastSubmitDate = leaveDays > 0
    ? subtractWeekdays(dateRange.start, advanceLeaveDays, holidays, excludeHolidays)
    : null;

  return {
    leaveDays,
    advanceLeaveDays,
    lastSubmitDate,
    breakdown: {
      totalDays: breakdown.weekdaysCount + breakdown.weekendsSkipped + breakdown.holidaysSkipped,
      weekdaysCount: breakdown.weekdaysCount,
      weekendsSkipped: breakdown.weekendsSkipped,
      holidaysSkipped: breakdown.holidaysSkipped,
      holidayDetails: breakdown.holidayDetails,
    },
  };
}

/**
 * Check if the leave request submission deadline has passed
 */
export function isSubmissionLate(lastSubmitDate: Date | null): boolean {
  if (!lastSubmitDate) return false;
  return isBeforeToday(lastSubmitDate);
}

/**
 * Get human-readable status of the leave request
 */
export function getSubmissionStatus(lastSubmitDate: Date | null): {
  status: 'ok' | 'warning' | 'late';
  message: string;
} {
  if (!lastSubmitDate) {
    return { status: 'ok', message: '' };
  }

  if (isSubmissionLate(lastSubmitDate)) {
    return {
      status: 'late',
      message: '⚠️ Too late to request this leave — the submission deadline has passed.',
    };
  }

  const now = new Date();
  const diffTime = lastSubmitDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    return {
      status: 'warning',
      message: `⏰ Deadline approaching — only ${diffDays} day${diffDays === 1 ? '' : 's'} left to submit.`,
    };
  }

  return {
    status: 'ok',
    message: `✅ You have ${diffDays} days to submit your leave request.`,
  };
}
