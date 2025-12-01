const User = require("../models/User");
const Post = require("../models/Post");

const getUserStats = async () => {
  // 1. Users by Country
  const usersByCountry = await User.aggregate([
    { $group: { _id: "$address.country", count: { $sum: 1 } } },
  ]);

  // 2. Users by Role
  const usersByRole = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  // 3. Activity Status (Active < 30d, Regular 30-90d, Inactive > 90d)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const activityStatus = await User.aggregate([
    {
      $project: {
        status: {
          $switch: {
            branches: [
              { case: { $gte: ["$lastLogin", thirtyDaysAgo] }, then: "Active" },
              {
                case: { $gte: ["$lastLogin", ninetyDaysAgo] },
                then: "Regular",
              },
            ],
            default: "Inactive",
          },
        },
      },
    },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // 4. Registrations by Year
  const registrationsByYear = await User.aggregate([
    {
      $group: {
        _id: { $year: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 5. Logins by Month (Current Year and Last Year mostly relevant, but let's do by Month/Year)
  // Note: lastLogin is a single date per user, so this chart in Frontend was actually "Last Login Distribution", not "Login History".
  // We'll mimic what the frontend did: aggregating lastLogin dates.
  const loginsByMonthYear = await User.aggregate([
    {
      $match: { lastLogin: { $exists: true, $ne: null } },
    },
    {
      $group: {
        _id: {
          year: { $year: "$lastLogin" },
          month: { $month: "$lastLogin" }, // 1-12
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return {
    usersByCountry,
    usersByRole,
    activityStatus,
    registrationsByYear,
    loginsByMonthYear,
  };
};

const getPostStats = async () => {
  // 1. Posts by Status
  const postsByStatus = await Post.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // 2. Posts by Category (Unwind array first)
  const postsByCategory = await Post.aggregate([
    { $unwind: "$categories" },
    { $group: { _id: "$categories", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // 3. Publishing Trend (by Month/Year)
  const publishingTrend = await Post.aggregate([
    {
      $match: { publishedAt: { $exists: true, $ne: null } },
    },
    {
      $group: {
        _id: {
          year: { $year: "$publishedAt" },
          month: { $month: "$publishedAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return {
    postsByStatus,
    postsByCategory,
    publishingTrend,
  };
};

module.exports = {
  getUserStats,
  getPostStats,
};
