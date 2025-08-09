import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaRobot, FaCopy, FaTrash, FaPlus, FaPaperPlane, FaBars, FaTimes, FaMoon, FaSun, FaHistory } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Aichat = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeHistory, setActiveHistory] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [darkMode, setDarkMode] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cleanResponse = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^#+\s*/gm, '')
      .replace(/`{3}(.*?)`{3}/gs, '<pre>$1</pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/- /g, '• ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const generateAnswer = async () => {
    if (!question.trim()) return;

    const currentQuestion = question;
    const userMessage = { text: currentQuestion, sender: 'user' };
    const tempMessages = [...messages, userMessage];
    setMessages(tempMessages);
    setQuestion('');
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBKqC3-JdSNxSVwwHuZK7HiVov-7oMTDx8',
        {
          contents: tempMessages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          }))
        }
      );

      let aiText =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        '⚠️ Sorry, I could not understand that.';

      aiText = cleanResponse(aiText);

      // Simulate typing effect
      setIsTyping(true);
      const aiMessage = { text: '', sender: 'ai' };
      setMessages(prev => [...tempMessages, aiMessage]);
      
      let displayedText = '';
      for (let i = 0; i < aiText.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 10));
        displayedText = aiText.substring(0, i + 1);
        setMessages(prev => [...tempMessages, { text: displayedText, sender: 'ai' }]);
      }

      const finalMessages = [...tempMessages, { text: aiText, sender: 'ai' }];
      
      const newHistoryItem = {
        id: Date.now(),
        title: currentQuestion.substring(0, 30) + (currentQuestion.length > 30 ? '...' : ''),
        messages: finalMessages,
        timestamp: new Date().toLocaleString()
      };
      setHistory((prev) => [newHistoryItem, ...prev]);
      setActiveHistory(newHistoryItem.id);
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      setMessages((prev) => [
        ...prev,
        { text: '❌ Failed to get answer. Please try again.', sender: 'ai' }
      ]);
    } finally {
      setLoading(false);
      setIsTyping(false);
      if (isMobile) setShowSidebar(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text.replace(/<[^>]*>?/gm, ''));
  };

  const startNewChat = () => {
    if (messages.length > 0 && (!activeHistory || !history.some(h => h.id === activeHistory))) {
      const newHistoryItem = {
        id: Date.now(),
        title: messages[0]?.text?.substring(0, 30) || 'New Chat',
        messages: [...messages],
        timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    }
    setMessages([]);
    setActiveHistory(null);
    if (isMobile) setShowSidebar(false);
  };

  const loadChatFromHistory = (historyItem) => {
    setMessages(historyItem.messages);
    setActiveHistory(historyItem.id);
    if (isMobile) setShowSidebar(false);
  };

  const deleteChatFromHistory = (id, e) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
    if (activeHistory === id) {
      startNewChat();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`flex h-[100dvh] w-full ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-full w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden relative">
        {/* Mobile Header */}
        {isMobile && (
          <div className="md:hidden w-full fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
            >
              {showSidebar ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
            <div className='flex w-full items-center justify-between px-2'>
              <h1 className="text-lg flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
                <FaRobot className="text-blue-500" /> Code-Minde
              </h1>
              <div className="flex items-center gap-2">
               
                <Link to='/signup'>
                  <button className="py-2 px-4 flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full transition-all shadow-md hover:shadow-lg">
                    Signup
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <AnimatePresence>
          {(showSidebar || !isMobile) && (
            <motion.div 
              initial={{ x: isMobile ? -300 : 0 }}
              animate={{ x: 0 }}
              exit={{ x: isMobile ? -300 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`fixed md:relative inset-y-0 left-0 z-20 ${isMobile ? 'mt-16 h-[calc(100dvh-64px)]' : 'h-full'} w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg md:shadow-none`}
            >
              <div className="p-4">
                <button
                  onClick={startNewChat}
                  className="w-full p-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  <FaPlus /> New Chat
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-2 touch-scroll">
                <div className="px-4 py-2 flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <FaHistory /> <span className="font-medium">Recent Chats</span>
                </div>
                {history.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No chat history yet</p>
                  </div>
                ) : (
                  <div className="space-y-1 pb-4">
                    {history.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => loadChatFromHistory(item)}
                        className={`p-3 rounded-lg cursor-pointer flex justify-between items-start group ${
                          activeHistory === item.id 
                            ? 'bg-blue-100 dark:bg-gray-700' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        } transition-colors`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-gray-800 dark:text-gray-200">{item.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.timestamp}</p>
                        </div>
                        <button
                          onClick={(e) => deleteChatFromHistory(item.id, e)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 ml-2 transition-opacity"
                          title="Delete chat"
                        >
                          <FaTrash size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {!isMobile && (
                  <div className="flex items-center justify-between">
                  
                    <Link to='/signup'>
                      <button className="py-2 px-4 flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full transition-all shadow-md hover:shadow-lg">
                        Signup
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col h-full ${isMobile ? 'pt-16' : ''}`}>
          {!isMobile && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 bg-white dark:bg-gray-800 shadow-sm">
              <h1 className="text-xl flex items-center gap-3 font-bold text-blue-600 dark:text-blue-400">
                <FaRobot className="text-blue-500" /> Code-Mind
              </h1>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <FaHistory />
                </button>
                <Link to='/signup'>
                  <button className="py-2 px-4 flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full transition-all shadow-md hover:shadow-lg">
                    Signup
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 touch-scroll bg-gray-50 dark:bg-gray-900/50">
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400"
              >
                <FaRobot className="text-5xl mb-4 text-gray-300 dark:text-gray-600" />
                <h2 className="text-xl font-medium mb-2 text-gray-700 dark:text-gray-300">Start a conversation</h2>
                <p className="max-w-md px-4">Ask me anything - I can help with information, creative writing, coding, and more!</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setQuestion("Explain quantum computing in simple terms")}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    Explain quantum computing
                  </button>
                  <button 
                    onClick={() => setQuestion("Write a poem about artificial intelligence")}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    Write an AI poem
                  </button>
                  <button 
                    onClick={() => setQuestion("How do I make a website responsive?")}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    Responsive design tips
                  </button>
                  <button 
                    onClick={() => setQuestion("What's the latest in AI research?")}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    Latest in AI research
                  </button>
                </div>
              </motion.div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[90%] md:max-w-3xl rounded-xl px-4 py-3 relative ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-white dark:bg-gray-800 rounded-bl-none shadow-md dark:shadow-gray-800/10'
                  }`}>
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                      __html: msg.text.replace(/\n/g, '<br/>') 
                    }} />
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => copyToClipboard(msg.text)}
                        className="absolute -top-2 -right-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-md"
                        title="Copy"
                      >
                        <FaCopy className="text-gray-600 dark:text-gray-300" size={12} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="max-w-[90%] md:max-w-3xl rounded-xl px-4 py-3 bg-white dark:bg-gray-800 rounded-bl-none shadow-md dark:shadow-gray-800/10">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex gap-2">
              {isMobile && !showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <FaBars />
                </button>
              )}
              <input
                type="text"
                placeholder="Type your message..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && generateAnswer()}
                className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
              />
              <button
                onClick={generateAnswer}
                disabled={loading || !question.trim()}
                className={`p-3 rounded-lg flex items-center justify-center transition-all ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : question.trim()
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg'
                      : 'bg-gray-400 cursor-not-allowed'
                } text-white`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              PAK AI may produce inaccurate information about people, places, or facts.
            </p>
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobile && showSidebar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setShowSidebar(false)}
          ></motion.div>
        )}
      </div>
    </div>
  );
};

export default Aichat;