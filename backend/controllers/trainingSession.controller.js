import TrainingSession from '../models/TrainingSession.js';
import UserProfile from '../models/UserProfile.js';
import { updateDailyMetricsForDate } from './dailyMetric.controller.js';
import { parseDateRange } from '../utils/dateUtils.js'


/**
 * Diagnostic Calculation Engine
 */
const computeDiagnostics = (planned, actual, userProfile, rpe) => {
  const flags = [];
  let executionScore = 100;

  const ftp = userProfile?.metrics?.FTP || userProfile?.advancedPhysiology?.criticalPowerWatts;
  let intensityFactor = actual.intensityFactor || 0;
  let tss = actual.tss || 0;

  // 1. Recalculate IF and TSS if NP and FTP are present
  if (ftp && actual.power?.normalizedPower && actual.movingTimeSeconds) {
    intensityFactor = actual.power.normalizedPower / ftp;
    tss = Math.round(((actual.movingTimeSeconds * actual.power.normalizedPower * intensityFactor) / (ftp * 3600)) * 100);
  }

  // 2. Efficiency Factor & Variability Index
  const efficiencyFactor = (actual.power?.normalizedPower && actual.avgHr)
    ? Number((actual.power.normalizedPower / actual.avgHr).toFixed(2))
    : null;

  const variabilityIndex = (actual.power?.normalizedPower && actual.power?.avgPower)
    ? Number((actual.power.normalizedPower / actual.power.avgPower).toFixed(2))
    : null;

  // 3. RPE Discrepancy Index
  const rpeDiscrepancy = (rpe && intensityFactor)
    ? Number((rpe - (intensityFactor * 10)).toFixed(1))
    : null;

  if (rpeDiscrepancy !== null && rpeDiscrepancy >= 2.5) {
    flags.push({
      type: "HIGH_RPE_GAP",
      message: `RPE (${rpe}) significantly exceeded relative workload intensity (IF ${intensityFactor.toFixed(2)}). Indicates fatigue or under-recovery.`,
      severity: "warning"
    });
  }

  // 4. Cardiac Drift / Aerobic Decoupling
  let aerobicDecouplingPercent = null;
  if (actual.laps && actual.laps.length >= 2) {
    const half = Math.floor(actual.laps.length / 2);
    const firstHalf = actual.laps.slice(0, half);
    const secondHalf = actual.laps.slice(half);

    const getEf = (laps) => {
      const avgNP = laps.reduce((a, l) => a + (l.normalizedPower || l.avgPower || 0), 0) / laps.length;
      const avgHR = laps.reduce((a, l) => a + (l.avgHr || 0), 0) / laps.length;
      return avgHR > 0 ? avgNP / avgHR : null;
    };

    const ef1 = getEf(firstHalf);
    const ef2 = getEf(secondHalf);

    if (ef1 && ef2) {
      aerobicDecouplingPercent = Number(((1 - (ef2 / ef1)) * 100).toFixed(1));
      if (aerobicDecouplingPercent > 5.0) {
        flags.push({
          type: "CARDIAC_DRIFT",
          message: `Aerobic Decoupling of ${aerobicDecouplingPercent}% detected. Signals HR drift or thermal stress.`,
          severity: aerobicDecouplingPercent > 10.0 ? "critical" : "warning"
        });
      }
    }
  }

  // 5. Execution Score Deduction Rules
  if (planned?.totDuration?.value && actual.movingTimeSeconds) {
    const plannedSec = planned.totDuration.unit === "hours" ? planned.totDuration.value * 3600 : planned.totDuration.value * 60;
    const durationVariance = Math.abs(actual.movingTimeSeconds - plannedSec) / plannedSec;
    if (durationVariance > 0.2) executionScore -= 20;
  }

  if (planned?.targetTss && tss) {
    const tssVariance = Math.abs(tss - planned.targetTss) / planned.targetTss;
    if (tssVariance > 0.25) executionScore -= 20;
  }

  if (variabilityIndex && variabilityIndex > 1.15) {
    flags.push({
      type: "PACING_ERRATIC",
      message: `Variability Index of ${variabilityIndex} indicates unsteady pacing.`,
      severity: "info"
    });
    executionScore -= 10;
  }

  return {
    computedTss: tss,
    computedIF: Number(intensityFactor.toFixed(2)),
    efficiencyFactor,
    variabilityIndex,
    rpeDiscrepancy,
    aerobicDecouplingPercent,
    executionScore: Math.max(0, executionScore),
    flags
  };
};

