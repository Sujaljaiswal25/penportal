const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const articleController = require("../controllers/article.controller");
const {
  authMiddleware,
  optionalAuth,
} = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Validation rules
const articleValidation = [
  body("title")
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage("Title must be 10-200 characters"),
  body("content")
    .trim()
    .isLength({ min: 100 })
    .withMessage("Content must be at least 100 characters"),
  body("category").trim().notEmpty().withMessage("Category is required"),
];

// Public routes
router.get("/", optionalAuth, articleController.getAllArticles);
router.get("/trending", articleController.getTrendingArticles);
router.get("/feed", authMiddleware, articleController.getPersonalizedFeed);
router.get("/:slug", optionalAuth, articleController.getArticleBySlug);

// Protected routes
router.post(
  "/",
  authMiddleware,
  upload.single("coverImage"),
  articleValidation,
  articleController.createArticle
);
router.put(
  "/:slug",
  authMiddleware,
  upload.single("coverImage"),
  articleController.updateArticle
);
router.delete("/:slug", authMiddleware, articleController.deleteArticle);
router.post("/:id/like", authMiddleware, articleController.toggleLike);
router.post("/:id/save", authMiddleware, articleController.toggleSave);

module.exports = router;
