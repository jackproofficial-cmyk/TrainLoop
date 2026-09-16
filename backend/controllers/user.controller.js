import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import TrainingPlan from '../models/TrainingPlan.js';
import TrainingSession from '../models/TrainingSession.js';
import DailyMetric from '../models/DailyMetric.js';
import jwt from "jsonwebtoken";

// PUBLIC: Signup
export const createUser = async (req, res, next) => {
  const { name, birthdate, email, phone, password } = req.body;
  try {
    if (!name?.firstName || !name?.lastName || !birthdate || !password || !email) {
      return res.status(400).json({ message: "Missing required information" });
    }

    const existingUser = await User.findOne({
      $or: [
        email ? { email } : null,
        phone?.number ? { "phone.number": phone.number } : null
      ].filter(Boolean)
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await User.create(req.body);
    await UserProfile.create({ userId: user._id });

    // Generate token directly on registration
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      message: "User created successfully",
      user: { id: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (error) {
    console.error("❌ Error in createUser:", error);
    next(error);
  }
};

// PUBLIC: Login
export const authUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Fields missing" });
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      message: "Logged in successfully",
      user: { id: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PROTECTED: Logout
export const logoutUser = async (req, res, next) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  return res.status(200).json({ message: 'Logged out successfully' });
};

// PROTECTED: Get current logged-in user
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PROTECTED: Update logged-in user
export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, { returnDocument: 'after' });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PROTECTED: Delete self and clean up associated records
export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Cascade deletion across models
    await UserProfile.findOneAndDelete({ userId });
    await TrainingPlan.deleteMany({ userId });
    await TrainingSession.deleteMany({ userId });
    await DailyMetric.deleteMany({ userId });

    return res.status(200).json({ message: `User and all associated data successfully deleted: ${userId}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PROTECTED: Coach fetching their athletes
export const coachGetAthletes = async (req, res, next) => {
  try {
    const athletes = await User.find({ coachId: req.user.id });
    if (!athletes || athletes.length === 0) {
      return res.status(404).json({ message: "No athletes found for this coach" });
    }
    return res.status(200).json(athletes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};