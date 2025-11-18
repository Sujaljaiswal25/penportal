import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { userAPI, articleAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import ArticleCard from "../components/ArticleCard";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  Users,
  FileText,
  Settings,
  MapPin,
  Calendar,
  Edit3,
  Link2,
  Grid3x3,
  Bookmark,
  X,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { format } from "../utils/dateFormat";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("articles");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, articlesRes] = await Promise.all([
        userAPI.getProfile(username),
        userAPI.getUserArticles(username, { page: 1, limit: 10 }),
      ]);

      setProfile(profileRes.data.user);
      setArticles(articlesRes.data.articles);
      setFollowers(profileRes.data.user.followers || []);
      setFollowing(profileRes.data.user.following || []);
      setIsFollowing(
        profileRes.data.user.followers?.some(
          (follower) =>
            follower._id === currentUser?._id || follower === currentUser?._id
        )
      );
    } catch (error) {
      console.error("Fetch profile error:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error("Please login to follow users");
      return;
    }

    try {
      setFollowLoading(true);
      await userAPI.toggleFollow(profile._id);

      const wasFollowing = isFollowing;
      setIsFollowing(!wasFollowing);

      // Update followers list and count
      if (wasFollowing) {
        // Remove current user from followers
        setFollowers((prev) =>
          prev.filter((f) => f._id !== currentUser._id && f !== currentUser._id)
        );
        setProfile((prev) => ({
          ...prev,
          followersCount: Math.max(0, (prev.followersCount || 0) - 1),
        }));
        toast.success("Unfollowed");
      } else {
        // Add current user to followers
        setFollowers((prev) => [
          ...prev,
          {
            _id: currentUser._id,
            username: currentUser.username,
            fullName: currentUser.fullName,
            avatar: currentUser.avatar,
          },
        ]);
        setProfile((prev) => ({
          ...prev,
          followersCount: (prev.followersCount || 0) + 1,
        }));
        toast.success("Following");
      }
    } catch (error) {
      console.error("Follow error:", error);
      toast.error("Failed to update follow status");
      // Revert on error
      setIsFollowing(!isFollowing);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600">
            The profile you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header - Instagram Style */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 items-center sm:items-start">
            {/* Avatar - Larger Instagram Style */}
            <div className="shrink-0">
              <div className="relative group">
                <img
                  src={
                    profile.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      profile.fullName
                    )}&size=150&background=random`
                  }
                  alt={profile.fullName}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-gray-100"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full text-center sm:text-left">
              {/* Username and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-light">
                  {profile.username}
                </h1>
                {isOwnProfile ? (
                  <Link
                    to="/settings"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </Link>
                ) : (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`inline-flex items-center justify-center gap-2 px-8 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                      isFollowing
                        ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {followLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Stats - Instagram Style */}
              <div className="flex gap-8 sm:gap-12 mb-6 justify-center sm:justify-start">
                <div className="text-center sm:text-left">
                  <div className="text-lg sm:text-xl font-semibold">
                    {articles.length}
                  </div>
                  <div className="text-sm text-gray-600">posts</div>
                </div>
                <button
                  onClick={() => setShowFollowersModal(true)}
                  className="text-center sm:text-left hover:opacity-70 transition"
                >
                  <div className="text-lg sm:text-xl font-semibold">
                    {profile.followersCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">followers</div>
                </button>
                <button
                  onClick={() => setShowFollowingModal(true)}
                  className="text-center sm:text-left hover:opacity-70 transition"
                >
                  <div className="text-lg sm:text-xl font-semibold">
                    {profile.followingCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">following</div>
                </button>
              </div>

              {/* Bio and Details */}
              <div className="space-y-2">
                <h2 className="font-semibold text-gray-900">
                  {profile.fullName}
                </h2>
                {profile.bio && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap max-w-xl">
                    {profile.bio}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 justify-center sm:justify-start">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Link2 className="w-4 h-4" />
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {format(new Date(profile.createdAt), "MMM yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="flex justify-center gap-8 sm:gap-16">
            <button
              onClick={() => setActiveTab("articles")}
              className={`py-3 px-1 border-t-2 font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "articles"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden sm:inline">POSTS</span>
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab("saved")}
                className={`py-3 px-1 border-t-2 font-medium text-sm transition flex items-center gap-2 ${
                  activeTab === "saved"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">SAVED</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab("about")}
              className={`py-3 px-1 border-t-2 font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "about"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">ABOUT</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === "articles" && (
            <div className="space-y-6">
              {articles.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 border-4 border-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-gray-900" />
                  </div>
                  <h3 className="text-2xl font-light mb-2">No Posts Yet</h3>
                  {isOwnProfile && (
                    <>
                      <p className="text-gray-500 mb-6">
                        Share your first article with the world
                      </p>
                      <Link
                        to="/write"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        <Edit3 className="w-4 h-4" />
                        Write Article
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                articles.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))
              )}
            </div>
          )}

          {activeTab === "saved" && isOwnProfile && <SavedArticlesTab />}

          {activeTab === "about" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg border p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    About
                  </h3>
                  <p className="text-gray-700">
                    {profile.bio || "No bio available yet."}
                  </p>
                </div>

                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Profile Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Member since{" "}
                        {format(new Date(profile.createdAt), "MMMM dd, yyyy")}
                      </span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Link2 className="w-4 h-4" />
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <FollowModal
          title="Followers"
          users={followers}
          onClose={() => setShowFollowersModal(false)}
          currentUser={currentUser}
        />
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <FollowModal
          title="Following"
          users={following}
          onClose={() => setShowFollowingModal(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

// Follow Modal Component
const FollowModal = ({ title, users, onClose, currentUser }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Users List */}
          <div className="max-h-96 overflow-y-auto">
            {users.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No {title.toLowerCase()} yet
              </div>
            ) : (
              users.map((user) => (
                <Link
                  key={user._id}
                  to={`/profile/${user.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition"
                >
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.fullName || user.username
                      )}&size=100&background=random`
                    }
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {user.username}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {user.fullName}
                    </div>
                  </div>
                  {currentUser?._id === user._id && (
                    <span className="text-xs text-gray-500">You</span>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Saved Articles Tab Component
const SavedArticlesTab = () => {
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedArticles();
  }, []);

  const fetchSavedArticles = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getSavedArticles({ page: 1, limit: 20 });
      setSavedArticles(response.data.articles);
    } catch (error) {
      console.error("Fetch saved articles error:", error);
      toast.error("Failed to load saved articles");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {savedArticles.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 border-4 border-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bookmark className="w-10 h-10 text-gray-900" />
          </div>
          <h3 className="text-2xl font-light mb-2">No Saved Articles</h3>
          <p className="text-gray-500">Articles you save will appear here</p>
        </div>
      ) : (
        savedArticles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))
      )}
    </div>
  );
};

export default Profile;
