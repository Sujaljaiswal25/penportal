import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatBot from "./components/ChatBot";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WriteArticle from "./pages/WriteArticle";
import ArticleDetail from "./pages/ArticleDetail";
import Notifications from "./pages/Notifications";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SavedArticles from "./pages/SavedArticles";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/article/:slug" element={<ArticleDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route
                  path="/write"
                  element={
                    <ProtectedRoute>
                      <WriteArticle />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/saved"
                  element={
                    <ProtectedRoute>
                      <SavedArticles />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
            <ChatBot />
          </div>
          <Toaster position="top-right" />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
