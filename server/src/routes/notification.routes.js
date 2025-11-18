const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

// All routes require authentication
router.get("/", authMiddleware, notificationController.getNotifications);
router.get(
  "/unread-count",
  authMiddleware,
  notificationController.getUnreadCount
);
router.put("/:id/read", authMiddleware, notificationController.markAsRead);
router.put("/read-all", authMiddleware, notificationController.markAllAsRead);
router.delete(
  "/:id",
  authMiddleware,
  notificationController.deleteNotification
);

module.exports = router;
