import DailyMetric from "../models/DailyMetric.js";
import TrainingSession from "../models/TrainingSession.js";
import { parseDateRange } from '../utils/dateUtils.js'

export const updateDailyMetricsForDate = async (userId, targetDate) => {
  const startDate = new Date(targetDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setHours(23, 59, 59, 999);

  const sessions = await TrainingSession.find({
    userId,
    completed: true,
    date: { $gte: startDate, $lte: endDate }
  });

  const dayTss = sessions.reduce((sum, s) => sum + (s.actual?.tss || 0), 0);
  const swimHours = sessions.filter(s => s.sport === 'swimming').reduce((sum, s) => sum + (s.actual?.movingTimeSeconds || 0) / 3600, 0);
  const bikeHours = sessions.filter(s => s.sport === 'cycling').reduce((sum, s) => sum + (s.actual?.movingTimeSeconds || 0) / 3600, 0);
  const runHours = sessions.filter(s => s.sport === 'running').reduce((sum, s) => sum + (s.actual?.movingTimeSeconds || 0) / 3600, 0);

  const prevDate = new Date(startDate);
  prevDate.setDate(prevDate.getDate() - 1);

  const prevMetric = await DailyMetric.findOne({
    userId,
    date: { $gte: new Date(prevDate.setHours(0,0,0,0)), $lte: new Date(prevDate.setHours(23,59,59,999)) }
  });

  const prevCtl = prevMetric?.ctl || 0;
  const prevAtl = prevMetric?.atl || 0;

  const ctl = prevCtl + (dayTss - prevCtl) * (1 - Math.exp(-1 / 42));
  const atl = prevAtl + (dayTss - prevAtl) * (1 - Math.exp(-1 / 7));
  const tsb = ctl - atl;

  const acwr = ctl > 0 ? Number((atl / ctl).toFixed(2)) : 0;

  const sevenDaysAgo = new Date(startDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const last7DaysMetrics = await DailyMetric.find({
    userId,
    date: { $gte: sevenDaysAgo, $lte: endDate }
  });

  const tssValues = last7DaysMetrics.map(m => m.dayTss);
  tssValues.push(dayTss);

  const meanTss = tssValues.reduce((a, b) => a + b, 0) / tssValues.length;
  const variance = tssValues.reduce((a, b) => a + Math.pow(b - meanTss, 2), 0) / tssValues.length;
  const stdDev = Math.sqrt(variance);

  const monotony = stdDev > 0 ? Number((meanTss / stdDev).toFixed(2)) : 1.0;
  const strain = Math.round(tssValues.reduce((a, b) => a + b, 0) * monotony);

  return await DailyMetric.findOneAndUpdate(
    { userId, date: { $gte: startDate, $lte: endDate } },
    {
      userId,
      date: startDate,
      dayTss,
      ctl: Math.round(ctl),
      atl: Math.round(atl),
      tsb: Math.round(tsb),
      volumeHours: {
        swim: Number(swimHours.toFixed(1)),
        bike: Number(bikeHours.toFixed(1)),
        run: Number(runHours.toFixed(1)),
        total: Number((swimHours + bikeHours + runHours).toFixed(1))
      },
      riskMetrics: {
        acwr,
        monotony,
        strain
      }
    },
    { upsert: true, returnDocument: "after" }
  );
};

export const getDailyMetrics = async (req, res) => {
  try {
    const userId = req.query.athleteId && req.user.role === 'coach' ? req.query.athleteId : req.user.id;
    
    // Default to last 60 days
    const { start, end } = parseDateRange(req.query.startDate, req.query.endDate, 60);

    let metrics = await DailyMetric.find({
      userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    // AUTO-RECALCULATE: If DailyMetric is empty, backfill from completed sessions
    if (metrics.length === 0) {
      const completedSessions = await TrainingSession.find({ userId, completed: true });
      
      if (completedSessions.length > 0) {
        // Extract unique session dates
        const uniqueDates = [...new Set(completedSessions.map(s => new Date(s.date).toISOString().split('T')[0]))];
        
        for (const dateStr of uniqueDates) {
          await updateDailyMetricsForDate(userId, dateStr);
        }

        metrics = await DailyMetric.find({
          userId,
          date: { $gte: start, $lte: end }
        }).sort({ date: 1 });
      }
    }

    return res.status(200).json(metrics);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};