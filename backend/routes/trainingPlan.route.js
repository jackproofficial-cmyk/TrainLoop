import express from 'express'

import {createTrainingPlan, deleteTrainingPlan, updateTrainingPlan} from '../controllers/trainingPlan.controller.js'
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router()

router.use(protect);

router.post("/", createTrainingPlan)


export default router