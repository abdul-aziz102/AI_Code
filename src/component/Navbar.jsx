import React from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <div className="w-full fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">

      {/* Mobile menu toggle */}
      <div className="md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
          <span className="text-blue-500">Code-Mind</span>
        </h1>
      </div>

      {/* Signup */}
      <div className="flex items-center gap-2">
        <Link to="/signup">
          <button className="py-2 px-4 flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full transition-all shadow-md hover:shadow-lg">
            Signup
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
