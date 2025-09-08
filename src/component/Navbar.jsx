import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaSun, FaMoon, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ 
  isSidebarOpen, 
  toggleSidebar, 
  darkMode, 
  toggleDarkMode,
  user 
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  
  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-menu')) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  // Determine if we're on the chat page
  const isChatPage = location.pathname === '/';

  return (
    <div className="w-full fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm transition-colors duration-200">

      {/* Left section - Mobile menu toggle and logo */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold w-14 text-lg">Pak</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            PAK-AI
          </h1>
        </Link>

        {/* New chat button - only show on chat page */}
       
      </div>

      {/* Center section - Page title (optional) */}
      <div className="hidden md:flex items-center">
        {location.pathname !== '/' && (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 capitalize">
            {location.pathname.replace('/', '')}
          </span>
        )}
      </div>

      {/* Right section - Actions and user menu */}
      <div className="flex items-center gap-3">
      

        {user ? (
          /* User is logged in - show profile menu */
          <div className="relative profile-menu">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="User profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-medium">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
            </button>

            {/* Profile dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-40">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                
                <Link 
                  to="/profile" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <FaUser className="mr-2" size={14} />
                  Profile
                </Link>
                
                <Link 
                  to="/settings" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <FaCog className="mr-2" size={14} />
                  Settings
                </Link>
                
                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                
                <button
                  onClick={() => {
                    // Handle logout
                    console.log("Logout clicked");
                    setIsProfileOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaSignOutAlt className="mr-2" size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          /* User is not logged in - show signup/login buttons */
          <div className="flex items-center gap-2">
            <Link to="/login">
              <button className="py-1.5 px-4 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="py-1.5 px-4 flex items-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-full transition-all shadow-md hover:shadow-lg text-sm">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Default props for demonstration
Navbar.defaultProps = {
  user: null,
  // user: { name: "John Doe", email: "john@example.com", avatar: null }
};

export default Navbar;