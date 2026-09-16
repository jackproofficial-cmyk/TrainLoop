import mongoose from "mongoose";

const distanceSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  unit: { type: String, enum: ["meters", "kilometers", "yards", "miles"], required: true }
}, { _id: false });

const durationSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  unit: { type: String, enum: ["seconds", "hours", "minutes"], required: true }
}, { _id: false });

const workoutStepSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["warmup", "active", "recovery", "cooldown", "rest"],
    required: true
  },
  duration: durationSchema,
  distance: distanceSchema,
  targetZone: { type: String, trim: true },
  notes: { type: String, trim: true }
}, { _id: false });

const workoutBlockSchema = new mongoose.Schema({
  name: { type: String },
  repeatCount: { type: Number, default: 1 },
  steps: [workoutStepSchema]
}, { _id: false });

workoutBlockSchema.add({ subBlocks: [workoutBlockSchema] });

const lapSchema = new mongoose.Schema({
  lapIndex: Number,
  name: String,
  splitType: { type: String, enum: ['warmup', 'active', 'recovery', 'cooldown', 'rest', 'interval'] },
  elapsedTimeSeconds: Number,
  movingTimeSeconds: Number,
  distanceMeters: Number,
  avgSpeedMs: Number,
  avgHr: Number,
  maxHr: Number,
  avgPower: Number,
  normalizedPower: Number,
  avgCadence: Number,
  elevationGainMeters: Number,
  avgGroundContactTimeMs: Number,
  avgVerticalOscillationMm: Number,
  avgStrideLengthMeters: Number,
  pedalingSmoothness: Number
}, { _id: false });

const zoneDistributionSchema = new mongoose.Schema({
  z1Seconds: { type: Number, default: 0 },
  z2Seconds: { type: Number, default: 0 },
  z3Seconds: { type: Number, default: 0 },
  z4Seconds: { type: Number, default: 0 },
  z5Seconds: { type: Number, default: 0 },
  z6Seconds: { type: Number, default: 0 },
  z7Seconds: { type: Number, default: 0 }
}, { _id: false });

const trainingSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  trainingPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingPlan', required: true, index: true },
  date: { type: Date, required: true, index: true },
  order: { type: Number, default: 1, required: true },
  title: { type: String, required: true, trim: true },
  sport: { type: String, enum: ["running", "cycling", "swimming", "strength"], required: true },
  intensityCategory: {
    type: String,
    enum: ["recovery", "base", "active", "tempo", "threshold", "Vo2Max", "Sprints", "Technique"],
    default: "base"
  },
  completed: { type: Boolean, default: false, index: true },

  planned: {
    totDuration: durationSchema,
    totDistance: distanceSchema,
    targetTss: { type: Number, default: 0 },
    description: { type: String, trim: true },
    structure: [workoutBlockSchema]
  },

  actual: {
    provider: { type: String, enum: ['manual', 'strava', 'garmin'], default: 'manual' },
    externalActivityId: { type: String, index: true, sparse: true },
    deviceName: String,
    mapPolyline: String,

    elapsedTimeSeconds: { type: Number, default: 0 },
    movingTimeSeconds: { type: Number, default: 0 },
    distanceMeters: { type: Number, default: 0 },

    tss: { type: Number, default: 0 },
    intensityFactor: { type: Number, default: 0 },
    efficiencyFactor: Number,

    avgHr: Number,
    maxHr: Number,
    hrZones: zoneDistributionSchema,

    power: {
      avgPower: Number,
      maxPower: Number,
      normalizedPower: Number,
      variabilityIndex: Number,
      leftRightBalance: String,
      powerZones: zoneDistributionSchema
    },

    avgCadence: Number,
    maxCadence: Number,
    avgSpeedMs: Number,
    maxSpeedMs: Number,

    swimming: {
      strokeType: { type: String, enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'mixed'] },
      totalStrokes: Number,
      avgSwolf: Number,
      pacePer100mSeconds: Number
    },

    runningDynamics: {
      avgGroundContactTimeMs: Number,
      avgGroundContactBalance: String,
      avgVerticalOscillationMm: Number,
      avgStrideLengthMeters: Number
    },

    environment: {
      avgTemperatureC: Number,
      humidityPercent: Number,
      totalElevationGainMeters: Number
    },

    fueling: {
      carbsConsumedGrams: Number,
      fluidConsumedMl: Number,
      glycogenDepletionPercent: Number
    },

    advancedAnalytics: {
      maxWPrimeDepletionJoules: Number,
      pacingDecayIndex: Number
    },

    laps: [lapSchema]
  },

  diagnostics: {
    executionScore: { type: Number, min: 0, max: 100 },
    aerobicDecouplingPercent: Number,
    rpeDiscrepancy: Number,

    intervalCompliance: [{
      intervalIndex: Number,
      targetValue: String,
      actualValue: String,
      complianceScore: Number
    }],

    automatedFlags: [{
      type: {
        type: String,
        enum: ['CARDIAC_DRIFT', 'HIGH_RPE_GAP', 'PACING_ERRATIC', 'OVERTRAINING_RISK', 'TARGET_MISSED']
      },
      message: String,
      severity: { type: String, enum: ['info', 'warning', 'critical'] }
    }]
  },

  feedback: {
    rpe: { type: Number, min: 1, max: 10 },
    athleteNotes: { type: String, trim: true, default: "" },
    coachNotes: { type: String, trim: true, default: "" },
    coachRating: { type: Number, min: 1, max: 5 },
    isReviewedByCoach: { type: Boolean, default: false },
    reviewedAt: Date
  }
}, { timestamps: true });

trainingSessionSchema.index({ userId: 1, date: 1, order: 1 });
trainingSessionSchema.index({ userId: 1, completed: 1, date: 1 });
trainingSessionSchema.index({ trainingPlanId: 1, completed: 1 });

trainingSessionSchema.pre('save', function () {
  if (this.isModified('completed') && this.completed === true) {
    this._justCompleted = true;
  }
});

trainingSessionSchema.post('save', async function (doc) {
  if (this._justCompleted) {
    try {
      await mongoose.model('TrainingPlan').findByIdAndUpdate(doc.trainingPlanId, {
        $inc: { sessionsDone: 1 }
      });
    } catch (error) {
      console.error("Failed to update training plan counter:", error);
    }
  }
});

export const TrainingSession = mongoose.model('TrainingSession', trainingSessionSchema);
export default TrainingSession;