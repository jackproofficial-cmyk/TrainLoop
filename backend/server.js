import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import { json } from 'express'
import cookieParser from 'cookie-parser'
import connectDb from './config/db.js'
import 'dotenv/config'

import userRoute from './routes/user.route.js'
import trainingSessionsRoute from './routes/trainingSession.route.js'
import trainingPlanRoute from './routes/trainingPlan.route.js'
import { coachGetAthletes } from './controllers/user.controller.js'

const app = express()

app.use(helmet())
app.use(cors({origin: "http://localhost:5173", credentials: true}))
app.use(express.json())
app.use(cookieParser());

connectDb()

app.use("/api/users/", userRoute)
app.use("/api/training-sessions/", trainingSessionsRoute)
app.use("/api/training-plans/", trainingPlanRoute)
app.get("/api/coach/getAthletes/:id", coachGetAthletes)

app.listen(5000, ()=>{console.log("Server Deployed 5000")})