"use client";

import { useSession } from "next-auth/react";
import { useAggregations } from "@/app/hooks/useAggregations";
import { useAlerts } from "@/app/hooks/useAlerts";
import UBZIGauge from "@/app/components/UBZIGauge";
import TrendChart from "@/app/components/TrendChart";
import AlertFeed from "@/app/components/AlertFeed";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import EmptyState from "@/app/components/EmptyState";
import { SkeletonDashboardCard, SkeletonChartCard } from "@/app/components/SkeletonLoader";

function DashboardContent() {
  const { data: session } = useSession();
  const { aggregations, isLoading, isError } = useAggregations();
  const { alerts, alertCounts } = useAlerts();

  if (isLoading) {
    return (
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <SkeletonDashboardCard key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            <SkeletonChartCard />
          </div>
          <div className="lg:col-span-1">
            <SkeletonChartCard className="h-96" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SkeletonChartCard />
          <SkeletonChartCard />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-4 sm:px-0">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h3 className="font-medium">Failed to load dashboard data</h3>
          <p className="text-sm mt-1">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const previousUBZI = aggregations?.trends?.daily?.[5] || 70;
  const trendValue = aggregations ? ((aggregations.systemUBZI - previousUBZI) / previousUBZI) * 100 : 0;

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Urban Blue Zone Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back, {session?.user?.email || "Development Mode"}
        </p>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-blue-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    System UBZI
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {aggregations?.systemUBZI || 0}
                    </div>
                    {trendValue !== 0 && (
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${trendValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <svg className={`self-center flex-shrink-0 h-5 w-5 ${trendValue > 0 ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                          {trendValue > 0 ? (
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          )}
                        </svg>
                        <span className="sr-only">{trendValue > 0 ? 'Increased' : 'Decreased'} by</span>
                        {Math.abs(trendValue).toFixed(1)}%
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-green-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Residents
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {aggregations?.totalResidents || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`rounded-md ${alertCounts.critical > 0 ? 'bg-red-500' : alertCounts.warning > 0 ? 'bg-yellow-500' : 'bg-green-500'} p-3`}>
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Alerts
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {alertCounts.total}
                    </div>
                    {alertCounts.critical > 0 && (
                      <span className="ml-2 text-sm font-medium text-red-600">
                        {alertCounts.critical} critical
                      </span>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-md bg-purple-500 p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Trend
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {trendValue > 0 ? 'Improving' : trendValue < 0 ? 'Declining' : 'Stable'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2">
          <ErrorBoundary>
            <TrendChart
              data={aggregations?.historicalData || []}
              title="UBZI Score Trends"
              showCohortComparison={true}
              type="area"
            />
          </ErrorBoundary>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
            <ErrorBoundary>
              <UBZIGauge
                value={aggregations?.systemUBZI || 0}
                size="medium"
                showTrend={true}
                trendValue={trendValue}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* Cohort Summary and Alert Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Cohort Performance</h2>
          <div className="grid grid-cols-1 gap-4">
            {aggregations?.cohorts && Object.keys(aggregations.cohorts).length > 0 ? (
              Object.entries(aggregations.cohorts).map(([key, cohort]) => (
                <div key={key} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 capitalize">{key}</h3>
                        <dl className="mt-3 grid grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Count</dt>
                            <dd className="mt-1 text-xl font-semibold text-gray-900">{cohort.count}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Avg UBZI</dt>
                            <dd className="mt-1 text-xl font-semibold text-gray-900">{cohort.avgUBZI}</dd>
                          </div>
                        </dl>
                      </div>
                      <div className="ml-4">
                        <ErrorBoundary>
                          <UBZIGauge
                            value={cohort.avgUBZI}
                            size="small"
                            showTrend={false}
                          />
                        </ErrorBoundary>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No cohort data available"
                description="Cohort performance metrics will appear here once data is available."
              />
            )}
          </div>
        </div>

        <div>
          <ErrorBoundary>
            <AlertFeed
              alerts={alerts}
              maxAlerts={10}
              autoRefresh={true}
              refreshInterval={15000}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}