const Comment = require("../models/Comment.model");
const Article = require("../models/Article.model");
const Notification = require("../models/Notification.model");
const { validationResult } = require("express-validator");

// Create Comment
exports.createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, articleId, parentCommentId } = req.body;

    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Create comment
    const comment = new Comment({
      content,
      author: req.user._id,
      article: articleId,
      parentComment: parentCommentId || null,
    });

    await comment.save();
    await comment.populate("author", "username fullName avatar");

    // Update article comment count
    article.commentsCount += 1;
    await article.updateTrendingScore();

    // If it's a reply, update parent comment
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id },
      });

      // Get parent comment author
      const parentComment = await Comment.findById(parentCommentId);

      // Create notification for parent comment author
      if (parentComment.author.toString() !== req.user._id.toString()) {
        const notification = new Notification({
          recipient: parentComment.author,
          sender: req.user._id,
          type: "reply",
          article: articleId,
          comment: comment._id,
          message: `${req.user.username} replied to your comment`,
          link: `/article/${article.slug}#comment-${comment._id}`,
        });
        await notification.save();

        // Emit real-time notification
        const io = req.app.get("io");
        io.to(parentComment.author.toString()).emit(
          "notification",
          notification
        );
      }
    } else {
      // Create notification for article author
      if (article.author.toString() !== req.user._id.toString()) {
        const notification = new Notification({
          recipient: article.author,
          sender: req.user._id,
          type: "comment",
          article: articleId,
          comment: comment._id,
          message: `${req.user.username} commented on your article "${article.title}"`,
          link: `/article/${article.slug}#comment-${comment._id}`,
        });
        await notification.save();

        // Emit real-time notification
        const io = req.app.get("io");
        io.to(article.author.toString()).emit("notification", notification);
      }
    }

    // Emit real-time comment
    const io = req.app.get("io");
    io.to(`article-${articleId}`).emit("newComment", comment);

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Comments for Article
exports.getCommentsByArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Get top-level comments (no parent)
    const comments = await Comment.find({
      article: articleId,
      parentComment: null,
    })
      .populate("author", "username fullName avatar")
      .populate({
        path: "replies",
        populate: { path: "author", select: "username fullName avatar" },
      })
      .sort("-createdAt")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Comment.countDocuments({
      article: articleId,
      parentComment: null,
    });

    res.json({
      comments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Comment
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this comment" });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate("author", "username fullName avatar");

    res.json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author or admin
    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    // Delete all replies
    if (comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }

    // Update article comment count
    const article = await Article.findById(comment.article);
    if (article) {
      article.commentsCount = Math.max(
        0,
        article.commentsCount - (1 + comment.replies.length)
      );
      await article.updateTrendingScore();
    }

    // Remove from parent's replies if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id },
      });
    }

    await Comment.deleteOne({ _id: comment._id });

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Like/Unlike Comment
exports.toggleCommentLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes = comment.likes.filter(
        (like) => like.toString() !== userId.toString()
      );
      comment.likesCount -= 1;
    } else {
      comment.likes.push(userId);
      comment.likesCount += 1;
    }

    await comment.save();

    res.json({
      message: isLiked ? "Comment unliked" : "Comment liked",
      likesCount: comment.likesCount,
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error("Toggle comment like error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
