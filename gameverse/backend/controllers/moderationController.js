const Report = require('../models/Report');
const User = require('../models/User');
const Review = require('../models/Review');
// Import other models as needed (ForumPost, etc.)

// @desc    Create a new report
// @route   POST /api/moderation/report
exports.createReport = async (req, res) => {
  try {
    const { targetId, targetType, reason, description } = req.body;

    const report = await Report.create({
      reporter: req.user.id,
      targetId,
      targetType,
      reason,
      description
    });

    res.status(201).json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all pending reports (Admin only)
// @route   GET /api/moderation/queue
exports.getModerationQueue = async (req, res) => {
  try {
    const reports = await Report.find({ status: 'PENDING' })
      .populate('reporter', 'username')
      .sort({ createdAt: 1 }); // Oldest first

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve a report (Ban user, Delete content, or Dismiss)
// @route   PUT /api/moderation/resolve/:id
exports.resolveReport = async (req, res) => {
  try {
    const { action, resolutionNote } = req.body; // action: 'DELETE_CONTENT', 'BAN_USER', 'DISMISS'
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    // 1. Perform the Action
    if (action === 'DELETE_CONTENT') {
      if (report.targetType === 'REVIEW') {
        await Review.findByIdAndDelete(report.targetId);
      } 
      // Add logic for ForumPost, etc.
    } else if (action === 'BAN_USER') {
      // If the target is content, find the author first; if target is User, ban directly
      let userIdToBan = report.targetId; 
      
      if (report.targetType !== 'USER') {
        // Need logic to fetch author ID based on content type
        // For simplicity, assuming targetId is passed correctly or fetched here
      }
      
      await User.findByIdAndUpdate(userIdToBan, { role: 'banned' });
    }

    // 2. Update Report Status
    report.status = action === 'DISMISS' ? 'DISMISS' : 'RESOLVED';
    report.resolutionNote = resolutionNote || `Action taken: ${action}`;
    report.resolvedBy = req.user.id;
    await report.save();

    res.status(200).json({ success: true, message: `Report resolved: ${action}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};