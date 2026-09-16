import { useState, useEffect, useCallback } from 'react';
import { fetchDailyMetrics, fetchUserProfile, fetchTrainingSessions, fetchTrainingPlan } from '../api/dashboardApi';
import { formatPmcData, getTodaySession, formatCompletedActivities } from '../utils/dashboardAdapters';

export const useDashboardData = (daysRange = 60) => {
  const [data, setData] = useState({
    pmcMetrics: [],
    todaySession: null,
    recentActivities: [],
    trainingPlan: null,
    userProfile: null,
    latestMetric: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - daysRange * 24 * 60 * 60 * 1000).toISOString();

      const [metricsRes, profileRes, sessionsRes, planRes] = await Promise.all([
        fetchDailyMetrics(startDate, endDate),
        fetchUserProfile().catch(() => null),
        fetchTrainingSessions(startDate, endDate),
        fetchTrainingPlan().catch(() => null)
      ]);

      const formattedPmc = formatPmcData(metricsRes);
      const todaySession = getTodaySession(sessionsRes);
      const recentActivities = formatCompletedActivities(sessionsRes);
      const latestMetric = metricsRes.length > 0 ? metricsRes[metricsRes.length - 1] : null;

      setData({
        pmcMetrics: formattedPmc,
        todaySession,
        recentActivities,
        trainingPlan: planRes,
        userProfile: profileRes?.profile || null,
        latestMetric
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error connecting to backend API');
    } finally {
      setLoading(false);
    }
  }, [daysRange]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return { ...data, loading, error, refetch: loadDashboard };
};