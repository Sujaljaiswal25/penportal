# PenPortal - Setup Guide

## 🚀 Quick Setup (3 Steps)

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Start the Application

**Open Terminal 1 - Start Server:**

```bash
cd server
npm run dev
```

✅ Server runs on http://localhost:5000

**Open Terminal 2 - Start Client:**

```bash
cd client
npm run dev
```

✅ Client runs on http://localhost:5173

### 3. Use the App

1. Open http://localhost:5173 in your browser
2. Sign up or login
3. Start writing and reading articles!

---

## 📝 Environment Setup (Optional)

Both `.env` files are pre-configured. Only modify if needed:

**server/.env:**

- `MONGO_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `CLIENT_URL` - Frontend URL (default: http://localhost:5173)

**client/.env:**

- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.io URL

## 🎯 Key Features

- ✅ User authentication (JWT)
- ✅ Write & edit articles (rich text editor)
- ✅ Like, comment & save articles
- ✅ Follow users
- ✅ Real-time notifications
- ✅ Search articles & users
- ✅ Trending & personalized feed
- ✅ User profiles

---

## 🔧 Tech Stack

**Backend:** Node.js, Express, MongoDB, Socket.io  
**Frontend:** React, Vite, Tailwind CSS, Framer Motion

---

## 🐛 Common Issues

**Port already in use?**

```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**MongoDB connection failed?**

- Check internet connection
- Verify MongoDB Atlas IP whitelist
- Confirm `MONGO_URI` in `server/.env`

**Dependencies not installing?**

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🚀 Deployment

**Backend:** Railway, Render, Heroku  
**Frontend:** Vercel, Netlify

Set environment variables before deploying.

---

**That's it! Happy coding! 🎉**
