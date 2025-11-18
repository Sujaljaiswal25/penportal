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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Write Article</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 rounded-lg shadow"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              required
              minLength={10}
              maxLength={200}
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter article title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {coverImage
                      ? coverImage.name
                      : "Click to upload cover image"}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content * (Supports markdown formatting)
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center space-x-2">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-200 rounded"
                  title="List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={20}
                placeholder="Write your article content here...\n\nYou can use HTML tags for formatting:\n<h2>Heading</h2>\n<p>Paragraph</p>\n<strong>Bold</strong>\n<em>Italic</em>\n<ul><li>List item</li></ul>"
                className="w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Tip: Use HTML tags for formatting your content
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              maxLength={300}
              rows={3}
              placeholder="Brief description of your article..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <input
              type="text"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Technology, Health, Travel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., javascript, react, webdev"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="published">Publish Now</option>
              <option value="draft">Save as Draft</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Publishing..." : "Publish Article"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
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
