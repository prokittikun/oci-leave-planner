// Core types for the leave planning system

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface EmployeeLeave {
  id: string;
  summary: string; // employee name
  startDate: Date;
  endDate: Date;
  description?: string;
}

export interface PublicHoliday {
  date: Date;
  name: string;
  type: string;
}

export interface LeaveCalculation {
  leaveDays: number;
  advanceLeaveDays: number;
  lastSubmitDate: Date | null;
  breakdown: LeaveBreakdown;
}

export interface LeaveBreakdown {
  totalDays: number;
  weekdaysCount: number;
  weekendsSkipped: number;
  holidaysSkipped: number;
  holidayDetails: { date: Date; name: string }[];
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isToday: boolean;
  employeeLeaves: EmployeeLeave[];
}

export type CalendarViewMode = 'month' | 'year';

export interface AppState {
  dateRange: DateRange;
  includeHolidays: boolean;
  holidays: PublicHoliday[];
  employeeLeaves: EmployeeLeave[];
  isLoadingHolidays: boolean;
  isLoadingLeaves: boolean;
  error: string | null;
}
