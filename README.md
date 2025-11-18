# PenPortal

A modern blogging platform built with React.js, Express.js, and MongoDB.

## Features

- User authentication with JWT
- Create, edit, and delete articles
- Rich text editor for writing
- Comment system with real-time updates
- Like and save articles
- Personalized feed based on user interests
- Trending articles algorithm
- Search functionality
- Real-time notifications
- User profiles and social features

## Tech Stack

### Backend

- Node.js & Express.js
- MongoDB with Mongoose
- Socket.io for real-time features
- JWT for authentication
- ImageKit for image storage
- Express Validator for input validation

### Frontend

- React.js with Vite
- React Router for navigation
- Context API for state management
- Axios for API calls
- React Quill for rich text editing
- Tailwind CSS for styling
- Socket.io-client for real-time features

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- ImageKit account (optional for image uploads)

### Backend Setup

1. Navigate to server directory:
   \`\`\`bash
   cd server
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create \`.env\` file from \`.env.example\`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Update the \`.env\` file with your configuration:

- Set \`MONGODB_URI\` to your MongoDB connection string
- Set \`JWT_SECRET\` and \`JWT_REFRESH_SECRET\` to secure random strings
- Configure ImageKit credentials (optional)

5. Start the server:
   \`\`\`bash
   npm run dev
   \`\`\`

Server will run on http://localhost:5000

### Frontend Setup

1. Navigate to client directory:
   \`\`\`bash
   cd client
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create \`.env\` file from \`.env.example\`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Update the \`.env\` file if your backend runs on a different port

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

Client will run on http://localhost:5173

## Project Structure

### Backend

\`\`\`
server/
├── src/
│ ├── controllers/ # Request handlers
│ ├── models/ # Database models
│ ├── routes/ # API routes
│ ├── middlewares/ # Custom middleware
│ ├── utils/ # Utility functions
│ ├── db/ # Database connection
│ └── app.js # Express app setup
└── server.js # Server entry point
\`\`\`

### Frontend

\`\`\`
client/
├── src/
│ ├── api/ # API client and endpoints
│ ├── components/ # Reusable components
│ ├── context/ # React Context providers
│ ├── pages/ # Page components
│ ├── App.jsx # Main app component
│ └── main.jsx # Entry point
\`\`\`

## API Endpoints

### Authentication

- POST \`/api/auth/register\` - Register new user
- POST \`/api/auth/login\` - Login user
- POST \`/api/auth/logout\` - Logout user
- GET \`/api/auth/me\` - Get current user

### Articles

- GET \`/api/articles\` - Get all articles
- GET \`/api/articles/trending\` - Get trending articles
- GET \`/api/articles/feed\` - Get personalized feed
- GET \`/api/articles/:slug\` - Get single article
- POST \`/api/articles\` - Create article
- PUT \`/api/articles/:slug\` - Update article
- DELETE \`/api/articles/:slug\` - Delete article
- POST \`/api/articles/:id/like\` - Like/unlike article
- POST \`/api/articles/:id/save\` - Save/unsave article

### Comments

- GET \`/api/comments/article/:articleId\` - Get article comments
- POST \`/api/comments\` - Create comment
- PUT \`/api/comments/:id\` - Update comment
- DELETE \`/api/comments/:id\` - Delete comment
- POST \`/api/comments/:id/like\` - Like/unlike comment

### Users

- GET \`/api/users/:username\` - Get user profile
- PUT \`/api/users/profile\` - Update profile
- POST \`/api/users/:id/follow\` - Follow/unfollow user
- GET \`/api/users/:username/articles\` - Get user articles

### Notifications

- GET \`/api/notifications\` - Get all notifications
- GET \`/api/notifications/unread-count\` - Get unread count
- PUT \`/api/notifications/:id/read\` - Mark as read
- PUT \`/api/notifications/read-all\` - Mark all as read

### Search

- GET \`/api/search?q=query\` - Search articles and users
- GET \`/api/search/tags\` - Get popular tags
- GET \`/api/search/categories\` - Get categories

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
