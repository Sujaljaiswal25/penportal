import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { articleAPI, commentAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import Loader from "../components/Loader";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Clock,
  Eye,
  Calendar,
  Share2,
} from "lucide-react";
import { format } from "../utils/dateFormat";
import DOMPurify from "dompurify";
import toast from "react-hot-toast";

const ArticleDetail = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { socket } = useNotifications();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchArticle();
    fetchComments();
  }, [slug]);

  useEffect(() => {
    if (socket && article) {
      socket.emit("joinArticle", article._id);

      socket.on("newComment", (comment) => {
        setComments((prev) => [comment, ...prev]);
      });

      return () => {
        socket.emit("leaveArticle", article._id);
        socket.off("newComment");
      };
    }
  }, [socket, article]);

  const fetchArticle = async () => {
    try {
      const response = await articleAPI.getBySlug(slug);
      setArticle(response.data.article);
      setIsLiked(
        response.data.article.likes?.some((like) => like._id === user?.id)
      );
    } catch (error) {
      console.error("Fetch article error:", error);
      toast.error("Article not found");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getByArticle(slug);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Fetch comments error:", error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to like articles");
      return;
    }
    try {
      await articleAPI.toggleLike(article._id);
      setIsLiked(!isLiked);
      setArticle((prev) => ({
        ...prev,
        likesCount: isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
      }));
    } catch (error) {
      toast.error("Failed to like article");
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save articles");
      return;
    }
    try {
      const response = await articleAPI.toggleSave(article._id);
      setIsSaved(!isSaved);
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Failed to save article");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to comment");
      return;
    }
    if (!newComment.trim()) return;

    try {
      await commentAPI.create({
        content: newComment,
        articleId: article._id,
      });
      setNewComment("");
      toast.success("Comment posted");
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Article not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 mb-6 border border-gray-100">
          <div className="mb-5">
            <span className="px-4 py-2 bg-linear-to-r from-indigo-50 to-purple-50 text-indigo-700 text-sm font-semibold rounded-full border border-indigo-100 shadow-sm">
              {article.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <Link
              to={`/profile/${article.author?.username}`}
              className="flex items-center group"
            >
              {article.author?.avatar ? (
                <img
                  src={article.author.avatar}
                  alt={article.author.username}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 group-hover:border-indigo-400 transition-all shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {article.author?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="ml-4">
                <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {article.author?.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  @{article.author?.username}
                </p>
              </div>
            </Link>

            <div className="flex items-center space-x-5 text-sm text-gray-600">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                <Calendar className="w-4 h-4 text-indigo-600" />
                {format(new Date(article.createdAt), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                <Clock className="w-4 h-4 text-indigo-600" />
                {article.readTime} min read
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {article.coverImage && (
            <div className="relative rounded-2xl overflow-hidden mb-8 shadow-xl">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between py-5 border-t border-b border-gray-100">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl transition-all font-medium ${
                  isLiked
                    ? "text-red-600 bg-red-50 hover:bg-red-100 border border-red-100"
                    : "text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <span className="font-semibold">{article.likesCount}</span>
              </button>
              <div className="flex items-center space-x-2.5 px-4 py-2.5 text-gray-600 bg-gray-50 rounded-xl border border-gray-200">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">{article.commentsCount}</span>
              </div>
              <div className="flex items-center space-x-2.5 px-4 py-2.5 text-gray-600 bg-gray-50 rounded-xl border border-gray-200">
                <Eye className="w-5 h-5" />
                <span className="font-semibold">{article.views}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                className={`p-3 rounded-xl transition-all ${
                  isSaved
                    ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100"
                    : "text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <Bookmark
                  className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`}
                />
              </button>
              <button className="p-3 rounded-xl text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 mb-6 border border-gray-100">
          <div
            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(article.content),
            }}
          />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-gray-900">
              Related Topics
            </h3>
            <div className="flex flex-wrap gap-3">
              {article.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/search?q=${tag}`}
                  className="px-4 py-2.5 bg-linear-to-r from-gray-50 to-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 hover:text-white transition-all border border-gray-200 hover:border-transparent shadow-sm hover:shadow-md"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 border border-gray-100">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">
            Comments ({comments.length})
          </h3>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-10">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="mt-4 px-8 py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5 disabled:transform-none"
              >
                Post Comment
              </button>
            </form>
          ) : (
            <p className="mb-10 text-gray-600 text-center py-8 bg-gray-50 rounded-xl">
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
              >
                Login
              </Link>{" "}
              to join the conversation
            </p>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="flex space-x-4 p-5 hover:bg-gray-50 rounded-xl transition-colors"
              >
                {comment.author?.avatar ? (
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                    {comment.author?.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <p className="font-semibold text-sm text-gray-900 mb-2">
                      {comment.author?.fullName}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 ml-2">
                    {format(new Date(comment.createdAt), "MMM d, yyyy · HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default ArticleDetail;
