const Article = require("../models/Article.model");
const User = require("../models/User.model");

// Search Articles and Users
exports.search = async (req, res) => {
  try {
    const { q, type = "all", page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    let articles = [];
    let users = [];

    if (type === "articles" || type === "all") {
      articles = await Article.find({
        status: "published",
        $or: [
          { title: { $regex: q, $options: "i" } },
          { content: { $regex: q, $options: "i" } },
          { excerpt: { $regex: q, $options: "i" } },
          { tags: { $regex: q, $options: "i" } },
          { category: { $regex: q, $options: "i" } },
        ],
      })
        .populate("author", "username fullName avatar")
        .select(
          "title slug excerpt coverImage author createdAt views likesCount commentsCount readTime tags category"
        )
        .sort("-trendingScore -createdAt")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();
    }

    if (type === "users" || type === "all") {
      users = await User.find({
        $or: [
          { username: { $regex: q, $options: "i" } },
          { fullName: { $regex: q, $options: "i" } },
          { bio: { $regex: q, $options: "i" } },
        ],
      })
        .select("username fullName avatar bio")
        .limit(type === "all" ? 5 : limit * 1)
        .skip(type === "all" ? 0 : (page - 1) * limit)
        .lean();
    }

    res.json({
      articles,
      users,
      query: q,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Popular Tags
exports.getPopularTags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const tags = await Article.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      { $project: { tag: "$_id", count: 1, _id: 0 } },
    ]);

    res.json({ tags });
  } catch (error) {
    console.error("Get popular tags error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Article.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { category: "$_id", count: 1, _id: 0 } },
    ]);

    res.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
