import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchAPI } from "../api";
import ArticleCard from "../components/ArticleCard";
import Loader from "../components/Loader";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState({ articles: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, activeTab]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await searchAPI.search({ q: query, type: activeTab });
      setResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-gray-600">
            Results for: <span className="font-medium">{query}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === "all"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("articles")}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === "articles"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Articles
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === "users"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Users
          </button>
        </div>

        {loading ? (
          <div className="py-20">
            <Loader size="large" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Articles */}
            {(activeTab === "all" || activeTab === "articles") &&
              results.articles?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Articles</h2>
                  <div className="grid gap-6">
                    {results.articles.map((article) => (
                      <ArticleCard key={article._id} article={article} />
                    ))}
                  </div>
                </div>
              )}

            {/* Users */}
            {(activeTab === "all" || activeTab === "users") &&
              results.users?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Users</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.users.map((user) => (
                      <Link
                        key={user._id}
                        to={`/profile/${user.username}`}
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
                      >
                        <div className="flex items-center space-x-4">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.username}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                              {user.username[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.fullName}
                            </p>
                            <p className="text-sm text-gray-500">
                              @{user.username}
                            </p>
                            {user.bio && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {user.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            {/* No Results */}
            {results.articles?.length === 0 && results.users?.length === 0 && (
              <div className="text-center py-20">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No results found for "{query}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
