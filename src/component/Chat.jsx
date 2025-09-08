import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Menu, 
  Bot, 
  User, 
  Copy, 
  CheckCheck, 
  Download,
  Trash2,
  Edit3
} from "lucide-react";

const Chat = ({
  messages,
  question,
  setQuestion,
  loading,
  isTyping,
  typingProgress,
  generateAnswer,
  isMobile,
  toggleSidebar,
  messagesEndRef,
  error,
  darkMode
}) => {
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editText, setEditText] = useState("");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [question]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, just display file name - in a real app, you'd process this
      setQuestion(prev => prev + ` [File: ${file.name}]`);
    }
  };

  // Copy message to clipboard
  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(-1), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Edit message
  const startEditing = (index, text) => {
    setEditingIndex(index);
    setEditText(text);
  };

  const saveEdit = (index) => {
    if (editText.trim()) {
      // In a real app, you would update the message in state
      console.log("Edited message:", editText);
    }
    setEditingIndex(-1);
    setEditText("");
  };

  // Export conversation
  const exportConversation = () => {
    const conversation = messages.map(msg => 
      `${msg.sender === 'user' ? 'You' : 'AI'}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Clear conversation
  const clearConversation = () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      // In a real app, you would clear the messages
      console.log("Conversation cleared");
    }
  };

  // Animation variants
  const messageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-gray-900">
      {/* Header with conversation actions */}
     

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400"
            >
              <Bot size={48} className="mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">How can I help you today?</h3>
              <p className="max-w-md">Ask me anything, from coding help to creative writing, or upload a file for analysis.</p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium">Try asking:</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• "Explain quantum computing"</li>
                    <li>• "How to center a div in CSS?"</li>
                    <li>• "Write a poem about technology"</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium">Capabilities:</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Code explanation & generation</li>
                    <li>• Creative writing</li>
                    <li>• File analysis</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : (
            messages.map((msg, index) => (
              <motion.div
                key={index}
                variants={messageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex max-w-[85%] md:max-w-[75%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex-shrink-0 mt-2 mx-2 ${msg.sender === "user" ? "ml-2" : "mr-2"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.sender === "user" 
                        ? "bg-gradient-to-r from-purple-600 to-cyan-600" 
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}>
                      {msg.sender === "user" ? (
                        <User size={16} className="text-white" />
                      ) : (
                        <Bot size={16} className="text-gray-800 dark:text-white" />
                      )}
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-2xl relative group ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-br-none"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                  }`}>
                    {editingIndex === index && msg.sender === "user" ? (
                      <div className="mb-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          rows={3}
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => setEditingIndex(-1)}
                            className="px-3 py-1 text-sm rounded-lg bg-gray-200 dark:bg-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(index)}
                            className="px-3 py-1 text-sm rounded-lg bg-purple-600 text-white"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.sender === "ai" && msg.render ? (
                          <div>{msg.render}</div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        )}
                        
                        <div className="flex items-center justify-between mt-2 text-xs opacity-80">
                          <span>{msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          
                          {msg.isError && (
                            <span className="text-red-300 dark:text-red-400">⚠️ Error</span>
                          )}
                        </div>
                        
                        {/* Message actions */}
                        <div className={`absolute flex opacity-0 group-hover:opacity-100 transition-opacity ${
                          msg.sender === "user" ? "-left-14 top-2" : "-right-14 top-2"
                        }`}>
                          <button
                            onClick={() => copyToClipboard(msg.text, index)}
                            className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            title="Copy message"
                          >
                            {copiedIndex === index ? <CheckCheck size={14} /> : <Copy size={14} />}
                          </button>
                          
                          {msg.sender === "user" && (
                            <button
                              onClick={() => startEditing(index, msg.text)}
                              className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ml-1"
                              title="Edit message"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        
        {/* AI is typing indicator with simulated text */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex max-w-[85%] md:max-w-[75%]">
              <div className="flex-shrink-0 mt-2 mr-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
                  <Bot size={16} className="text-gray-800 dark:text-white" />
                </div>
              </div>
              
              <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none">
                <p className="whitespace-pre-wrap">
                  {typingProgress}
                  <span className="inline-block w-2 h-4 bg-gray-500 dark:bg-gray-400 ml-1 animate-pulse"></span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mb-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Input area */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 p-4 border-t dark:border-gray-700">
        <div className="flex items-end space-x-2">
          <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 p-3 bg-transparent resize-none outline-none min-h-[50px] max-h-[150px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generateAnswer();
                }
              }}
            />
            
            <div className="flex justify-between items-center px-3 py-2 border-t dark:border-gray-700">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Upload file"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </button>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {question.length}/2000
              </div>
            </div>
          </div>
          
          <button
            onClick={generateAnswer}
            disabled={loading || !question.trim()}
            className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-cyan-700 transition-all flex items-center justify-center"
            title="Send message"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          AI may produce inaccurate information about people, places, or facts.
        </div>
      </div>
    </div>
  );
};

export default Chat;