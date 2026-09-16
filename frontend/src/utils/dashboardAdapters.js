export const formatPmcData = (dailyMetrics = []) => {
  return dailyMetrics.map(m => ({
    date: m.date,
    ctl: m.ctl || 0,
    atl: m.atl || 0,
    tsb: m.tsb || 0,
    dayTss: m.dayTss || 0,
    recovery: {
      hrvRmssd: m.recovery?.hrvRmssd || 60,
      restingHr: m.recovery?.restingHr || 50,
      sleepScore: m.recovery?.sleepScore || 80
    }
  }));
};

export const getTodaySession = (sessions = []) => {
  const todayStr = new Date().toISOString().split('T')[0];
  return sessions.find(s => new Date(s.date).toISOString().split('T')[0] === todayStr) || null;
};

export const formatCompletedActivities = (sessions = []) => {
  return sessions
    .filter(s => s.completed)
    .map(s => {
      const actual = s.actual || {};
      const distanceKm = actual.distanceMeters ? (actual.distanceMeters / 1000).toFixed(2) : '0.00';
      const durationMin = actual.movingTimeSeconds ? Math.round(actual.movingTimeSeconds / 60) : 0;
      
      // Calculate pace / speed formatted strings
      let formattedPace = '--';
      if (s.sport === 'running' && actual.movingTimeSeconds && actual.distanceMeters) {
        const secPerKm = actual.movingTimeSeconds / (actual.distanceMeters / 1000);
        const mins = Math.floor(secPerKm / 60);
        const secs = Math.round(secPerKm % 60).toString().padStart(2, '0');
        formattedPace = `${mins}:${secs} /km`;
      } else if (s.sport === 'cycling' && actual.movingTimeSeconds && actual.distanceMeters) {
        const speedKmh = (actual.distanceMeters / 1000) / (actual.movingTimeSeconds / 3600);
        formattedPace = `${speedKmh.toFixed(1)} km/h`;
      } else if (s.sport === 'swimming' && actual.movingTimeSeconds && actual.distanceMeters) {
        const secPer100m = actual.movingTimeSeconds / (actual.distanceMeters / 100);
        const mins = Math.floor(secPer100m / 60);
        const secs = Math.round(secPer100m % 60).toString().padStart(2, '0');
        formattedPace = `${mins}:${secs} /100m`;
      }

      return {
        id: s._id,
        title: s.title,
        sport: s.sport,
        date: s.date,
        distanceKm,
        durationMin,
        formattedPace,
        tss: actual.tss || 0,
        intensityFactor: actual.intensityFactor || 0,
        avgHr: actual.avgHr || null,
        avgPower: actual.power?.avgPower || null,
        executionScore: s.diagnostics?.executionScore ?? null
      };
    });
};