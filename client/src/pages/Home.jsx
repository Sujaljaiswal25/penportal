import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { articleAPI, searchAPI } from "../api";
import ArticleCard from "../components/ArticleCard";
import Loader from "../components/Loader";
import { TrendingUp, Tag, Sparkles, Rocket, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [articles, setArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");

  useEffect(() => {
    fetchData();
  }, [activeTab, isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch articles based on tab
      let articlesResponse;
      if (activeTab === "feed" && isAuthenticated) {
        articlesResponse = await articleAPI.getPersonalizedFeed({ limit: 10 });
      } else if (activeTab === "trending") {
        articlesResponse = await articleAPI.getTrending({ limit: 10 });
      } else {
        articlesResponse = await articleAPI.getArticles({
          limit: 10,
          sort: "-createdAt",
        });
      }
      setArticles(articlesResponse.data.articles || []);

      // Fetch trending sidebar (only on initial load)
      if (trendingArticles.length === 0) {
        const trendingResponse = await articleAPI.getTrending({ limit: 5 });
        setTrendingArticles(trendingResponse.data.articles || []);
      }

      // Fetch popular tags
      if (popularTags.length === 0) {
        const tagsResponse = await searchAPI.getPopularTags({ limit: 15 });
        setPopularTags(tagsResponse.data.tags || []);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (articleId) => {
    if (!isAuthenticated) {
      toast.error("Please login to like articles");
      return;
    }
    try {
      await articleAPI.toggleLike(articleId);
      // Update local state
      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article._id === articleId
            ? {
                ...article,
                likesCount: article.likes?.includes("currentUser")
                  ? article.likesCount - 1
                  : article.likesCount + 1,
                likes: article.likes?.includes("currentUser")
                  ? article.likes.filter((id) => id !== "currentUser")
                  : [...(article.likes || []), "currentUser"],
              }
            : article
        )
      );
    } catch (error) {
      toast.error("Failed to like article");
    }
  };

  const handleSave = async (articleId) => {
    if (!isAuthenticated) {
      toast.error("Please login to save articles");
      return;
    }
    try {
      const response = await articleAPI.toggleSave(articleId);
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Failed to save article");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative animated-gradient text-white py-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [360, 180, 0],
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-block"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-semibold">
                  Welcome to PenPortal
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Discover & Share
              <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-yellow-200 to-white">
                Amazing Stories
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl mb-8 opacity-95 leading-relaxed"
            >
              Connect with brilliant minds and explore stories, thinking, and
              expertise on any topic
            </motion.p>

            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-full hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
                >
                  <Rocket className="w-5 h-5" />
                  Start Writing
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-full hover:bg-white/20 transition-all border-2 border-white/30"
                >
                  <BookOpen className="w-5 h-5" />
                  Explore Stories
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex space-x-1 mb-8 bg-white rounded-2xl p-1 shadow-md border border-gray-100"
            >
              {isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("feed")}
                  className={`flex-1 py-3 px-4 font-semibold rounded-xl transition-all ${
                    activeTab === "feed"
                      ? "bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  For You
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("trending")}
                className={`flex-1 py-3 px-4 font-semibold rounded-xl transition-all ${
                  activeTab === "trending"
                    ? "bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                🔥 Trending
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("recent")}
                className={`flex-1 py-3 px-4 font-semibold rounded-xl transition-all ${
                  activeTab === "recent"
                    ? "bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                ⚡ Recent
              </motion.button>
            </motion.div>

            {/* Articles Grid */}
            {loading ? (
              <div className="py-20">
                <Loader />
              </div>
            ) : articles.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {articles.map((article, index) => (
                  <motion.div
                    key={article._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ArticleCard
                      article={article}
                      onLike={handleLike}
                      onSave={handleSave}
                      isLiked={article.likes?.includes("currentUser")}
                      isSaved={false}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-20 bg-white rounded-2xl shadow-md"
              >
                <div className="max-w-md mx-auto">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="text-6xl mb-4"
                  >
                    📝
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No articles yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to share your story with the community
                  </p>
                  {isAuthenticated && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/write"
                        className="inline-block px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl"
                      >
                        Write an Article
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Trending Articles */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-2 bg-linear-to-r from-orange-100 to-red-100 rounded-xl"
                >
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </motion.div>
                Trending Now
              </h2>
              <div className="space-y-5">
                {trendingArticles.slice(0, 5).map((article, index) => (
                  <motion.div
                    key={article._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link
                      to={`/article/${article.slug}`}
                      className="block group"
                    >
                      <div className="flex items-start gap-4 hover:bg-gray-50 p-2 rounded-xl transition-colors">
                        <motion.span
                          whileHover={{ scale: 1.2 }}
                          className="text-3xl font-bold text-gray-200 group-hover:text-blue-600 transition"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </motion.span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm leading-snug group-hover:text-blue-600 transition line-clamp-2 mb-1">
                            {article.title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {article.author?.fullName} · {article.views || 0}{" "}
                            views
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <div className="p-2 bg-linear-to-r from-green-100 to-emerald-100 rounded-xl">
                  <Tag className="w-5 h-5 text-green-600" />
                </div>
                Popular Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 12).map((tagData, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <Link
                      to={`/search?q=${tagData.tag || tagData}`}
                      className="inline-block px-4 py-2 bg-gray-50 text-gray-700 text-sm rounded-xl hover:bg-blue-600 hover:text-white transition-all font-medium border border-gray-200 hover:border-blue-600 hover:shadow-md"
                    >
                      #{tagData.tag || tagData}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Card */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                className="animated-gradient rounded-2xl shadow-lg p-6 text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative">
                  <h3 className="text-2xl font-bold mb-3">
                    Join PenPortal Today
                  </h3>
                  <p className="text-sm opacity-90 mb-5 leading-relaxed">
                    Start writing, reading, and connecting with writers
                    worldwide
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="block text-center px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all font-semibold shadow-lg hover:shadow-xl"
                    >
                      Sign Up Free 🚀
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
