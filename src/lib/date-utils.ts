import {
  isWeekend as dateFnsIsWeekend,
  eachDayOfInterval,
  subDays,
  format,
  isSameDay,
  startOfDay,
  isAfter,
  isBefore,
  differenceInCalendarDays,
} from 'date-fns';
import type { PublicHoliday } from '@/types';

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  return dateFnsIsWeekend(date);
}

/**
 * Check if a date is a Thai public holiday
 */
export function isHoliday(date: Date, holidays: PublicHoliday[]): boolean {
  const normalized = startOfDay(date);
  return holidays.some((h) => isSameDay(startOfDay(h.date), normalized));
}

/**
 * Get the holiday name for a specific date
 */
export function getHolidayName(
  date: Date,
  holidays: PublicHoliday[]
): string | undefined {
  const normalized = startOfDay(date);
  const holiday = holidays.find((h) => isSameDay(startOfDay(h.date), normalized));
  return holiday?.name;
}

/**
 * Check if a date is a non-working day (weekend or holiday)
 */
export function isNonWorkingDay(
  date: Date,
  holidays: PublicHoliday[],
  excludeHolidays: boolean = true
): boolean {
  if (isWeekend(date)) return true;
  if (excludeHolidays && isHoliday(date, holidays)) return true;
  return false;
}

/**
 * Count weekdays between two dates, optionally excluding holidays
 */
export function getWeekdaysBetween(
  start: Date,
  end: Date,
  holidays: PublicHoliday[],
  excludeHolidays: boolean = true
): {
  weekdaysCount: number;
  weekendsSkipped: number;
  holidaysSkipped: number;
  holidayDetails: { date: Date; name: string }[];
} {
  if (isAfter(startOfDay(start), startOfDay(end))) {
    return {
      weekdaysCount: 0,
      weekendsSkipped: 0,
      holidaysSkipped: 0,
      holidayDetails: [],
    };
  }

  const days = eachDayOfInterval({
    start: startOfDay(start),
    end: startOfDay(end),
  });

  let weekdaysCount = 0;
  let weekendsSkipped = 0;
  let holidaysSkipped = 0;
  const holidayDetails: { date: Date; name: string }[] = [];

  for (const day of days) {
    if (isWeekend(day)) {
      weekendsSkipped++;
    } else if (excludeHolidays && isHoliday(day, holidays)) {
      holidaysSkipped++;
      const name = getHolidayName(day, holidays);
      holidayDetails.push({ date: day, name: name || 'Public Holiday' });
    } else {
      weekdaysCount++;
    }
  }

  return { weekdaysCount, weekendsSkipped, holidaysSkipped, holidayDetails };
}

/**
 * Subtract N weekdays from a date (going backwards), skipping weekends and holidays
 */
export function subtractWeekdays(
  date: Date,
  days: number,
  holidays: PublicHoliday[],
  excludeHolidays: boolean = true
): Date {
  let result = startOfDay(date);
  let remaining = days;

  while (remaining > 0) {
    result = subDays(result, 1);
    if (!isNonWorkingDay(result, holidays, excludeHolidays)) {
      remaining--;
    }
  }

  return result;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date, formatStr: string = 'dd MMM yyyy'): string {
  return format(date, formatStr);
}

/**
 * Format a date range for display
 */
export function formatDateRange(start: Date, end: Date): string {
  return `${formatDate(start)} — ${formatDate(end)}`;
}

/**
 * Validate a date range
 */
export function validateDateRange(
  start: Date | null,
  end: Date | null
): { valid: boolean; error?: string } {
  if (!start || !end) {
    return { valid: false, error: 'Please select both start and end dates' };
  }

  if (isAfter(startOfDay(start), startOfDay(end))) {
    return { valid: false, error: 'End date must be after start date' };
  }

  const daysDiff = differenceInCalendarDays(end, start);
  if (daysDiff > 365) {
    return { valid: false, error: 'Date range cannot exceed 365 days' };
  }

  return { valid: true };
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is before today
 */
export function isBeforeToday(date: Date): boolean {
  return isBefore(startOfDay(date), startOfDay(new Date()));
}
