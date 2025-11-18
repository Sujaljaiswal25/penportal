import { Link } from "react-router-dom";
import {
  Clock,
  Heart,
  MessageCircle,
  Eye,
  Bookmark,
  Sparkles,
} from "lucide-react";
import { format } from "../utils/dateFormat";
import { motion } from "framer-motion";

const ArticleCard = ({
  article,
  onLike,
  onSave,
  isLiked,
  isSaved,
  showUnsaveButton,
  onUnsave,
}) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 card-hover group"
    >
      <div className="md:flex">
        {article.coverImage && (
          <Link
            to={`/article/${article.slug}`}
            className="md:w-1/3 shrink-0 relative"
          >
            <div className="relative overflow-hidden h-48 md:h-full">
              <motion.img
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {article.featured && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute top-3 left-3 px-3 py-1.5 bg-linear-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg"
                >
                  <Sparkles className="w-3 h-3" />
                  Featured
                </motion.div>
              )}
            </div>
          </Link>
        )}

        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 bg-linear-to-r from-blue-100 to-blue-200 text-blue-700 text-xs font-semibold rounded-full cursor-pointer"
              >
                {article.category}
              </motion.span>
              {article.tags?.slice(0, 2).map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hover:bg-gray-200 transition cursor-pointer"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>

            <Link to={`/article/${article.slug}`}>
              <motion.h2
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
                className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors leading-tight"
              >
                {article.title}
              </motion.h2>
            </Link>

            {article.excerpt && (
              <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between mb-4">
              <Link
                to={`/profile/${article.author?.username}`}
                className="flex items-center hover:opacity-80 transition group/author"
              >
                {article.author?.avatar ? (
                  <motion.img
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    src={article.author.avatar}
                    alt={article.author.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover/author:border-blue-400 transition-colors"
                  />
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-md"
                  >
                    {article.author?.username?.[0]?.toUpperCase()}
                  </motion.div>
                )}
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900 group-hover/author:text-blue-600 transition-colors">
                    {article.author?.fullName || article.author?.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(article.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <motion.div
                whileHover={{ scale: 1.1, color: "#374151" }}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span className="font-medium">{article.views || 0}</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, color: "#ef4444" }}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Heart className="w-4 h-4" />
                <span className="font-medium">{article.likesCount || 0}</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, color: "#374151" }}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">
                  {article.commentsCount || 0}
                </span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, color: "#374151" }}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span className="font-medium">{article.readTime || 0} min</span>
              </motion.div>
            </div>

            <div className="flex items-center gap-2">
              {onLike && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onLike(article._id)}
                  className={`p-2.5 rounded-full transition-all ${
                    isLiked
                      ? "bg-red-50 text-red-600 hover:bg-red-100 shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Like"
                >
                  <Heart
                    className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                  />
                </motion.button>
              )}
              {onSave && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSave(article._id)}
                  className={`p-2.5 rounded-full transition-all ${
                    isSaved
                      ? "bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Save"
                >
                  <Bookmark
                    className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`}
                  />
                </motion.button>
              )}
              {showUnsaveButton && onUnsave && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onUnsave(article._id)}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all font-medium text-sm shadow-sm hover:shadow-md"
                >
                  Remove
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ArticleCard;
