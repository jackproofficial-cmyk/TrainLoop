import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    bodyMetrics: {
      weightKg: Number,
      heightCm: Number
    },
    gear: {
      hr: { type: String, enum: ["none", "chest-strap", "arm-band", "watch-sensor"], default: "none" },
      trainingWatch: { type: Boolean, default: false },
      wetsuitType: { type: String, enum: ["none", "sleeveless", "fullsleeve"] },
      poolSizePreference: { type: String, enum: ["25m", "50m"] },
      trainingAids: { type: String, enum: ["paddles", "pull-buoy", "fins", "snorkel", "none"], default: "none" },
      bikeType: { type: String, enum: ["triathlon-time-trial", "road", "gravel", "mtb"] },
      powerMeter: { type: String, enum: ["none", "left-side", "dual-sided", "hub-based"] },
      homeTrainer: { type: Boolean },
      bikeComputer: { type: String, enum: ["none", "garmin", "wahoo", "hammerhead"] },
      shoes: [{
        type: { type: String, enum: ["daily-trainer", "racing-carbon", "trail"] },
        name: { type: String },
        currentDistance: { type: Number, default: 0 },
        maxDistance: { type: Number, default: 700 }
      }]
    },
    metrics: {
      MHR: { type: Number }, // Maximum Heart Rate
      RHR: { type: Number }, // Resting Heart Rate
      FTP: { type: Number }, // Functional Threshold Power (Watts)
      PWR: { type: Number }, // Power-to-Weight Ratio (W/kg)
      AvgBikeCadence: { type: Number },
      SWOLF: { type: Number },
      CSS: { type: Number }, // Critical Swim Speed (sec/100m)
      VMA: { type: Number },
      LTHR: { type: Number }, // Lactate Threshold Heart Rate
      ThresholdPace: { type: String },
      AvgRunCadence: { type: Number }
    },
    advancedPhysiology: {
      criticalPowerWatts: Number,      // CP
      wPrimeJoules: Number,            // W' (Anaerobic Capacity)
      hrvBaselineRmssd: Number,        // 30-day baseline rMSSD (ms)
      vo2MaxMlKgMin: Number,           // VO2Max estimate
      aerobicThresholdWatts: Number,   // LT1 / AeT
      lactateThresholdWatts: Number    // LT2 / AnT
    },
    nutrition: {
      sweatRateLitersPerHour: Number,
      carbAbsorptionRateGramsPerHour: { type: Number, default: 60 }
    }
  },
  { timestamps: true }
);

userProfileSchema.methods.defaultZones = function () {
  const mhr = this.metrics?.MHR;
  const rhr = this.metrics?.RHR;
  if (!mhr) return null;

  const calculateRange = (minPct, maxPct) => {
    if (rhr) {
      const hrr = mhr - rhr;
      return {
        min: Math.round((hrr * minPct) + rhr),
        max: Math.round((hrr * maxPct) + rhr)
      };
    }
    return {
      min: Math.round(mhr * minPct),
      max: Math.round(mhr * maxPct)
    };
  };

  return {
    z1: calculateRange(0.50, 0.60),
    z2: calculateRange(0.60, 0.70),
    z3: calculateRange(0.70, 0.80),
    z4: calculateRange(0.80, 0.90),
    z5: calculateRange(0.90, 1.00)
  };
};

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
export default UserProfile;