// src/api/dashboardApi.js
import api from './axios';

export const fetchDailyMetrics = (startDate, endDate) => {
  const end = endDate || new Date().toISOString();
  const start = startDate || new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString();

  return api.get('/users/daily-metrics', { 
    params: { startDate: start, endDate: end } 
  }).then(res => res.data);
};

export const fetchUserProfile = () =>
  api.get('/users/profile', {
    validateStatus: (status) => (status >= 200 && status < 300) || status === 404
  }).then(res => (res.status === 404 ? null : res.data));

export const fetchTrainingSessions = (startDate, endDate) => {
  const end = endDate || new Date().toISOString();
  const start = startDate || new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString();

  return api.get('/users/training-sessions', { 
    params: { startDate: start, endDate: end } 
  }).then(res => res.data.trainingSessions);
};

export const fetchTrainingPlan = () =>
  api.get('/users/training-plan').then(res => res.data); // Returns null clean with no console errors

export const syncSessionExecution = (sessionId, payload) =>
  api.post(`/training-sessions/sync/${sessionId}`, payload).then(res => res.data);