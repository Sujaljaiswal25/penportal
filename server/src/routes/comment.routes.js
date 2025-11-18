const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const commentController = require("../controllers/comment.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

// Validation rules
const commentValidation = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be 1-1000 characters"),
  body("articleId").notEmpty().withMessage("Article ID is required"),
];

// All routes require authentication
router.post(
  "/",
  authMiddleware,
  commentValidation,
  commentController.createComment
);
router.get("/article/:articleId", commentController.getCommentsByArticle);
router.put("/:id", authMiddleware, commentController.updateComment);
router.delete("/:id", authMiddleware, commentController.deleteComment);
router.post("/:id/like", authMiddleware, commentController.toggleCommentLike);

module.exports = router;
