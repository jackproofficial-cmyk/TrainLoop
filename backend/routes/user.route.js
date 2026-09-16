import express from 'express';
import { createUser, authUser, getUser, deleteUser, updateUser, logoutUser } from '../controllers/user.controller.js';
import { deleteTrainingSessions, getTrainingSessions, updateTrainingSession } from '../controllers/trainingSession.controller.js';
import { deleteTrainingPlan, fetchTrainingPlan, updateTrainingPlan } from '../controllers/trainingPlan.controller.js';
import { fetchUserProfile, resetUserProfile, updateUserProfile } from '../controllers/userProfile.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { getDailyMetrics } from '../controllers/dailyMetric.controller.js';

const router = express.Router();

// PUBLIC ROUTES
router.post("/", createUser);
router.post("/login", authUser);

// ALL ROUTES BELOW REQUIRE JWT AUTHENTICATION
router.use(protect);

// USER ACCOUNT ROUTES
router.get("/me", getUser);
router.put("/me", updateUser);
router.delete("/me", deleteUser);
router.post("/logout", logoutUser)


//
router.get("/daily-metrics", getDailyMetrics);

// USER PROFILE ROUTES (Simplified endpoints using authenticated req.user.id)
router.get("/profile", fetchUserProfile);
router.put("/profile", updateUserProfile);
router.delete("/profile", resetUserProfile);

// TRAINING SESSIONS ROUTES
router.get("/training-sessions", getTrainingSessions);
router.delete("/training-sessions", deleteTrainingSessions);
router.put("/training-sessions/:sessionId", updateTrainingSession);

// TRAINING PLAN ROUTES
router.get("/training-plan", fetchTrainingPlan);
router.put("/training-plan/:id", updateTrainingPlan);
router.delete("/training-plan/:id", deleteTrainingPlan);

export default router;