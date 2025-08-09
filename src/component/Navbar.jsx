import React from 'react';
import { FaRobot, FaBars, FaTimes, FaMoon, FaSun } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Navbar = ({ isMobile, darkMode, toggleDarkMode, showSidebar, setShowSidebar }) => {
  return (
    <div className="md:hidden w-full fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
      >
        {showSidebar ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
      <div className='flex w-full items-center justify-between px-2'>
        <h1 className="text-lg flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
          <FaRobot className="text-blue-500" /> PAK AI
        </h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-600" />}
          </button>
          <Link to='/signup'>
            <button className="py-2 px-4 flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full transition-all shadow-md hover:shadow-lg">
              Signup
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;