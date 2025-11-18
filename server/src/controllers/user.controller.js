const User = require("../models/User.model");
const Article = require("../models/Article.model");
const Notification = require("../models/Notification.model");
const { uploadImage } = require("../utils/imagekit.utils");

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .populate("followers", "username fullName avatar")
      .populate("following", "username fullName avatar")
      .select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's articles
    const articles = await Article.find({
      author: user._id,
      status: "published",
    })
      .select(
        "title slug excerpt coverImage createdAt views likesCount commentsCount readTime"
      )
      .sort("-createdAt")
      .limit(10);

    res.json({
      user,
      articles,
      articlesCount: articles.length,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      email,
      bio,
      location,
      website,
      interests,
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle password change
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
      user.password = newPassword;
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (interests) {
      user.interests = interests
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i);
    }

    // Upload avatar if provided
    if (req.file) {
      try {
        user.avatar = await uploadImage(req.file, "avatars");
      } catch (error) {
        console.error("Avatar upload failed:", error.message);
      }
    }

    await user.save();

    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      message: "Profile updated successfully",
      user: userObj,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Follow/Unfollow User
exports.toggleFollow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (id === userId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(userId);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (followId) => followId.toString() !== id
      );
      userToFollow.followers = userToFollow.followers.filter(
        (followerId) => followerId.toString() !== userId.toString()
      );
    } else {
      // Follow
      currentUser.following.push(id);
      userToFollow.followers.push(userId);

      // Create notification
      const notification = new Notification({
        recipient: id,
        sender: userId,
        type: "follow",
        message: `${currentUser.username} started following you`,
        link: `/profile/${currentUser.username}`,
      });
      await notification.save();

      // Emit real-time notification
      const io = req.app.get("io");
      io.to(id).emit("notification", notification);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      message: isFollowing
        ? "Unfollowed successfully"
        : "Followed successfully",
      isFollowing: !isFollowing,
    });
  } catch (error) {
    console.error("Toggle follow error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User's Saved Articles
exports.getSavedArticles = async (req, res) => {
  try {
    console.log("=== Get Saved Articles Request ===");
    console.log("User ID:", req.user._id);
    console.log("Query params:", req.query);

    const { page = 1, limit = 10, category } = req.query;
    const skip = (page - 1) * limit;

    // Get user with saved articles
    const user = await User.findById(req.user._id).select("savedArticles");

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User saved articles count:", user.savedArticles?.length || 0);
    console.log("Saved article IDs:", user.savedArticles);

    // Build query
    const query = {
      _id: { $in: user.savedArticles },
      status: "published",
    };

    if (category) {
      query.category = category;
    }

    console.log("Query:", JSON.stringify(query));

    // Get total count
    const total = await Article.countDocuments(query);
    console.log("Total articles found:", total);

    // Get articles with pagination
    const articles = await Article.find(query)
      .populate("author", "username fullName avatar")
      .sort("-createdAt")
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    console.log("Articles returned:", articles.length);

    res.json({
      articles,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Get saved articles error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get User's Articles
exports.getUserArticles = async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const query = { author: user._id };

    // Only show published articles unless viewing own profile
    if (req.user && req.user._id.toString() === user._id.toString()) {
      if (status) query.status = status;
    } else {
      query.status = "published";
    }

    const articles = await Article.find(query)
      .populate("author", "username fullName avatar")
      .sort("-createdAt")
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
    console.error("Get user articles error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User's Followers
exports.getFollowers = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate("followers", "username fullName avatar bio")
      .select("followers");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      followers: user.followers,
      count: user.followers.length,
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User's Following
exports.getFollowing = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate("following", "username fullName avatar bio")
      .select("following");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      following: user.following,
      count: user.following.length,
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