export const createTrainingSession = async (req, res) => {
  const { trainingPlanId, date, order, title, sport } = req.body;
  const userId = req.body.userId && req.user.role === 'coach' ? req.body.userId : req.user.id;

  try {
    if (!date || !order || !title || !sport || !trainingPlanId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const isDouble = await TrainingSession.findOne({ userId, date, order });
    if (isDouble) {
      return res.status(400).json({ message: "Training Session already created for this slot" });
    }

    const trainingSession = await TrainingSession.create({
      ...req.body,
      userId,
      trainingPlanId,
    });

    return res.status(201).json(trainingSession);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTrainingSessions = async (req, res, next) => {
  const userId = req.query.athleteId && req.user.role === 'coach' ? req.query.athleteId : req.user.id;
  const { sessionId, startDate, endDate } = req.query;

  try {
    if (sessionId) {
      const trainingSession = await TrainingSession.findOne({ _id: sessionId, userId });
      if (!trainingSession) return res.status(404).json({ message: "Session not found" });
      return res.status(200).json(trainingSession);
    }

    // Fallback to past 60 days if query params are missing
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const trainingSessions = await TrainingSession.find({
      userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1, order: 1 });

    return res.status(200).json({ trainingSessions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateTrainingSession = async (req, res, next) => {
  const { sessionId } = req.params;
  try {
    const filter = req.user.role === 'coach' ? { _id: sessionId } : { _id: sessionId, userId: req.user.id };
    const updatedTrainingSession = await TrainingSession.findOneAndUpdate(
      filter,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedTrainingSession) return res.status(404).json({ message: "No session found" });
    return res.status(200).json(updatedTrainingSession);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteTrainingSessions = async (req, res, next) => {
  const userId = req.query.athleteId && req.user.role === 'coach' ? req.query.athleteId : req.user.id;
  const { sessionId, before, startDate, endDate, completed, all } = req.query;

  try {
    if (sessionId) {
      const deletedSession = await TrainingSession.findOneAndDelete({ _id: sessionId, userId });
      if (!deletedSession) return res.status(404).json({ message: "No session found" });
      return res.status(200).json({ message: "Session deleted", deletedId: sessionId });
    }

    if (before) {
      const result = await TrainingSession.deleteMany({ userId, date: { $lt: new Date(before) } });
      return res.status(200).json({ message: `Sessions prior to ${before} deleted`, deletedCount: result.deletedCount });
    }

    if (startDate && endDate) {
      const result = await TrainingSession.deleteMany({
        userId,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      });
      return res.status(200).json({ message: "Sessions in date range deleted", deletedCount: result.deletedCount });
    }

    if (completed === 'true') {
      const result = await TrainingSession.deleteMany({ userId, completed: true });
      return res.status(200).json({ message: "Completed sessions deleted", deletedCount: result.deletedCount });
    }

    if (all === 'true') {
      const result = await TrainingSession.deleteMany({ userId });
      return res.status(200).json({ message: "All sessions deleted", deletedCount: result.deletedCount });
    }

    return res.status(400).json({ message: "Target query required." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Strava/Garmin Ingestion Engine
export const syncActualExecution = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { actualData, rpe, athleteNotes } = req.body;

    const session = await TrainingSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Training session not found" });

    const profile = await UserProfile.findOne({ userId: session.userId });

    const diag = computeDiagnostics(session.planned, actualData, profile, rpe);

    session.actual = {
      ...actualData,
      tss: diag.computedTss,
      intensityFactor: diag.computedIF,
      efficiencyFactor: diag.efficiencyFactor,
      power: {
        ...actualData.power,
        variabilityIndex: diag.variabilityIndex
      }
    };

    session.diagnostics = {
      executionScore: diag.executionScore,
      aerobicDecouplingPercent: diag.aerobicDecouplingPercent,
      rpeDiscrepancy: diag.rpeDiscrepancy,
      automatedFlags: diag.flags
    };

    if (rpe) session.feedback.rpe = rpe;
    if (athleteNotes) session.feedback.athleteNotes = athleteNotes;

    session.completed = true;
    await session.save();

    // Trigger daily rolling PMC update
    await updateDailyMetricsForDate(session.userId, session.date);

    return res.status(200).json({ message: "Execution synced & diagnostics calculated", session });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Coach Review Endpoint
export const reviewSessionByCoach = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { coachNotes, coachRating } = req.body;

    const session = await TrainingSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Training session not found" });

    session.feedback.coachNotes = coachNotes;
    session.feedback.coachRating = coachRating;
    session.feedback.isReviewedByCoach = true;
    session.feedback.reviewedAt = new Date();

    await session.save();
    return res.status(200).json({ message: "Coach review submitted successfully", session });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};