import api from "./axios";

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
  refreshToken: () => api.post("/auth/refresh-token"),
};

// User APIs
export const userAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put("/users/profile", data),
  getUserArticles: (username, params) =>
    api.get(`/users/${username}/articles`, { params }),
  toggleFollow: (userId) => api.post(`/users/${userId}/follow`),
  getSavedArticles: (params) => api.get("/users/saved/articles", { params }),
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
};

// Article APIs
export const articleAPI = {
  getArticles: (params) => api.get("/articles", { params }),
  getTrending: (params) => api.get("/articles/trending", { params }),
  getPersonalizedFeed: (params) => api.get("/articles/feed", { params }),
  getBySlug: (slug) => api.get(`/articles/${slug}`),
  create: (data) =>
    api.post("/articles", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (slug, data) =>
    api.put(`/articles/${slug}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (slug) => api.delete(`/articles/${slug}`),
  toggleLike: (id) => api.post(`/articles/${id}/like`),
  toggleSave: (id) => api.post(`/articles/${id}/save`),
};

// Comment APIs
export const commentAPI = {
  getByArticle: (articleId, params) =>
    api.get(`/comments/article/${articleId}`, { params }),
  create: (data) => api.post("/comments", data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
  toggleLike: (id) => api.post(`/comments/${id}/like`),
};

// Notification APIs
export const notificationAPI = {
  getAll: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Search APIs
export const searchAPI = {
  search: (params) => api.get("/search", { params }),
  getPopularTags: (params) => api.get("/search/tags", { params }),
  getCategories: () => api.get("/search/categories"),
};
