'use client';

import { startOfMonth, endOfMonth, isSameMonth, format } from 'date-fns';
import type { EmployeeLeave } from '@/types';
import { formatDate } from '@/lib/date-utils';

interface EmployeeLeaveListProps {
  leaves: EmployeeLeave[];
  isLoading: boolean;
  currentMonth: Date;
}

export default function EmployeeLeaveList({
  leaves,
  isLoading,
  currentMonth,
}: EmployeeLeaveListProps) {
  if (isLoading) {
    return (
      <div className="leave-list-skeleton">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-row">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-text">
              <div className="skeleton-line w-40"></div>
              <div className="skeleton-line w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter leaves that overlap with the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const filteredLeaves = leaves.filter((leave) => {
    const leaveStart = leave.startDate;
    // endDate in ICS is exclusive
    const leaveEnd = new Date(leave.endDate.getTime() - 86400000);
    
    return (
      (leaveStart >= monthStart && leaveStart <= monthEnd) ||
      (leaveEnd >= monthStart && leaveEnd <= monthEnd) ||
      (leaveStart <= monthStart && leaveEnd >= monthEnd)
    );
  });

  // Sort by start date
  const sortedLeaves = [...filteredLeaves].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );

  if (sortedLeaves.length === 0) {
    return (
      <div className="leave-list">
        <h3 className="leave-list-title">
          <span className="leave-list-icon">👥</span>
          Team Leaves ({format(currentMonth, 'MMMM')})
          <span className="leave-list-count">0</span>
        </h3>
        <div className="leave-list-empty">
          <p>No team leaves in {format(currentMonth, 'MMMM yyyy')}</p>
        </div>
      </div>
    );
  }

  // Group by name
  const grouped = sortedLeaves.reduce(
    (acc, leave) => {
      if (!acc[leave.summary]) {
        acc[leave.summary] = [];
      }
      acc[leave.summary].push(leave);
      return acc;
    },
    {} as Record<string, EmployeeLeave[]>
  );

  return (
    <div className="leave-list">
      <h3 className="leave-list-title">
        <span className="leave-list-icon">👥</span>
        Team Leaves ({format(currentMonth, 'MMMM')})
        <span className="leave-list-count">{sortedLeaves.length}</span>
      </h3>
      <div className="leave-list-items">
        {Object.entries(grouped).map(([name, entries]) => (
          <div key={name} className="leave-list-group">
            <div className="leave-list-name">
              <span className="leave-avatar">
                {name.charAt(0).toUpperCase()}
              </span>
              <span>{name}</span>
            </div>
            {entries.map((leave) => (
              <div key={leave.id} className="leave-list-date">
                {formatDate(leave.startDate, 'dd MMM')}
                {' → '}
                {formatDate(
                  new Date(leave.endDate.getTime() - 86400000),
                  'dd MMM yyyy'
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
