const statsService = require('../services/statsService');

const getDashboardStats = async (req, res) => {
  try {
    const userStats = await statsService.getUserStats();
    const postStats = await statsService.getPostStats();
    
    res.json({
      users: userStats,
      posts: postStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
