require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");
const http = require("http");
const { Server } = require("socket.io");
const { streamMessage } = require("./src/controllers/chatbot.controller");

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user's personal room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Join article room for live comments
  socket.on("joinArticle", (articleId) => {
    socket.join(`article-${articleId}`);
    console.log(`User joined article room: ${articleId}`);
  });

  // Leave article room
  socket.on("leaveArticle", (articleId) => {
    socket.leave(`article-${articleId}`);
  });

  // Chatbot: Handle user messages with streaming response
  socket.on("user_message", async (data) => {
    try {
      const { message, conversationHistory } = data;
      console.log("Received chatbot message:", message);

      // Emit acknowledgment
      socket.emit("bot_typing", true);

      // Stream the response
      const stream = await streamMessage(message, conversationHistory);
      let fullResponse = "";

      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;

        // Send each chunk to the client
        socket.emit("bot_response_chunk", {
          chunk: chunkText,
          isComplete: false,
        });
      }

      // Send final complete message
      socket.emit("bot_response_chunk", {
        chunk: "",
        isComplete: true,
        fullMessage: fullResponse,
      });

      socket.emit("bot_typing", false);
    } catch (error) {
      console.error("Chatbot error:", error);
      socket.emit("bot_error", {
        message: "Sorry, I encountered an error. Please try again.",
      });
      socket.emit("bot_typing", false);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io accessible to routes
app.set("io", io);

// Connect to the database
connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
