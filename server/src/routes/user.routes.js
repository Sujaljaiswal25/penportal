const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const {
  authMiddleware,
  optionalAuth,
} = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Protected routes (must come before parameterized routes)
router.put(
  "/profile",
  authMiddleware,
  upload.single("avatar"),
  userController.updateProfile
);

router.get("/saved/articles", authMiddleware, userController.getSavedArticles);
router.post("/:id/follow", authMiddleware, userController.toggleFollow);
router.get("/:id/followers", optionalAuth, userController.getFollowers);
router.get("/:id/following", optionalAuth, userController.getFollowing);

// Public routes (parameterized routes come last)
router.get("/:username", optionalAuth, userController.getUserProfile);
router.get("/:username/articles", optionalAuth, userController.getUserArticles);

module.exports = router;
