import useSWR from "swr";

export interface Alert {
  id: string;
  timestamp: string;
  severity: "critical" | "warning" | "info";
  residentId: string;
  residentName: string;
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
  resolved: boolean;
}

interface AlertsResponse {
  alerts: Alert[];
  total: number;
  critical: number;
  warning: number;
  info: number;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch alerts");
  }
  return response.json();
};

export const useAlerts = (refreshInterval = 15000) => {
  const { data, error, isLoading, mutate } = useSWR<AlertsResponse>(
    "/api/alerts",
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
    alerts: data?.alerts || [],
    alertCounts: {
      total: data?.total || 0,
      critical: data?.critical || 0,
      warning: data?.warning || 0,
      info: data?.info || 0,
    },
    isLoading,
    isError: error,
    mutate,
  };
};