'use client';

import { useState, useEffect, useCallback } from 'react';
import type { EmployeeLeave } from '@/types';

interface UseCompanyLeaveCalendarReturn {
  leaves: EmployeeLeave[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

let cachedLeaves: EmployeeLeave[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useCompanyLeaveCalendar(): UseCompanyLeaveCalendarReturn {
  const [leaves, setLeaves] = useState<EmployeeLeave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaves = useCallback(async () => {
    // Check cache
    if (cachedLeaves && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setLeaves(cachedLeaves);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leaves');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const parsed: EmployeeLeave[] = (data.events || []).map(
        (e: {
          id: string;
          summary: string;
          startDate: string;
          endDate: string;
          description?: string;
        }) => ({
          id: e.id,
          summary: e.summary,
          startDate: new Date(e.startDate),
          endDate: new Date(e.endDate),
          description: e.description,
        })
      );

      cachedLeaves = parsed;
      cacheTimestamp = Date.now();
      setLeaves(parsed);
    } catch (err) {
      setError(
        `Failed to load employee leaves: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  return { leaves, isLoading, error, refetch: fetchLeaves };
}
