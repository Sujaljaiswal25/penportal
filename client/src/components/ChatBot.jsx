import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
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
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group"
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
        {!isConnected && isOpen && (
          <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                {isConnected && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI Assistant</h3>
                <p className="text-xs opacity-90">
                  {isConnected ? "Online" : "Connecting..."}
                </p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
                      : message.isError
                      ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-bl-none"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-md"
                  }`}
                >
                  {message.role === "user" ? (
                    <p className="text-sm whitespace-pre-wrap break-words">
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
                            <ul className="list-disc ml-4 mb-2">{children}</ul>
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
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && !currentBotMessageRef.current && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-md">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isConnected ? "Type your message..." : "Connecting..."
                }
                disabled={!isConnected || isTyping}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || !isConnected || isTyping}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
