import mongoose from "mongoose";

const mainEventSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  name: { type: String, default: "" },
  description: { type: String, default: "" },
  startingTime: { type: String, default: "08:00" },
  type: { type: String, enum: ["running", "triathlon", "cycling"], default: "running" },
  distance: {
    unit: { type: String, enum: ["meters", "kilometers", "yards", "miles"], default: "kilometers" },
    value: { type: Number, default: 0 }
  },
  target: { type: String, enum: ["finish", "pace", "time"], default: "finish" },
  pace: { type: String, default: "" },
  time: { type: String, default: "" }
}, { _id: false });

const trainingPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startDate: { type: Date, default: Date.now },
  isEventBased: { type: Boolean, default: false },
  
  phase: {
    type: String,
    enum: ["General Prep", "Base 1", "Base 2", "Build 1", "Build 2", "Peak", "Taper", "Transition"],
    default: "Base 1"
  },
  targetWeeklyTss: { type: Number, default: 0 },
  rampRateLimitTssPerWeek: { type: Number, default: 10 },

  totalWeeks: { type: Number, default: 0 },
  sessionsDone: { type: Number, default: 0 },
  weeksDone: { type: Number, default: 0 },

  mainEvent: { type: mainEventSchema, default: null },

  prepRaces: [{
    name: String,
    notes: String,
    date: Date,
    type: { type: String, enum: ["running", "triathlon", "cycling", "swimming"] },
    distance: {
      unit: { type: String, enum: ["meters", "kilometers", "yards", "miles"] },
      value: Number
    },
    goal: { type: String, enum: ["PR", "Fun", "Test"] }
  }]
}, { timestamps: true });

const TrainingPlan = mongoose.model("TrainingPlan", trainingPlanSchema);
export default TrainingPlan;