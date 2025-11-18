const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [100, "Content must be at least 100 characters"],
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
    },
    coverImage: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    category: {
      type: String,
      required: [true, "Category is required"],
      lowercase: true,
    },
    readTime: {
      type: Number, // in minutes
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    trendingScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
articleSchema.index({ title: "text", content: "text", excerpt: "text" });
articleSchema.index({ author: 1, createdAt: -1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ status: 1, createdAt: -1 });
articleSchema.index({ trendingScore: -1, createdAt: -1 });
articleSchema.index({ createdAt: -1 });

// Calculate reading time
articleSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);

    // Generate excerpt if not provided
    if (!this.excerpt) {
      this.excerpt =
        this.content.replace(/<[^>]*>/g, "").substring(0, 200) + "...";
    }
  }
  next();
});

// Update trending score (views + likes + comments with time decay)
articleSchema.methods.updateTrendingScore = function () {
  const hoursSincePublished = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  const gravity = 1.8;
  const score =
    (this.views + this.likesCount * 5 + this.commentsCount * 10) /
    Math.pow(hoursSincePublished + 2, gravity);
  this.trendingScore = score;
  return this.save();
};

module.exports = mongoose.model("Article", articleSchema);
