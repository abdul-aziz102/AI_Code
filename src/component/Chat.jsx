// Chat.jsx
import React from "react";
import { motion } from "framer-motion";

const Chat = ({
  messages,
  question,
  setQuestion,
  loading,
  isTyping,
  generateAnswer,
  isMobile,
  toggleSidebar,
  messagesEndRef,
}) => {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg max-w-[80%] relative ${
              msg.sender === "user"
                ? "ml-auto bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                : "mr-auto bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            }`}
          >
            {/* Agar AI message ke andar rendered JSX hai (code block wala) to use render karo */}
            {msg.sender === "ai" && msg.render ? (
              <div>{msg.render}</div>
            ) : (
              <p className="whitespace-pre-wrap">{msg.text}</p>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="px-4 pb-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          AI is typing...
        </div>
      )}

      {/* Input box */}
      <div className="p-4 border-t dark:border-gray-700 flex items-center space-x-2">
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 bg-gray-300 dark:bg-gray-700 rounded-lg"
          >
            ☰
          </button>
        )}
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateAnswer()}
          placeholder="Ask me anything..."
          className="flex-1 p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <button
          onClick={generateAnswer}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chat;
