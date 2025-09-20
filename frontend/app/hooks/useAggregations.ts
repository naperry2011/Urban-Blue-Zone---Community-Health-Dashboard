import useSWR from "swr";

interface AggregationData {
  systemUBZI: number;
  totalResidents: number;
  activeAlerts: number;
  cohorts: {
    senior: { count: number; avgUBZI: number };
    adult: { count: number; avgUBZI: number };
    teen: { count: number; avgUBZI: number };
  };
  trends: {
    daily: number[];
    weekly: number[];
  };
  historicalData: Array<{
    date: string;
    value: number;
    cohortAvg: number;
  }>;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch aggregations");
  }
  return response.json();
};

export const useAggregations = (refreshInterval = 15000) => {
  const { data, error, isLoading, mutate } = useSWR<AggregationData>(
    "/api/aggregations",
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    aggregations: data,
    isLoading,
    isError: error,
    mutate,
  };
};