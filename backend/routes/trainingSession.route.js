import express from 'express'
import {createTrainingSession, syncActualExecution} from '../controllers/trainingSession.controller.js'
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router()

router.use(protect);

router.post("/", createTrainingSession)
router.post("/sync/:sessionId", syncActualExecution);
// router.get("/:id", getTrainingSession)

// THE getTrainingSessions is in the user route


export default router