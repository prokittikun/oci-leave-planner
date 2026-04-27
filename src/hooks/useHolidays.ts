'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PublicHoliday } from '@/types';

interface UseHolidaysReturn {
  holidays: PublicHoliday[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const holidaysCache: Record<string, PublicHoliday[]> = {};

export function useHolidays(year?: number): UseHolidaysReturn {
  const targetYear = year || new Date().getFullYear();
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHolidays = useCallback(async () => {
    // Check cache first
    const cacheKey = `${targetYear}`;
    if (holidaysCache[cacheKey]) {
      setHolidays(holidaysCache[cacheKey]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/holidays?year=${targetYear}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const parsed: PublicHoliday[] = data.holidays.map(
        (h: { date: string; name: string; type: string }) => ({
          date: new Date(h.date),
          name: h.name,
          type: h.type,
        })
      );

      holidaysCache[cacheKey] = parsed;
      setHolidays(parsed);
    } catch (err) {
      setError(
        `Failed to load holidays: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [targetYear]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  return { holidays, isLoading, error, refetch: fetchHolidays };
}
