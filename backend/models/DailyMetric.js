import mongoose from 'mongoose';

const dailyMetricSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },

  dayTss: { type: Number, default: 0 },
  ctl: { type: Number, default: 0 }, // Chronic Training Load (Fitness)
  atl: { type: Number, default: 0 }, // Acute Training Load (Fatigue)
  tsb: { type: Number, default: 0 }, // Training Stress Balance (Form)

  readinessScore: { type: Number, min: 0, max: 100 },

  recovery: {
    hrvRmssd: Number,
    hrvStatus: { type: String, enum: ['optimal', 'balanced', 'unbalanced', 'low'] },
    restingHr: Number,
    sleepScore: { type: Number, min: 0, max: 100 }
  },

  riskMetrics: {
    acwr: Number,     // Acute-to-Chronic Workload Ratio (ATL / CTL)
    monotony: Number, // Foster's Monotony
    strain: Number    // Foster's Strain
  },

  fueling: {
    totalCaloriesBurned: Number,
    estimatedCarbsBurnedGrams: Number
  },

  volumeHours: {
    swim: { type: Number, default: 0 },
    bike: { type: Number, default: 0 },
    run: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  }
}, { timestamps: true });

dailyMetricSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyMetric = mongoose.model('DailyMetric', dailyMetricSchema);
export default DailyMetric;