import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import {
  Search,
  Bell,
  PenSquare,
  User,
  LogOut,
  Settings,
  BookMarked,
  Menu,
  X,
  ChevronDown,
  Home,
} from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200/50 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity group"
          >
            <div className="p-2 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
              <PenSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">
              PenPortal
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg mx-8"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full px-4 py-2.5 pl-11 pr-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white/80 backdrop-blur-sm transition-all shadow-sm hover:shadow-md"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/write"
                  className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <PenSquare className="w-4 h-4" />
                  Write
                </Link>

                <Link
                  to="/"
                  className="p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="Home"
                >
                  <Home className="w-5 h-5" />
                </Link>

                <Link
                  to="/saved"
                  className="p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="Saved Articles"
                >
                  <BookMarked className="w-5 h-5" />
                </Link>

                <Link
                  to="/notifications"
                  className="relative p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-linear-to-r from-red-500 to-pink-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold shadow-md">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative ml-2">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 hover:border-indigo-400 transition-all shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-md">
                        {user?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 transition-transform ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 py-2 animate-scale-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-bold text-gray-900 text-sm">
                          {user?.fullName}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{user?.username}
                        </p>
                      </div>
                      <Link
                        to={`/profile/${user?.username}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-all text-sm text-gray-700 font-medium"
                      >
                        <User className="w-4 h-4 text-indigo-600" />
                        Profile
                      </Link>
                      <Link
                        to="/saved"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-all text-sm text-gray-700 font-medium"
                      >
                        <BookMarked className="w-4 h-4 text-indigo-600" />
                        Saved Articles
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-all text-sm text-gray-700 font-medium"
                      >
                        <Settings className="w-4 h-4 text-indigo-600" />
                        Settings
                      </Link>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 w-full text-left text-red-600 transition-all text-sm font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-gray-700 hover:text-indigo-600 font-semibold transition-all text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-fade-in">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white shadow-sm"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </form>

            {isAuthenticated ? (
              <div className="space-y-1">
                <Link
                  to="/write"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 rounded-xl transition-all text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="p-2 bg-linear-to-br from-indigo-600 to-purple-600 rounded-lg">
                    <PenSquare className="w-4 h-4 text-white" />
                  </div>
                  Write Article
                </Link>
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 rounded-xl transition-all text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Home className="w-4 h-4 text-indigo-600" />
                  </div>
                  Home
                </Link>
                <Link
                  to={`/profile/${user?.username}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 rounded-xl transition-all text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  Profile
                </Link>
                <Link
                  to="/saved"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 rounded-xl transition-all text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <BookMarked className="w-4 h-4 text-indigo-600" />
                  </div>
                  Saved Articles
                </Link>
                <Link
                  to="/notifications"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 rounded-xl transition-all text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="p-2 bg-indigo-50 rounded-lg relative">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-2">Notifications</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 rounded-xl transition-all text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Settings className="w-4 h-4 text-indigo-600" />
                  </div>
                  Settings
                </Link>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-all w-full text-left text-red-600 font-medium"
                >
                  <div className="p-2 bg-red-50 rounded-lg">
                    <LogOut className="w-4 h-4" />
                  </div>
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block px-4 py-3 text-center bg-white hover:bg-gray-50 rounded-xl font-semibold text-gray-700 transition-all border-2 border-gray-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-center font-semibold transition-all shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
