import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

import ActivityTabs from '../../components/Athlete/dashboard/ActivityTabs';
import MetricsOverview from '../../components/Athlete/dashboard/MetricsOverview';
import PmcChart from '../../components/Athlete/dashboard/PmcChart';
import TodayAndDiagnosticsPanel from '../../components/Athlete/dashboard/TodayAndDiagnosticsPanel';

export default function AthleteDashboard() {
  const [metrics, setMetrics] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users/daily-metrics'),
      api.get('/users/training-sessions')
    ])
      .then(([metricsRes, sessionsRes]) => {
        const rawMetrics = metricsRes.data?.metrics || metricsRes.data?.data || metricsRes.data || [];
        const rawSessions = sessionsRes.data?.trainingSessions || sessionsRes.data?.sessions || sessionsRes.data || [];

        setMetrics(Array.isArray(rawMetrics) ? rawMetrics : []);
        setActivities(Array.isArray(rawSessions) ? rawSessions : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard API Sync Error:", err);
        setLoading(false);
      });
  }, []);

  const latestMetric = metrics.length > 0 ? metrics[metrics.length - 1] : {};

  const todaySession = activities.find((a) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return a.date?.startsWith(todayStr);
  }) || activities[0];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#121212] text-zinc-400 text-xs font-mono">
        Syncing TrainLoop telemetry...
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#181818] text-zinc-100 flex flex-col gap-2.5 p-3 font-sans overflow-hidden box-border">
      {/* ROW 1: METRICS OVERVIEW */}
      <div className="shrink-0">
        <MetricsOverview metric={latestMetric} />
      </div>

      {/* ROW 2: MAIN GRID (STRETCHES VERTICALLY TO FILL SCREEN) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        
        {/* LEFT SECTION (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full min-h-0">
          <div className="flex-1 min-h-0 flex flex-col">
            <PmcChart metrics={metrics} />
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <ActivityTabs activities={activities} />
          </div>
        </div>

        {/* RIGHT SECTION (4 COLS) */}
        <div className="lg:col-span-4 h-full min-h-0 flex flex-col">
          <TodayAndDiagnosticsPanel
            todaySession={todaySession}
            recovery={latestMetric.recovery}
            riskMetrics={latestMetric.riskMetrics}
            className="h-full"
          />
        </div>

      </div>
    </div>
  );
}