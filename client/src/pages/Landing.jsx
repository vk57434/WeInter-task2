import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Landing() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (userId) {
      navigate("/dashboard");
    }
  }, [userId, navigate]);

  // Don't show login/register if user is logged in
  if (userId) {
    return null; // Will redirect, so return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="w-full max-w-md">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <span className="text-white text-2xl font-bold">🎓</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Quiz App</h1>
            <p className="text-gray-600 mb-6">Study smarter with AI-powered quizzes</p>
          </div>

          {/* Auth Options */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Get Started</h2>
            
            <div className="space-y-4">
              <Link
                to="/login"
                className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold text-center transition"
              >
                Sign In
              </Link>
              
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500">OR</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
              
              <Link
                to="/register"
                className="block w-full bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 font-semibold text-center transition"
              >
                Sign Up Free
              </Link>
            </div>

            <p className="text-sm text-gray-500 text-center mt-6">
              New to Quiz App? Create an account to start taking quizzes
            </p>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default Landing;

