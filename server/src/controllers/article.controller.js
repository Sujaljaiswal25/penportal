const Article = require("../models/Article.model");
const User = require("../models/User.model");
const Notification = require("../models/Notification.model");
const { uploadImage } = require("../utils/imagekit.utils");
const { validationResult } = require("express-validator");

// Create Article
exports.createArticle = async (req, res) => {
  try {
    console.log("=== Create Article Request ===");
    console.log("User:", req.user?._id);
    console.log("Body:", req.body);
    console.log("File:", req.file ? "Present" : "None");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, excerpt, tags, category, status } = req.body;

    // Generate slug from title
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now();

    console.log("Generated slug:", slug);

    // Upload cover image if provided
    let coverImage = "";
    if (req.file) {
      try {
        console.log("Uploading image to ImageKit...");
        coverImage = await uploadImage(req.file, "articles");
        console.log("Image uploaded successfully:", coverImage);
      } catch (error) {
        console.error("Image upload failed:", error.message);
        // Continue without image if upload fails
        coverImage = "";
      }
    }

    // Create article
    const article = new Article({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      author: req.user._id,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      category,
      status: status || "published",
    });

    console.log("Saving article to database...");
    await article.save();

    // Populate author
    await article.populate("author", "username fullName avatar");

    console.log("Article created successfully:", article._id);

    res.status(201).json({
      message: "Article created successfully",
      article,
    });
  } catch (error) {
    console.error("Create article error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Server error while creating article",
      error: error.message,
    });
  }
};

// Get All Articles (with pagination and filters)
exports.getAllArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tags,
      author,
      status = "published",
      sort = "-createdAt",
    } = req.query;

    const query = { status };

    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(",") };
    if (author) query.author = author;

    const articles = await Article.find(query)
      .populate("author", "username fullName avatar")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Article.countDocuments(query);

    res.json({
      articles,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Get articles error:", error);
    res.status(500).json({ message: "Server error while fetching articles" });
  }
};

// Get Trending Articles
exports.getTrendingArticles = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const articles = await Article.find({ status: "published" })
      .populate("author", "username fullName avatar")
      .sort("-trendingScore -createdAt")
      .limit(parseInt(limit))
      .lean();

    res.json({ articles });
  } catch (error) {
    console.error("Get trending articles error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Personalized Feed
exports.getPersonalizedFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    // Get user's interests and reading history
    const user = await User.findById(userId).select(
      "interests readingHistory following"
    );

    let query = { status: "published" };

    // If user has interests or follows authors, personalize feed
    if (user.interests && user.interests.length > 0) {
      query.$or = [
        { tags: { $in: user.interests } },
        { category: { $in: user.interests } },
      ];
    }

    if (user.following && user.following.length > 0) {
      if (!query.$or) query.$or = [];
      query.$or.push({ author: { $in: user.following } });
    }

    const articles = await Article.find(query)
      .populate("author", "username fullName avatar")
      .sort("-trendingScore -createdAt")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // If not enough personalized articles, fill with trending
    if (articles.length < limit) {
      const additionalArticles = await Article.find({
        status: "published",
        _id: { $nin: articles.map((a) => a._id) },
      })
        .populate("author", "username fullName avatar")
        .sort("-trendingScore -createdAt")
        .limit(limit - articles.length)
        .lean();

      articles.push(...additionalArticles);
    }

    const count = await Article.countDocuments(query);

    res.json({
      articles,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Get personalized feed error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Single Article by Slug
exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ slug })
      .populate("author", "username fullName avatar bio socialLinks")
      .populate("likes", "username fullName avatar");

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Increment views
    article.views += 1;
    await article.updateTrendingScore();

    // Add to reading history if user is authenticated
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          readingHistory: {
            $each: [{ article: article._id, readAt: new Date() }],
            $slice: -50, // Keep only last 50 articles
          },
        },
      });
    }

    res.json({ article });
  } catch (error) {
    console.error("Get article error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Article
exports.updateArticle = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, excerpt, tags, category, status } = req.body;

    const article = await Article.findOne({ slug });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check if user is the author
    if (article.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this article" });
    }

    // Update fields
    if (title) {
      article.title = title;
      article.slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now();
    }
    if (content) article.content = content;
    if (excerpt) article.excerpt = excerpt;
    if (tags) article.tags = tags.split(",").map((tag) => tag.trim());
    if (category) article.category = category;
    if (status) article.status = status;

    // Upload new cover image if provided
    if (req.file) {
      article.coverImage = await uploadImage(req.file, "articles");
    }

    await article.save();
    await article.populate("author", "username fullName avatar");

    res.json({
      message: "Article updated successfully",
      article,
    });
  } catch (error) {
    console.error("Update article error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Article
exports.deleteArticle = async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ slug });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check if user is the author or admin
    if (
      article.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this article" });
    }

    await Article.deleteOne({ _id: article._id });

    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Delete article error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Like/Unlike Article
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const isLiked = article.likes.includes(userId);

    if (isLiked) {
      // Unlike
      article.likes = article.likes.filter(
        (like) => like.toString() !== userId.toString()
      );
      article.likesCount -= 1;
    } else {
      // Like
      article.likes.push(userId);
      article.likesCount += 1;

      // Create notification
      if (article.author.toString() !== userId.toString()) {
        const notification = new Notification({
          recipient: article.author,
          sender: userId,
          type: "like",
          article: article._id,
          message: `${req.user.username} liked your article "${article.title}"`,
          link: `/article/${article.slug}`,
        });
        await notification.save();

        // Emit real-time notification
        const io = req.app.get("io");
        io.to(article.author.toString()).emit("notification", notification);
      }
    }

    await article.updateTrendingScore();

    res.json({
      message: isLiked ? "Article unliked" : "Article liked",
      likesCount: article.likesCount,
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Save/Unsave Article
exports.toggleSave = async (req, res) => {
  try {
    console.log("=== Toggle Save Request ===");
    const { id } = req.params;
    const userId = req.user._id;

    console.log("Article ID:", id);
    console.log("User ID:", userId);

    const article = await Article.findById(id);

    if (!article) {
      console.log("Article not found");
      return res.status(404).json({ message: "Article not found" });
    }

    const user = await User.findById(userId);
    const isSaved = user.savedArticles.some(
      (articleId) => articleId.toString() === id
    );

    console.log("Is currently saved:", isSaved);
    console.log("Current saved articles:", user.savedArticles.length);

    if (isSaved) {
      user.savedArticles = user.savedArticles.filter(
        (articleId) => articleId.toString() !== id
      );
      console.log("Removed from saved");
    } else {
      user.savedArticles.push(id);
      console.log("Added to saved");
    }

    await user.save();
    console.log("New saved articles count:", user.savedArticles.length);

    res.json({
      message: isSaved ? "Article removed from saved" : "Article saved",
      isSaved: !isSaved,
    });
  } catch (error) {
    console.error("Toggle save error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
