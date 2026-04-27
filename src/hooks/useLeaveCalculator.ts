'use client';

import { useState, useMemo, useCallback } from 'react';
import type { DateRange, PublicHoliday, LeaveCalculation } from '@/types';
import { calculateLeave, getSubmissionStatus } from '@/lib/leave-calculator';
import { validateDateRange } from '@/lib/date-utils';

interface UseLeaveCalculatorReturn {
  dateRange: DateRange;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  setDateRange: (range: DateRange) => void;
  clearDateRange: () => void;
  includeHolidays: boolean;
  toggleHolidays: () => void;
  calculation: LeaveCalculation | null;
  validationError: string | null;
  submissionStatus: { status: 'ok' | 'warning' | 'late'; message: string };
}

export function useLeaveCalculator(
  holidays: PublicHoliday[]
): UseLeaveCalculatorReturn {
  const [dateRange, setDateRangeState] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [includeHolidays, setIncludeHolidays] = useState(false);

  const setStartDate = useCallback((date: Date | null) => {
    setDateRangeState((prev) => ({ ...prev, start: date }));
  }, []);

  const setEndDate = useCallback((date: Date | null) => {
    setDateRangeState((prev) => ({ ...prev, end: date }));
  }, []);

  const setDateRange = useCallback((range: DateRange) => {
    setDateRangeState(range);
  }, []);

  const clearDateRange = useCallback(() => {
    setDateRangeState({ start: null, end: null });
  }, []);

  const toggleHolidays = useCallback(() => {
    setIncludeHolidays((prev) => !prev);
  }, []);

  const validationError = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return null;
    if (dateRange.start && !dateRange.end) return null; // Still selecting
    const validation = validateDateRange(dateRange.start, dateRange.end);
    return validation.valid ? null : validation.error || null;
  }, [dateRange]);

  const calculation = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return null;
    if (validationError) return null;
    return calculateLeave(dateRange, holidays, includeHolidays);
  }, [dateRange, holidays, includeHolidays, validationError]);

  const submissionStatus = useMemo(() => {
    if (!calculation?.lastSubmitDate) {
      return { status: 'ok' as const, message: '' };
    }
    return getSubmissionStatus(calculation.lastSubmitDate);
  }, [calculation]);

  return {
    dateRange,
    setStartDate,
    setEndDate,
    setDateRange,
    clearDateRange,
    includeHolidays,
    toggleHolidays,
    calculation,
    validationError,
    submissionStatus,
  };
}
