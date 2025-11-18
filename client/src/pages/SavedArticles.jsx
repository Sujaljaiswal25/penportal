import { useState, useEffect } from "react";
import { userAPI } from "../api";
import ArticleCard from "../components/ArticleCard";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { Bookmark, Filter } from "lucide-react";

const SavedArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchSavedArticles();
  }, [filter, page]);

  const fetchSavedArticles = async () => {
    try {
      setLoading(true);
      console.log("Fetching saved articles with params:", {
        page,
        limit: 10,
        category: filter !== "all" ? filter : undefined,
      });

      const response = await userAPI.getSavedArticles({
        page,
        limit: 10,
        category: filter !== "all" ? filter : undefined,
      });

      console.log("Saved articles response:", response.data);

      if (page === 1) {
        setArticles(response.data.articles || []);
      } else {
        setArticles([...articles, ...(response.data.articles || [])]);
      }

      setHasMore(response.data.currentPage < response.data.totalPages);
    } catch (error) {
      console.error("Fetch saved articles error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Failed to load saved articles"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  const handleArticleUnsaved = (articleId) => {
    setArticles(articles.filter((article) => article._id !== articleId));
    toast.success("Article removed from saved");
  };

  if (loading && page === 1) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Saved Articles</h1>
          </div>
          <p className="text-gray-600">
            Read your bookmarked articles anytime, anywhere
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">
              Filter by Category
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "technology", "health", "travel", "food", "business"].map(
              (category) => (
                <button
                  key={category}
                  onClick={() => handleFilterChange(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Articles */}
        <div className="space-y-6">
          {articles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No saved articles yet
              </h2>
              <p className="text-gray-600 mb-6">
                Start bookmarking articles you want to read later
              </p>
            </div>
          ) : (
            <>
              {articles.map((article) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  onUnsave={handleArticleUnsaved}
                  showUnsaveButton
                />
              ))}

              {hasMore && (
                <div className="text-center py-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedArticles;
