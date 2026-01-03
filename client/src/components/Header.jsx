import React from "react";
import { Link } from "react-router-dom";

function Header() {
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to={userId ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎓</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Quiz App</span>
          </Link>

          {/* User Menu (only show if logged in) */}
          {userId && (
            <div className="flex items-center gap-3">
              {/* <Link
                to="/quiz"
                className="text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Quiz
              </Link> */}
              <Link
                to="/profile"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <span>{userName || "Profile"}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

