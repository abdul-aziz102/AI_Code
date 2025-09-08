import React, { useState } from 'react';
import { 
  FaPlus, 
  FaHistory, 
  FaTrash, 
  FaSearch, 
  FaTimes, 
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaLightbulb,
  FaQuestionCircle,
  FaStar,
  FaRegStar,
  FaEllipsisV
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ 
  isOpen,
  isMobile,
  toggleSidebar,
  startNewChat,
  history,
  activeHistory,
  loadChatFromHistory,
  deleteChatFromHistory,
  clearAllHistory,
  darkMode,
  toggleDarkMode,
  user
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showOptions, setShowOptions] = useState(null);

  // Filter history based on search term
  const filteredHistory = history.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.messages.some(msg => msg.text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Toggle favorite status (placeholder function)
  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    console.log("Toggle favorite for:", id);
    // In a real app, you would update the favorite status in state
  };

  return (
    <AnimatePresence>
      {(isOpen || !isMobile) && (
        <motion.div 
          initial={{ x: isMobile ? -300 : 0 }}
          animate={{ x: isOpen ? 0 : (isMobile ? -300 : 0) }}
          exit={{ x: isMobile ? -300 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed md:relative inset-y-0 left-0 z-20 mt-16 md:mt-0 ${isMobile ? 'h-[calc(100dvh-64px)]' : 'h-full'} w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg md:shadow-none`}
        >
          {/* Header section */}
          <div className="p-4 border-b mt-14 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Chats</h2>
              <div className="flex items-center gap-2">
               
                <div className="relative">
                  <button
                    onClick={() => setShowOptions(showOptions ? null : 'more')}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="More options"
                  >
                    <FaEllipsisV size={14} />
                  </button>
                  
                  {showOptions === 'more' && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                      <button
                        onClick={() => {
                          clearAllHistory();
                          setShowOptions(null);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FaTrash className="mr-2" size={12} />
                        Clear All Chats
                      </button>
                      <button
                        onClick={toggleDarkMode}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {darkMode ? (
                          <>
                            <FaLightbulb className="mr-2" size={12} />
                            Light Mode
                          </>
                        ) : (
                          <>
                            <FaLightbulb className="mr-2" size={12} />
                            Dark Mode
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Search input */}
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 overflow-hidden"
                >
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                    <input
                      type="text"
                      placeholder="Search chats..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <FaTimes size={12} />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* New Chat button */}
            <button
              onClick={startNewChat}
              className="w-full p-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
            >
              <FaPlus /> New Chat
            </button>
          </div>
          
          {/* History list */}
          <div className="flex-1 overflow-y-auto">
            {history.length > 0 ? (
              <>
                <div className="px-4 py-3 flex items-center gap-2 text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                  <FaHistory /> <span className="font-medium text-sm">Recent Chats</span>
                  <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {filteredHistory.length}
                  </span>
                </div>
                
                <div className="space-y-1 p-2">
                  <AnimatePresence>
                    {filteredHistory.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => loadChatFromHistory(item)}
                        className={`p-3 rounded-lg cursor-pointer flex justify-between items-start group ${
                          activeHistory === item.id 
                            ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        } transition-colors`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <button
                              onClick={(e) => toggleFavorite(item.id, e)}
                              className="mt-0.5 text-gray-400 hover:text-yellow-500 transition-colors"
                              title="Favorite"
                            >
                              {item.favorite ? <FaStar className="text-yellow-500" /> : <FaRegStar />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium text-gray-800 dark:text-gray-200 text-sm">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatRelativeTime(item.timestamp)}
                                {item.messageCount && ` • ${item.messageCount} messages`}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => deleteChatFromHistory(item.id, e)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete chat"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                  <FaHistory className="text-gray-500 dark:text-gray-400" size={24} />
                </div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">No chat history yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Start a new conversation and it will appear here.
                </p>
                <button
                  onClick={startNewChat}
                  className="px-4 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                >
                  Start a chat
                </button>
              </div>
            )}
          </div>
          
          {/* Footer section */}
          <div className="p-4 border-t dark:border-gray-700">
            {user ? (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-medium">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.plan || 'Free Plan'}
                  </p>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <FaCog size={14} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <FaQuestionCircle className="text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Sign in to sync your chats across devices
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    Login
                  </button>
                  <button className="flex-1 py-2 px-3 text-sm rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 transition-all">
                    Sign Up
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Default props for demonstration
Sidebar.defaultProps = {
  user: null,
  // user: { name: "John Doe", email: "john@example.com", avatar: null, plan: "Pro Plan" }
};

export default Sidebar;