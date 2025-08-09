import React from 'react';
import { FaPlus, FaHistory, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Sidebar = ({ 
  isMobile, 
  showSidebar, 
  setShowSidebar, 
  startNewChat, 
  history, 
  activeHistory, 
  loadChatFromHistory, 
  deleteChatFromHistory 
}) => {
  return (
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
  );
};

export default Sidebar;