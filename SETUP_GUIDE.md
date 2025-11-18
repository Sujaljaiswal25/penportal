# PenPortal - Complete Setup Guide

## 🚀 Quick Start

### Step 1: Install Dependencies

**Server:**

```bash
cd server
npm install express-validator
```

**Client:**

```bash
cd client
npm install react-router-dom axios socket.io-client react-quill react-hot-toast lucide-react date-fns dompurify react-intersection-observer
```

### Step 2: Environment Configuration

Both `.env` files are already configured. The server is connected to your MongoDB Atlas database.

**Server .env** (already configured):

- MongoDB URI: Connected to your cluster
- JWT secrets: Set with secure keys
- Port: 5000
- Client URL: http://localhost:5173

**Client .env** (already configured):

- API URL: http://localhost:5000/api
- Socket URL: http://localhost:5000

### Step 3: Start the Application

**Terminal 1 - Start Server:**

```bash
cd server
npm run dev
```

Server will run on http://localhost:5000

**Terminal 2 - Start Client:**

```bash
cd client
npm run dev
```

Client will run on http://localhost:5173

### Step 4: Test the Application

1. Open http://localhost:5173 in your browser
2. Click "Sign Up" to create a new account
3. Fill in the registration form and submit
4. After successful registration, you'll be redirected to the home page
5. Click "Write" to create your first article
6. Explore features like commenting, liking, saving articles

## 📁 Project Structure

### Backend (Server)

```
server/
├── .env                          # Environment variables (configured)
├── .env.example                  # Example env file
├── server.js                     # Server entry point with Socket.io
├── package.json                  # Dependencies
└── src/
    ├── app.js                    # Express app with middleware & routes
    ├── controllers/              # Business logic
    │   ├── auth.controller.js    # Authentication handlers
    │   ├── article.controller.js # Article CRUD operations
    │   ├── comment.controller.js # Comment operations
    │   ├── user.controller.js    # User profile operations
    │   ├── notification.controller.js
    │   └── search.controller.js  # Search functionality
    ├── models/                   # MongoDB models
    │   ├── User.model.js        # User schema
    │   ├── Article.model.js     # Article schema
    │   ├── Comment.model.js     # Comment schema
    │   └── Notification.model.js
    ├── routes/                   # API routes
    │   ├── auth.routes.js
    │   ├── article.routes.js
    │   ├── comment.routes.js
    │   ├── user.routes.js
    │   ├── notification.routes.js
    │   └── search.routes.js
    ├── middlewares/              # Custom middleware
    │   ├── auth.middleware.js   # JWT authentication
    │   └── upload.middleware.js # File upload (multer)
    ├── utils/                    # Utility functions
    │   ├── jwt.utils.js         # JWT token generation
    │   └── imagekit.utils.js    # ImageKit integration
    └── db/
        └── db.js                 # MongoDB connection
```

### Frontend (Client)

```
client/
├── .env                          # Environment variables (configured)
├── .env.example                  # Example env file
├── package.json                  # Dependencies
└── src/
    ├── main.jsx                  # Entry point
    ├── App.jsx                   # Main app with routing
    ├── index.css                 # Global styles
    ├── api/                      # API client
    │   ├── axios.js             # Axios instance with interceptors
    │   └── index.js             # API endpoint functions
    ├── context/                  # React Context
    │   ├── AuthContext.jsx      # Authentication state
    │   └── NotificationContext.jsx # Real-time notifications
    ├── components/               # Reusable components
    │   ├── Navbar.jsx           # Navigation bar
    │   ├── Footer.jsx           # Footer component
    │   ├── ArticleCard.jsx      # Article preview card
    │   ├── Loader.jsx           # Loading spinner
    │   └── ProtectedRoute.jsx   # Route guard
    └── pages/                    # Page components
        ├── Home.jsx             # Home page with feeds
        ├── Login.jsx            # Login page
        ├── Register.jsx         # Registration page
        ├── ArticleDetail.jsx    # Single article view
        ├── WriteArticle.jsx     # Create/edit article
        ├── Notifications.jsx    # Notifications page
        └── Search.jsx           # Search results page
```

## 🎯 Key Features Implemented

### 1. **Authentication System** ✅

- JWT-based authentication with refresh tokens
- Secure password hashing with bcrypt
- Cookie-based token storage
- Protected routes

### 2. **Article Management** ✅

- Rich text editor (React Quill)
- Cover image upload support
- Draft and publish status
- Edit and delete functionality
- View count tracking
- Reading time calculation

### 3. **Social Features** ✅

- Like/unlike articles
- Save articles for later
- Comment on articles
- Reply to comments
- Follow/unfollow users

