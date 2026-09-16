import TrainingPlan from '../models/TrainingPlan.js';
import TrainingSession from '../models/TrainingSession.js';


export const createTrainingPlan = async (req, res, next) => {
  const userId = req.body.userId && req.user.role === 'coach' ? req.body.userId : req.user.id;
  try {
    const newTrainingPlan = await TrainingPlan.create({ ...req.body, userId });
    return res.status(201).json({ message: "Training Plan created", plan: newTrainingPlan });
  } catch (error) {
    next(error);
  }
};

export const fetchTrainingPlan = async (req, res) => {
  try {
    const userId = req.user.id; // Or req.user._id depending on auth middleware
    const trainingPlan = await TrainingPlan.findOne({ user: userId, active: true });

    // Return 200 with null if no active plan exists
    if (!trainingPlan) {
      return res.status(200).json(null);
    }

    return res.status(200).json(trainingPlan);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching training plan', error: error.message });
  }
};

export const updateTrainingPlan = async (req, res, next) => {
  const { id } = req.params;
  try {
    const filter = req.user.role === 'coach' ? { _id: id } : { _id: id, userId: req.user.id };
    const updatedTrainingPlan = await TrainingPlan.findOneAndUpdate(
      filter,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedTrainingPlan) return res.status(404).json({ message: "No training plan found to update" });
    return res.status(200).json(updatedTrainingPlan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteTrainingPlan = async (req, res, next) => {
  const { id } = req.params;
  try {
    const filter = req.user.role === 'coach' ? { _id: id } : { _id: id, userId: req.user.id };
    const trainingPlan = await TrainingPlan.findOneAndDelete(filter);
    
    if (!trainingPlan) return res.status(404).json({ message: "No training plan found" });

    // Delete associated training sessions
    await TrainingSession.deleteMany({ trainingPlanId: id });
    return res.status(200).json({ message: "Training plan and associated sessions deleted", deletedData: trainingPlan });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};