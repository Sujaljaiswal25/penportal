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
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-indigo-200 card-hover group"
    >
      <div className="md:flex">
        {article.coverImage && (
          <Link
            to={`/article/${article.slug}`}
            className="md:w-2/5 shrink-0 relative block"
          >
            <div className="relative overflow-hidden h-56 md:h-full">
              <motion.img
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {article.featured && (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="absolute top-4 left-4 px-3 py-1.5 bg-linear-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xl"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Featured
                </motion.div>
              )}
            </div>
          </Link>
        )}

        <div className="p-6 md:p-7 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 bg-linear-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs font-semibold rounded-full cursor-pointer border border-indigo-100 shadow-sm"
              >
                {article.category}
              </motion.span>
              {article.tags?.slice(0, 2).map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer border border-gray-100"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>

            <Link to={`/article/${article.slug}`}>
              <motion.h2
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-indigo-600 transition-colors leading-tight"
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
                className="flex items-center hover:opacity-80 transition-all group/author"
              >
                {article.author?.avatar ? (
                  <motion.img
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    src={article.author.avatar}
                    alt={article.author.username}
                    className="w-11 h-11 rounded-full object-cover border-2 border-gray-200 group-hover/author:border-indigo-400 transition-all shadow-sm"
                  />
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: -5 }}
                    className="w-11 h-11 rounded-full bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-md"
                  >
                    {article.author?.username?.[0]?.toUpperCase()}
                  </motion.div>
                )}
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900 group-hover/author:text-indigo-600 transition-colors">
                    {article.author?.fullName || article.author?.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(article.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-gray-100">
            <div className="flex items-center gap-5 text-sm text-gray-500">
              <motion.div
                whileHover={{ scale: 1.15, color: "#4338ca" }}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span className="font-medium">{article.views || 0}</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.15, color: "#dc2626" }}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Heart className="w-4 h-4" />
                <span className="font-medium">{article.likesCount || 0}</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.15, color: "#4338ca" }}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">
                  {article.commentsCount || 0}
                </span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.15, color: "#4338ca" }}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span className="font-medium">{article.readTime || 0} min</span>
              </motion.div>
            </div>

            <div className="flex items-center gap-2.5">
              {onLike && (
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onLike(article._id)}
                  className={`p-2.5 rounded-xl transition-all shadow-sm ${
                    isLiked
                      ? "bg-red-50 text-red-600 hover:bg-red-100 shadow-md border border-red-100"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
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
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSave(article._id)}
                  className={`p-2.5 rounded-xl transition-all shadow-sm ${
                    isSaved
                      ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shadow-md border border-indigo-100"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
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
                  className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all font-medium text-sm shadow-sm hover:shadow-md border border-red-100"
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
