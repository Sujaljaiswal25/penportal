import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { articleAPI } from "../api";
import toast from "react-hot-toast";
import { Upload, Bold, Italic, List, Link as LinkIcon } from "lucide-react";

const WriteArticle = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: "",
    status: "published",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.content.length < 100) {
      toast.error("Content must be at least 100 characters");
      return;
    }

    if (!formData.title || !formData.category) {
      toast.error("Title and category are required");
      return;
    }

    setLoading(true);

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("content", formData.content);
    submitData.append("excerpt", formData.excerpt);
    submitData.append("category", formData.category);
    submitData.append("tags", formData.tags);
    submitData.append("status", formData.status);

    if (coverImage) {
      submitData.append("coverImage", coverImage);
    }

    try {
      console.log("Submitting article with data:", {
        title: formData.title,
        contentLength: formData.content.length,
        category: formData.category,
        tags: formData.tags,
        hasCoverImage: !!coverImage,
      });

      const response = await articleAPI.create(submitData);
      console.log("Article created successfully:", response.data);
      toast.success("Article published successfully!");
      navigate(`/article/${response.data.article.slug}`);
    } catch (error) {
      console.error("Create article error:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Failed to create article";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-purple-50 py-6 md:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-8 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-4">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-600">
              Create New Post
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-2 md:mb-3">
            Write Your Story
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Share your thoughts and ideas with the world 🌍
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 md:space-y-6 bg-white p-5 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Article Title *
            </label>
            <input
              type="text"
              name="title"
              required
              minLength={10}
              maxLength={200}
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter an engaging title..."
              className="w-full px-4 md:px-5 py-3 md:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-base md:text-lg font-medium placeholder-gray-400 shadow-sm"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center justify-between">
              <span>{formData.title.length}/200 characters</span>
              {formData.title.length >= 10 && (
                <span className="text-green-600 font-medium">
                  ✓ Good length
                </span>
              )}
            </p>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Cover Image{" "}
              <span className="text-gray-500 font-normal text-xs">
                (Optional)
              </span>
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-36 md:h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-linear-to-br hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-400 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                  <Upload className="w-8 md:w-10 h-8 md:h-10 text-gray-400 mb-2 md:mb-3 group-hover:text-indigo-600 transition-colors" />
                  <p className="text-sm text-gray-600 font-medium text-center">
                    {coverImage ? (
                      <span className="text-indigo-600 flex items-center gap-2">
                        <span className="text-xl">✓</span>
                        {coverImage.name}
                      </span>
                    ) : (
                      <>
                        <span className="text-indigo-600">Click to upload</span>{" "}
                        or drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Content *{" "}
              <span className="text-gray-500 font-normal text-xs">
                (HTML formatting supported)
              </span>
            </label>
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all shadow-sm">
              <div className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-2 md:p-3 flex items-center space-x-1 md:space-x-2 overflow-x-auto">
                <button
                  type="button"
                  className="p-2 md:p-2.5 hover:bg-white rounded-lg transition-all shadow-sm shrink-0"
                  title="Bold"
                >
                  <Bold className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  className="p-2 md:p-2.5 hover:bg-white rounded-lg transition-all shadow-sm shrink-0"
                  title="Italic"
                >
                  <Italic className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  className="p-2 md:p-2.5 hover:bg-white rounded-lg transition-all shadow-sm shrink-0"
                  title="List"
                >
                  <List className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  type="button"
                  className="p-2 md:p-2.5 hover:bg-white rounded-lg transition-all shadow-sm shrink-0"
                  title="Link"
                >
                  <LinkIcon className="w-4 h-4 text-gray-700" />
                </button>
              </div>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={15}
                placeholder="Write your article content here...\n\nYou can use HTML tags for formatting:\n<h2>Heading</h2>\n<p>Paragraph</p>\n<strong>Bold</strong>\n<em>Italic</em>\n<ul><li>List item</li></ul>"
                className="w-full px-4 md:px-5 py-3 md:py-4 focus:outline-none resize-y text-sm md:text-base"
              />
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-2 flex items-center justify-between">
              <span>{formData.content.length} characters</span>
              {formData.content.length >= 100 ? (
                <span className="text-green-600 font-medium">
                  ✓ Minimum reached
                </span>
              ) : (
                <span className="text-orange-600 font-medium">
                  {100 - formData.content.length} more needed
                </span>
              )}
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Excerpt{" "}
              <span className="text-gray-500 font-normal text-xs">
                (Optional)
              </span>
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              maxLength={300}
              rows={3}
              placeholder="Brief description of your article..."
              className="w-full px-4 md:px-5 py-3 md:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none shadow-sm text-sm md:text-base"
            />
            <p className="text-xs text-gray-500 mt-2">
              {formData.excerpt.length}/300 characters
            </p>
          </div>

          {/* Category & Tags - Side by side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Category *
              </label>
              <input
                type="text"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Technology"
                className="w-full px-4 md:px-5 py-3 md:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm text-sm md:text-base"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Tags{" "}
                <span className="text-gray-500 font-normal text-xs">
                  (comma-separated)
                </span>
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="javascript, react"
                className="w-full px-4 md:px-5 py-3 md:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm text-sm md:text-base"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Publication Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 md:px-5 py-3 md:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white font-medium shadow-sm text-sm md:text-base"
            >
              <option value="published">📢 Publish Now</option>
              <option value="draft">📝 Save as Draft</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 md:py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Publish Article</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="sm:w-auto px-6 md:px-8 py-3.5 md:py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteArticle;
