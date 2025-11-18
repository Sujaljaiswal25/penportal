const express = require("express");
const router = express.Router();
const searchController = require("../controllers/search.controller");

// Public routes
router.get("/", searchController.search);
router.get("/tags", searchController.getPopularTags);
router.get("/categories", searchController.getCategories);

module.exports = router;