### 4. **Real-Time Features** ✅

- Live notifications via Socket.io
- Real-time comment updates
- Instant like updates

### 5. **Personalization** ✅

- Personalized feed based on user interests
- Trending articles algorithm
- Reading history tracking
- User-specific recommendations

### 6. **Search & Discovery** ✅

- Full-text search for articles and users
- Popular tags display
- Category filtering
- Advanced search filters

### 7. **User Profiles** ✅

- Profile customization
- Avatar and cover image
- Bio and social links
- User's articles display
- Follower/following system

### 8. **Notifications** ✅

- Real-time notifications
- Like, comment, and follow notifications
- Mark as read functionality
- Notification badge in navbar

## 🔧 Technology Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Real-time:** Socket.io
- **Authentication:** JWT + bcrypt
- **Validation:** Express Validator
- **Security:** Helmet, CORS, Express Rate Limit
- **File Upload:** Multer + ImageKit

### Frontend

- **Library:** React 19
- **Build Tool:** Vite
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **Rich Text Editor:** React Quill
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **State Management:** Context API
- **Real-time:** Socket.io Client
- **Notifications:** React Hot Toast
- **Date Formatting:** date-fns
- **Security:** DOMPurify

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user

### Articles

- `GET /api/articles` - Get all articles (paginated)
- `GET /api/articles/trending` - Get trending articles
- `GET /api/articles/feed` - Get personalized feed (auth required)
- `GET /api/articles/:slug` - Get single article
- `POST /api/articles` - Create article (auth required)
- `PUT /api/articles/:slug` - Update article (auth required)
- `DELETE /api/articles/:slug` - Delete article (auth required)
- `POST /api/articles/:id/like` - Like/unlike article (auth required)
- `POST /api/articles/:id/save` - Save/unsave article (auth required)

### Comments

- `GET /api/comments/article/:articleId` - Get article comments
- `POST /api/comments` - Create comment (auth required)
- `PUT /api/comments/:id` - Update comment (auth required)
- `DELETE /api/comments/:id` - Delete comment (auth required)
- `POST /api/comments/:id/like` - Like/unlike comment (auth required)

### Users

- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile (auth required)
- `GET /api/users/:username/articles` - Get user articles
- `POST /api/users/:id/follow` - Follow/unfollow user (auth required)
- `GET /api/users/saved/articles` - Get saved articles (auth required)

### Notifications

- `GET /api/notifications` - Get all notifications (auth required)
- `GET /api/notifications/unread-count` - Get unread count (auth required)
- `PUT /api/notifications/:id/read` - Mark as read (auth required)
- `PUT /api/notifications/read-all` - Mark all as read (auth required)
- `DELETE /api/notifications/:id` - Delete notification (auth required)

### Search

- `GET /api/search?q=query&type=all` - Search articles/users
- `GET /api/search/tags` - Get popular tags
- `GET /api/search/categories` - Get categories

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running (for local) or Atlas is accessible
- Check your IP is whitelisted in MongoDB Atlas
- Verify connection string in `.env`

### Port Already in Use

- Server: Change `PORT` in `server/.env`
- Client: Vite will automatically try different ports

### Package Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

- Verify `CLIENT_URL` in server `.env` matches your client URL
- Check CORS configuration in `server/src/app.js`

## 🎨 Customization

### Change Theme Colors

Edit `client/tailwind.config.js` to customize colors

### Add More Features

- Payment integration for premium articles
- Email verification
- Social media login (OAuth)
- Article drafts auto-save
- Multi-language support

## 📝 Notes

- ImageKit configuration is optional - the app will work without it
- For production, use proper secrets in JWT configuration
- Consider adding rate limiting for production
- Set up proper error tracking (e.g., Sentry)
- Configure HTTPS for production deployment

## 🚀 Deployment

### Backend (Railway/Heroku/DigitalOcean)

1. Set environment variables
2. Ensure MongoDB Atlas is accessible
3. Build command: `npm install`
4. Start command: `npm start`

### Frontend (Vercel/Netlify)

1. Set VITE environment variables
2. Build command: `npm run build`
3. Output directory: `dist`

## ✅ Project Status

**All features are fully implemented and ready to use!**

The project includes:

- ✅ Complete authentication system
- ✅ Full CRUD operations for articles
- ✅ Comment system with replies
- ✅ Real-time notifications
- ✅ Personalized feed algorithm
- ✅ Trending articles
- ✅ Search functionality
- ✅ User profiles
- ✅ Social features (like, save, follow)
- ✅ Responsive design
- ✅ Security best practices

**Ready for testing and further customization!**
