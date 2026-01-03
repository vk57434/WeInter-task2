import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentScores, setRecentScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    fetchUserData();
    fetchRecentScores();
  }, [userId, navigate]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser({
          name: userName,
          email: userEmail,
          totalScore: 0,
          quizzesCompleted: 0,
          averageScore: 0,
        });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUser({
        name: userName,
        email: userEmail,
        totalScore: 0,
        quizzesCompleted: 0,
        averageScore: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentScores = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/scores/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setRecentScores(data.slice(0, 5) || []);
      }
    } catch (err) {
      console.error("Error fetching scores:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || "User"}! 👋
          </h1>
          <p className="text-gray-600">Ready to test your knowledge? Let's get started!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/quiz"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white text-2xl">📝</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Start New Quiz</h3>
                <p className="text-gray-600 text-sm">Take a quiz and test your knowledge</p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white text-2xl">📊</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">View Profile</h3>
                <p className="text-gray-600 text-sm">Check your stats and progress</p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Your Goal</h3>
                <p className="text-gray-600 text-sm">Keep improving your scores!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Total Score</h3>
              <span className="text-3xl">🏆</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{user?.totalScore || 0}</p>
            <p className="text-sm text-gray-500">Points earned</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Quizzes Completed</h3>
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{user?.quizzesCompleted || 0}</p>
            <p className="text-sm text-gray-500">Total quizzes taken</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Average Score</h3>
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{user?.averageScore || 0}%</p>
            <p className="text-sm text-gray-500">Average performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Quizzes</h2>
              <Link
                to="/profile"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            
            {recentScores.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No quizzes taken yet</p>
                <Link
                  to="/quiz"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
                >
                  Take Your First Quiz
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentScores.map((score, index) => (
                  <div
                    key={score._id || index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{score.category || "General"}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(score.createdAt)} • {score.difficulty || "Medium"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {score.score || 0}/{score.totalQuestions || 0}
                      </p>
                      <p className={`text-sm font-medium ${
                        (score.percentage || 0) >= 80 ? "text-green-600" :
                        (score.percentage || 0) >= 60 ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {score.percentage || 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Start</h2>
            <div className="space-y-4">
              <Link
                to="/quiz"
                className="block w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 font-semibold text-center transition transform hover:scale-105"
              >
                Start New Quiz
              </Link>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Popular Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["Computer Science", "Engineering", "JavaScript", "Python"].map((cat) => (
                    <Link
                      key={cat}
                      to="/quiz"
                      className="text-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition text-sm font-medium"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

