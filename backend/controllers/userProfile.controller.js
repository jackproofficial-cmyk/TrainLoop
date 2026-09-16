import UserProfile from "../models/UserProfile.js";

// GET /api/users/profile
export const fetchUserProfile = async (req, res, next) => {
  try {
    const targetUserId = req.query.athleteId && req.user.role === 'coach' ? req.query.athleteId : req.user.id;
    const userProfile = await UserProfile.findOne({ userId: targetUserId });
    
    if (!userProfile) return res.status(404).json({ message: "No user profile found" });

    const calculatedHrZones = userProfile.defaultZones();

    return res.status(200).json({
      profile: userProfile,
      calculatedHrZones
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const targetUserId = req.query.athleteId && req.user.role === 'coach' ? req.query.athleteId : req.user.id;

    let profile = await UserProfile.findOne({ userId: targetUserId });
    if (!profile) {
      profile = new UserProfile({ userId: targetUserId });
    }

    // Deep merge top-level properties
    if (req.body.bodyMetrics) profile.bodyMetrics = { ...profile.bodyMetrics, ...req.body.bodyMetrics };
    if (req.body.metrics) profile.metrics = { ...profile.metrics, ...req.body.metrics };
    if (req.body.advancedPhysiology) profile.advancedPhysiology = { ...profile.advancedPhysiology, ...req.body.advancedPhysiology };
    if (req.body.nutrition) profile.nutrition = { ...profile.nutrition, ...req.body.nutrition };
    if (req.body.gear) profile.gear = { ...profile.gear, ...req.body.gear };

    // Dynamic Power-to-Weight Ratio (W/kg) calculation
    if (profile.metrics?.FTP && profile.bodyMetrics?.weightKg) {
      profile.metrics.PWR = Number((profile.metrics.FTP / profile.bodyMetrics.weightKg).toFixed(2));
    }

    await profile.save();
    const calculatedHrZones = profile.defaultZones();

    return res.status(200).json({
      message: "User profile updated successfully",
      profile,
      calculatedHrZones
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /api/users/profile (Reset Profile)
export const resetUserProfile = async (req, res, next) => {
  try {
    await UserProfile.findOneAndDelete({ userId: req.user.id });
    const newUserProfile = await UserProfile.create({ userId: req.user.id });
    
    return res.status(200).json({
      message: "User profile reset completed",
      newProfileId: newUserProfile._id
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};