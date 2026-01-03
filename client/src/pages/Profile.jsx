import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";

function Profile() {
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    fetchUserProfile();
    fetchUserScores();
  }, [userId, navigate]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
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

  const fetchUserScores = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/scores/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setScores(data || []);
      }
    } catch (err) {
      console.error("Error fetching scores:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load profile</p>
            <Link to="/login" className="text-blue-600 hover:text-blue-700">
              Go to Login
            </Link>
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

  const formatTime = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.name || "User"}</h1>
                <p className="text-gray-600">{user.email}</p>
                {user.createdAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    Member since {formatDate(user.createdAt)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/quiz"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Start Quiz
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Total Score</h3>
              <span className="text-2xl">🏆</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{user.totalScore || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Points earned</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Quizzes Completed</h3>
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{user.quizzesCompleted || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Total quizzes taken</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Average Score</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{user.averageScore || 0}%</p>
            <p className="text-sm text-gray-500 mt-1">Average performance</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quiz History</h2>
          
          {scores.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No quiz history yet</p>
              <Link
                to="/quiz"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Take Your First Quiz
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Difficulty</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, index) => (
                    <tr key={score._id || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">{formatDate(score.createdAt)}</td>
                      <td className="py-3 px-4 text-gray-700">{score.category || "General"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          score.difficulty === "Easy" ? "bg-green-100 text-green-700" :
                          score.difficulty === "Medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {score.difficulty || "Medium"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-semibold">
                        {score.score || 0}/{score.totalQuestions || 0}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{formatTime(score.timeSpent)}</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${
                          (score.percentage || 0) >= 80 ? "text-green-600" :
                          (score.percentage || 0) >= 60 ? "text-yellow-600" :
                          "text-red-600"
                        }`}>
                          {score.percentage || 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;

