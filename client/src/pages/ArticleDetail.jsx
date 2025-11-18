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
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {article.category}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to={`/profile/${article.author?.username}`}
              className="flex items-center"
            >
              {article.author?.avatar ? (
                <img
                  src={article.author.avatar}
                  alt={article.author.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                  {article.author?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="ml-3">
                <p className="font-medium text-gray-900">
                  {article.author?.fullName}
                </p>
                <p className="text-sm text-gray-500">
                  @{article.author?.username}
                </p>
              </div>
            </Link>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(article.createdAt), "MMM d, yyyy")}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {article.readTime} min read
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {article.coverImage && (
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />
          )}

          {/* Actions */}
          <div className="flex items-center justify-between py-4 border-t border-b">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 ${
                  isLiked ? "text-red-500" : "text-gray-500"
                } hover:text-red-500 transition`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
                <span>{article.likesCount}</span>
              </button>
              <div className="flex items-center space-x-2 text-gray-500">
                <MessageCircle className="w-6 h-6" />
                <span>{article.commentsCount}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <Eye className="w-6 h-6" />
                <span>{article.views}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className={`p-2 rounded-full hover:bg-gray-100 ${
                  isSaved ? "text-blue-500" : "text-gray-500"
                }`}
              >
                <Bookmark
                  className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`}
                />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(article.content),
            }}
          />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/search?q=${tag}`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700 transition"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold mb-6">
            Comments ({comments.length})
          </h3>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="mt-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Post Comment
              </button>
            </form>
          ) : (
            <p className="mb-8 text-gray-500">
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>{" "}
              to comment
            </p>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="flex space-x-4">
                {comment.author?.avatar ? (
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {comment.author?.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-sm">
                      {comment.author?.fullName}
                    </p>
                    <p className="text-gray-700 mt-1">{comment.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
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
