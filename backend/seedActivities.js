// seedDashboard.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import UserProfile from './models/UserProfile.js';
import TrainingPlan from './models/TrainingPlan.js';
import TrainingSession from './models/TrainingSession.js';
import DailyMetric from './models/DailyMetric.js';
import connectDb from './config/db.js';

dotenv.config();

const TARGET_EMAIL = 'athlete@trainloop.com';

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

async function seed() {
  try {
    connectDb()
    // 1. User Setup
    let user = await User.findOne({ email: TARGET_EMAIL });
    if (!user) {
      user = await User.create({
        name: { firstName: 'Alex', lastName: 'Vance' },
        email: TARGET_EMAIL,
        password: 'Password123!',
        birthdate: new Date('1994-06-15'),
        phone: { countryCode: '+1', number: '5550192834' },
        role: 'athlete'
      });
      console.log(`👤 Created Athlete User: ${user.email}`);
    } else {
      console.log(`👤 Found Existing User: ${user.email}`);
    }

    const userId = user._id;

    // Wipe previous test data for clean state
    await UserProfile.deleteMany({ userId });
    await TrainingPlan.deleteMany({ userId });
    await TrainingSession.deleteMany({ userId });
    await DailyMetric.deleteMany({ userId });
    console.log('🧹 Purged previous user records');

    // 2. User Profile Setup (Baseline Metrics)
    const userProfile = await UserProfile.create({
      userId,
      bodyMetrics: { weightKg: 72, heightCm: 181 },
      gear: {
        hr: 'chest-strap',
        trainingWatch: true,
        wetsuitType: 'fullsleeve',
        bikeType: 'triathlon-time-trial',
        powerMeter: 'dual-sided',
        homeTrainer: true,
        bikeComputer: 'garmin'
      },
      metrics: {
        MHR: 188,
        RHR: 48,
        FTP: 285,
        PWR: 3.96,
        LTHR: 168,
        CSS: 92, // 1:32 per 100m
        AvgBikeCadence: 88,
        AvgRunCadence: 174,
        ThresholdPace: '4:05/km'
      },
      advancedPhysiology: {
        criticalPowerWatts: 290,
        wPrimeJoules: 21000,
        hrvBaselineRmssd: 68,
        vo2MaxMlKgMin: 59.5,
        aerobicThresholdWatts: 210,
        lactateThresholdWatts: 285
      },
      nutrition: { sweatRateLitersPerHour: 1.2, carbAbsorptionRateGramsPerHour: 80 }
    });
    console.log('📊 Populated User Profile & Physiological Baselines');

    // 3. Training Plan Setup
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const planStartDate = new Date(today);
    planStartDate.setDate(today.getDate() - 90);

    const mainEventDate = new Date(today);
    mainEventDate.setDate(today.getDate() + 42); // 6 weeks out

    const trainingPlan = await TrainingPlan.create({
      userId,
      startDate: planStartDate,
      phase: 'Build 2',
      targetWeeklyTss: 550,
      rampRateLimitTssPerWeek: 8,
      totalWeeks: 18,
      weeksDone: 12,
      sessionsDone: 64,
      isEventBased: true,
      mainEvent: {
        name: 'Ironman 70.3 World Series',
        date: mainEventDate,
        type: 'triathlon',
        distance: { unit: 'kilometers', value: 113 },
        target: 'time',
        time: '04:25:00'
      }
    });
    console.log(`🎯 Created Training Plan: ${trainingPlan.mainEvent.name}`);

    // 4. Session & Rolling Daily Metrics Generation (-90 days to +7 days)
    let ctl = 35; // Initial starting fitness
    let atl = 30; // Initial starting fatigue

    console.log('⏳ Generating 90-day training history and PMC curves...');

    for (let dayOffset = -90; dayOffset <= 7; dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);
      currentDate.setHours(8, 0, 0, 0);

      const dayOfWeek = currentDate.getDay(); // 0: Sun, 1: Mon, ... 6: Sat
      const isPast = dayOffset <= 0;

      const sessionsToCreate = [];

      // Realistic Microcycle Schedule:
      // Mon: Swim + Strength / Rest
      // Tue: Threshold Bike
      // Wed: Swim + Interval Run
      // Thu: Tempo Bike
      // Fri: Easy Swim / Rest
      // Sat: Long Endurance Bike (Heavy TSS)
      // Sun: Long Endurance Run

      if (dayOfWeek === 1) { // Monday
        if (dayOffset % 2 === 0) {
          sessionsToCreate.push({
            sport: 'swimming',
            title: 'Aerobic Pace Intervals',
            category: 'base',
            durMin: 45,
            distKm: 2.2,
            targetTss: 40
          });
        }
      } else if (dayOfWeek === 2) { // Tuesday
        sessionsToCreate.push({
          sport: 'cycling',
          title: '3x12m Over-Unders @ Threshold',
          category: 'threshold',
          durMin: 75,
          distKm: 38,
          targetTss: 85
        });
      } else if (dayOfWeek === 3) { // Wednesday
        sessionsToCreate.push({
          sport: 'running',
          title: 'VO2Max Hill Repeats',
          category: 'Vo2Max',
          durMin: 55,
          distKm: 10.5,
          targetTss: 75
        });
        sessionsToCreate.push({
          sport: 'swimming',
          title: 'Technique & Threshold Sets',
          category: 'Technique',
          durMin: 50,
          distKm: 2.5,
          targetTss: 48
        });
      } else if (dayOfWeek === 4) { // Thursday
        sessionsToCreate.push({
          sport: 'cycling',
          title: 'Sweetspot Tempo Endurance',
          category: 'tempo',
          durMin: 90,
          distKm: 48,
          targetTss: 90
        });
      } else if (dayOfWeek === 5) { // Friday
        sessionsToCreate.push({
          sport: 'swimming',
          title: 'Recovery Swim & Drills',
          category: 'recovery',
          durMin: 35,
          distKm: 1.8,
          targetTss: 25
        });
      } else if (dayOfWeek === 6) { // Saturday
        sessionsToCreate.push({
          sport: 'cycling',
          title: 'Long Aerobic Zone 2 Build',
          category: 'base',
          durMin: 180,
          distKm: 92,
          targetTss: 165
        });
      } else if (dayOfWeek === 0) { // Sunday
        sessionsToCreate.push({
          sport: 'running',
          title: 'Long Progressive Endurance Run',
          category: 'base',
          durMin: 100,
          distKm: 18.5,
          targetTss: 110
        });
      }

      let dayTss = 0;
      let daySwimH = 0;
      let dayBikeH = 0;
      let dayRunH = 0;

      for (let i = 0; i < sessionsToCreate.length; i++) {
        const s = sessionsToCreate[i];
        const sessionDate = new Date(currentDate);
        sessionDate.setHours(7 + i * 4, 30, 0);

        const durSec = s.durMin * 60;
        const distM = s.distKm * 1000;

        const sessionData = {
          userId,
          trainingPlanId: trainingPlan._id,
          date: sessionDate,
          order: i + 1,
          title: s.title,
          sport: s.sport,
          intensityCategory: s.category,
          completed: isPast,
          planned: {
            totDuration: { value: s.durMin, unit: 'minutes' },
            totDistance: { value: s.distKm, unit: 'kilometers' },
            targetTss: s.targetTss,
            description: `Targeting ${s.category} intensity zones.`
          }
        };

        if (isPast) {
          const tssVariance = randFloat(0.9, 1.1);
          const actualTss = Math.round(s.targetTss * tssVariance);
          const actualDurSec = Math.round(durSec * randFloat(0.95, 1.05));
          const actualDistM = Math.round(distM * randFloat(0.96, 1.04));

          dayTss += actualTss;
          if (s.sport === 'swimming') daySwimH += actualDurSec / 3600;
          if (s.sport === 'cycling') dayBikeH += actualDurSec / 3600;
          if (s.sport === 'running') dayRunH += actualDurSec / 3600;

          const np = s.sport === 'cycling' ? randInt(220, 275) : undefined;
          const avgPower = np ? Math.round(np * randFloat(0.92, 0.97)) : undefined;
          const avgHr = randInt(138, 168);

          sessionData.actual = {
            provider: 'garmin',
            movingTimeSeconds: actualDurSec,
            elapsedTimeSeconds: actualDurSec + randInt(60, 300),
            distanceMeters: actualDistM,
            tss: actualTss,
            intensityFactor: randFloat(0.72, 0.91),
            efficiencyFactor: np ? randFloat(1.4, 1.7) : undefined,
            avgHr,
            maxHr: avgHr + randInt(15, 25),
            hrZones: {
              z1Seconds: Math.round(actualDurSec * 0.15),
              z2Seconds: Math.round(actualDurSec * 0.55),
              z3Seconds: Math.round(actualDurSec * 0.20),
              z4Seconds: Math.round(actualDurSec * 0.08),
              z5Seconds: Math.round(actualDurSec * 0.02)
            },
            ...(np && {
              power: {
                avgPower,
                maxPower: np + randInt(80, 180),
                normalizedPower: np,
                variabilityIndex: randFloat(1.02, 1.08),
                powerZones: {
                  z1Seconds: Math.round(actualDurSec * 0.10),
                  z2Seconds: Math.round(actualDurSec * 0.50),
                  z3Seconds: Math.round(actualDurSec * 0.25),
                  z4Seconds: Math.round(actualDurSec * 0.12),
                  z5Seconds: Math.round(actualDurSec * 0.03)
                }
              }
            })
          };

          sessionData.diagnostics = {
            executionScore: randInt(85, 100),
            aerobicDecouplingPercent: randFloat(1.8, 4.5),
            rpeDiscrepancy: randFloat(-0.5, 0.8),
            automatedFlags: []
          };

          sessionData.feedback = {
            rpe: randInt(5, 8),
            athleteNotes: 'Felt strong throughout the session. Hydration was on point.'
          };
        }

        await TrainingSession.create(sessionData);
      }

      // Compute Daily Rolling Metrics for past dates
      if (isPast) {
        ctl = ctl + (dayTss - ctl) * (1 - Math.exp(-1 / 42));
        atl = atl + (dayTss - atl) * (1 - Math.exp(-1 / 7));
        const tsb = ctl - atl;
        const acwr = ctl > 0 ? Number((atl / ctl).toFixed(2)) : 0;

        const readinessScore = Math.min(98, Math.max(45, Math.round(75 + tsb * 0.6 + randInt(-5, 5))));

        await DailyMetric.create({
          userId,
          date: currentDate,
          dayTss,
          ctl: Math.round(ctl),
          atl: Math.round(atl),
          tsb: Math.round(tsb),
          readinessScore,
          recovery: {
            hrvRmssd: randInt(58, 78),
            hrvStatus: readinessScore > 70 ? 'optimal' : 'balanced',
            restingHr: randInt(46, 52),
            sleepScore: randInt(72, 94)
          },
          riskMetrics: {
            acwr,
            monotony: randFloat(1.0, 1.6),
            strain: Math.round(dayTss * 1.2)
          },
          volumeHours: {
            swim: Number(daySwimH.toFixed(1)),
            bike: Number(dayBikeH.toFixed(1)),
            run: Number(dayRunH.toFixed(1)),
            total: Number((daySwimH + dayBikeH + dayRunH).toFixed(1))
          }
        });
      }
    }

    console.log('✅ Successfully seeded Dashboard data!');
    console.log(`🚀 Ready to test! Log in as: ${TARGET_EMAIL}`);

  } catch (err) {
    console.error('❌ Seeding Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

seed();