"use client";

import useSWR from "swr";
import { Cohort } from "../types/cohorts";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

interface UseCohortsOptions {
  dateRange?: string;
  sortBy?: string;
  refreshInterval?: number;
}

interface CohortsResponse {
  cohorts: Cohort[];
  systemStats: {
    totalResidents: number;
    avgSystemUBZI: number;
    totalAlerts: number;
    criticalAlerts: number;
  };
  lastUpdated: string;
}

export function useCohorts(options: UseCohortsOptions = {}) {
  const {
    dateRange = "7d",
    sortBy = "name",
    refreshInterval = 15000, // 15 seconds
  } = options;

  const queryParams = new URLSearchParams({
    dateRange,
    sortBy,
  });

  const { data, error, mutate } = useSWR<CohortsResponse>(
    `/api/cohorts?${queryParams}`,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
    }
  );

  return {
    cohorts: data?.cohorts || [],
    systemStats: data?.systemStats || {
      totalResidents: 0,
      avgSystemUBZI: 0,
      totalAlerts: 0,
      criticalAlerts: 0,
    },
    lastUpdated: data?.lastUpdated,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}