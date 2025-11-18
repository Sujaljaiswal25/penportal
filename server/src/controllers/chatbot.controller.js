const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use gemini-1.5-flash or fallback models
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Send a message to the chatbot and get a response
 * @route POST /api/chat
 */
const sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: "Gemini API key is not configured",
      });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Build conversation context
    let prompt = message;
    if (conversationHistory.length > 0) {
      const context = conversationHistory
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");
      prompt = `Previous conversation:\n${context}\n\nUser: ${message}`;
    }

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const botMessage = response.text();

    res.json({
      success: true,
      message: botMessage,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    console.error("Error details:", error.message);
    res.status(500).json({
      success: false,
      message:
        "Failed to get response from chatbot. Please check your API key.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Stream a response from the chatbot
 * This is used with Socket.io for real-time streaming
 */
const streamMessage = async (message, conversationHistory = []) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Build conversation context
    let prompt = message;
    if (conversationHistory.length > 0) {
      const context = conversationHistory
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");
      prompt = `Previous conversation:\n${context}\n\nUser: ${message}`;
    }

    // Generate streaming response
    const result = await model.generateContentStream(prompt);
    return result.stream;
  } catch (error) {
    console.error("Chatbot streaming error:", error);
    throw error;
  }
};

module.exports = {
  sendMessage,
  streamMessage,
};
