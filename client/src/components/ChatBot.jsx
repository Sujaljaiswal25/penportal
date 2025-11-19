import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, Minimize2 } from "lucide-react";
import socket from "../utils/socket";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const currentBotMessageRef = useRef("");

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket connection management
  useEffect(() => {
    // Connect socket when chatbot opens
    if (isOpen && !socket.connected) {
      socket.connect();
    }

    // Socket event listeners
    const handleConnect = () => {
      setIsConnected(true);
      console.log("Chatbot connected to server");
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("Chatbot disconnected from server");
    };

    const handleBotTyping = (isTyping) => {
      setIsTyping(isTyping);
    };

    const handleBotResponseChunk = (data) => {
      const { chunk, isComplete, fullMessage } = data;

      if (isComplete) {
        // Finalize the streaming message
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];

          if (lastMessage && lastMessage.isStreaming) {
            // Update the existing streaming message
            lastMessage.content = fullMessage || currentBotMessageRef.current;
            lastMessage.isStreaming = false;
          } else {
            // Add new message if no streaming message exists
            newMessages.push({
              role: "bot",
              content: fullMessage || currentBotMessageRef.current,
              timestamp: new Date(),
            });
          }

          return newMessages;
        });
        currentBotMessageRef.current = "";
        setIsTyping(false);
      } else {
        // Accumulate chunks
        currentBotMessageRef.current += chunk;

        // Update the last message with streaming content
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];

          if (
            lastMessage &&
            lastMessage.role === "bot" &&
            lastMessage.isStreaming
          ) {
            lastMessage.content = currentBotMessageRef.current;
          } else {
            newMessages.push({
              role: "bot",
              content: currentBotMessageRef.current,
              timestamp: new Date(),
              isStreaming: true,
            });
          }

          return newMessages;
        });
      }
    };

    const handleBotError = (error) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            error.message || "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
          isError: true,
        },
      ]);
      setIsTyping(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("bot_typing", handleBotTyping);
    socket.on("bot_response_chunk", handleBotResponseChunk);
    socket.on("bot_error", handleBotError);

    // Cleanup
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("bot_typing", handleBotTyping);
      socket.off("bot_response_chunk", handleBotResponseChunk);
      socket.off("bot_error", handleBotError);
    };
  }, [isOpen]);

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !isConnected) return;

    const userMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Build conversation history (last 10 messages for context)
    const conversationHistory = messages
      .slice(-10)
      .filter((msg) => !msg.isStreaming && !msg.isError)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Emit to socket
    socket.emit("user_message", {
      message: inputMessage.trim(),
      conversationHistory,
    });

    setInputMessage("");
    currentBotMessageRef.current = "";
  };

  // Toggle chatbot
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-full p-4 shadow-2xl hover:shadow-purple-500/50 transition-shadow duration-300 group"
        aria-label="Toggle chatbot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Bot className="w-6 h-6" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
              />
            </motion.div>
          )}
        </AnimatePresence>
        {!isConnected && isOpen && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"
          />
        )}
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-md sm:w-96 h-[600px] bg-white/95 backdrop-blur-xl dark:bg-gray-900/95 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
          >
            {/* Header */}
            <div className="relative bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-5 flex items-center justify-between overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
              <div className="flex items-center space-x-3 relative z-10">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="relative"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  {isConnected && (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center"
                    >
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    </motion.span>
                  )}
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg">AI Assistant</h3>
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <p className="text-xs font-medium opacity-90">
                    {isConnected ? "Ready to help you" : "Connecting..."}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleChat}
                className="hover:bg-white/20 rounded-xl p-2 transition-colors relative z-10"
              >
                <Minimize2 className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-br-none shadow-lg shadow-purple-500/30"
                        : message.isError
                        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-bl-none border-2 border-red-200 dark:border-red-800"
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-lg border border-gray-100 dark:border-gray-700"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="text-sm whitespace-pre-wrap wrap-break-word">
                        {message.content}
                      </p>
                    ) : (
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            code: ({ inline, children }) =>
                              inline ? (
                                <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                                  {children}
                                </code>
                              ) : (
                                <code className="block bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs overflow-x-auto">
                                  {children}
                                </code>
                              ),
                            ul: ({ children }) => (
                              <ul className="list-disc ml-4 mb-2">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal ml-4 mb-2">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="mb-1">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"></span>
                    )}
                  </motion.div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && !currentBotMessageRef.current && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-none px-5 py-3 shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <div className="flex space-x-1.5">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0,
                          }}
                          className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0.2,
                          }}
                          className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0.4,
                          }}
                          className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      isConnected ? "Ask me anything..." : "Connecting..."
                    }
                    disabled={!isConnected || isTyping}
                    className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-sm"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={!inputMessage.trim() || !isConnected || isTyping}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 text-white px-5 py-3 rounded-2xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center shrink-0"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </form>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Powered by AI • {isConnected ? "Connected" : "Offline"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
