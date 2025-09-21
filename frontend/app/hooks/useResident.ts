'use client';

import useSWR from 'swr';
import { ResidentDetailResponse, TimeRange } from '../types/residents';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UseResidentProps {
  residentId: string;
  timeRange?: TimeRange['period'];
}

export function useResident({ residentId, timeRange = '7d' }: UseResidentProps) {
  const { data, error, isLoading, mutate } = useSWR<ResidentDetailResponse>(
    residentId ? `/api/residents/${residentId}?timeRange=${timeRange}` : null,
    fetcher,
    {
      refreshInterval: 15000, // 15 seconds auto-refresh
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    resident: data?.resident,
    vitalsHistory: data?.vitalsHistory,
    habitsHistory: data?.habitsHistory,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useResidents() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/residents',
    fetcher,
    {
      refreshInterval: 30000, // 30 seconds auto-refresh
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    residents: data?.residents || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 25,
    filters: data?.filters,
    isLoading,
    error,
    refresh: mutate,
  };
}