import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [startQuiz, setStartQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [category, setCategory] = useState("");
  const [difficultySelect, setDifficultySelect] = useState("");
  const [typeSelect, setTypeSelect] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10);
  const [loadingGen, setLoadingGen] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/questions/categories");
        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await res.json();
        setCategoryOptions(data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategoryOptions([
          "General Programming",
          "JavaScript",
          "Python",
          "Java",
          "React",
          "Node.js",
          "SQL",
          "HTML/CSS"
        ]);
      }
    };
    fetchCats();
    
    // Cleanup timer on unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleSubmitQuiz = async () => {
    // Stop timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Calculate score
    let correctCount = 0;
    const questionResults = questions.map((q, qIndex) => {
      const userAnswerKey = answers[qIndex];
      const userAnswerIndex = userAnswerKey ? parseInt(userAnswerKey.split('_')[1]) : null;
      const userAnswer = userAnswerIndex !== null ? q.options[userAnswerIndex] : null;
      const correctAnswers = q.correct_answers || [];
      const isCorrect = userAnswer && correctAnswers.includes(userAnswer);
      
      if (isCorrect) correctCount++;
      
      return {
        question: q.question_text || q.question,
        userAnswer: userAnswer || "Not answered",
        correctAnswer: correctAnswers[0] || "N/A",
        isCorrect,
        options: q.options || [],
        explanation: q.explanation || ""
      };
    });

    const score = correctCount;
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const totalTimeAllotted = (timeLimitMinutes || 10) * 60;
    const timeSpent = startTime ? totalTimeAllotted - timeRemaining : 0;

    const resultsData = {
      score,
      totalQuestions,
      percentage,
      timeSpent,
      questionResults,
      category: category || "General",
      difficulty: difficultySelect || "Medium"
    };

    setResults(resultsData);
    setShowResults(true);

    // Save score to backend
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    
    if (userId && userName) {
      try {
        await fetch("http://localhost:5000/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            name: userName,
            score,
            totalQuestions,
            category: category || "General",
            difficulty: difficultySelect || "Medium",
            timeSpent
          }),
        });
      } catch (err) {
        console.error("Failed to save score:", err);
      }
    }
  };

  const startExam = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoadingGen(true);
    try {
      const body = {
        subject: category || "",
        number_of_questions: parseInt(numberOfQuestions, 10) || 10,
        time_limit_minutes: parseInt(timeLimitMinutes, 10) || 10,
        format: typeSelect || "MCQ",
        difficulty: difficultySelect || "medium",
      };

      const res = await fetch("http://localhost:5000/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate quiz");
      }

      const questionsData = data.questions || [];
      if (questionsData.length === 0) {
        throw new Error("No questions were generated. Please try different settings.");
      }
      
      console.log("Quiz questions loaded:", questionsData);
      setQuestions(questionsData);
      const totalSeconds = (data.time_limit_minutes || timeLimitMinutes) * 60;
      setTimeRemaining(totalSeconds);
      setStartQuiz(true);
      setShowResults(false);
      setIndex(0);
      setAnswers({});
      setStartTime(Date.now());
      
      // Start timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      alert(err.message || "Failed to start quiz");
      console.error("Quiz generation error:", err);
    } finally {
      setLoadingGen(false);
    }
  };

  if (!startQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Create Exam</h1>
          <form onSubmit={startExam} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
            <div>
              <label className="block mb-2 font-semibold">Number of Questions:</label>
              <input
                type="number"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(e.target.value)}
                min="1"
                max="50"
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Select Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Any Category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Select Difficulty:</label>
              <select
                value={difficultySelect}
                onChange={(e) => setDifficultySelect(e.target.value)}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Any Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Select Type:</label>
              <select
                value={typeSelect}
                onChange={(e) => setTypeSelect(e.target.value)}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="MCQ">MCQ</option>
                <option value="True-False">True-False</option>
                <option value="Multiple Correct">Multiple Correct</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Time Limit (minutes):</label>
              <input
                type="number"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value)}
                min="1"
                max="120"
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loadingGen}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                loadingGen
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loadingGen ? "Generating Quiz..." : "Start Quiz"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Quiz Results</h1>
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-600 rounded-full mb-4">
                <span className="text-white text-4xl font-bold">{results.percentage}%</span>
              </div>
              <p className="text-2xl font-semibold text-gray-700">
                You scored {results.score} out of {results.totalQuestions}
              </p>
              <p className="text-gray-600 mt-2">Time taken: {Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Score</p>
                <p className="text-2xl font-bold text-blue-600">{results.score}/{results.totalQuestions}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Correct</p>
                <p className="text-2xl font-bold text-green-600">{results.score}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Incorrect</p>
                <p className="text-2xl font-bold text-red-600">{results.totalQuestions - results.score}</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Question Review</h2>
              <div className="space-y-4">
                {results.questionResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`border-2 rounded-lg p-4 ${
                      result.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-gray-900">Question {idx + 1}</p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          result.isCorrect
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{result.question}</p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-semibold">Your answer:</span>{" "}
                        <span className={result.isCorrect ? "text-green-700" : "text-red-700"}>
                          {result.userAnswer}
                        </span>
                      </p>
                      {!result.isCorrect && (
                        <p>
                          <span className="font-semibold">Correct answer:</span>{" "}
                          <span className="text-green-700">{result.correctAnswer}</span>
                        </p>
                      )}
                      {result.explanation && (
                        <p className="text-gray-600 italic mt-2">{result.explanation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setStartQuiz(false);
                  setShowResults(false);
                  setResults(null);
                  setQuestions([]);
                  setAnswers({});
                  setIndex(0);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Take Another Quiz
              </button>
              <button
                onClick={() => {
                  window.location.href = "/profile";
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 60) return "text-red-600";
    if (timeRemaining <= 300) return "text-yellow-600";
    return "text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Timer Display */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <span className="text-sm font-medium text-gray-600">Time Remaining:</span>
            </div>
            <div className={`text-3xl font-bold font-mono ${getTimeColor()}`}>
              {formatTime(timeRemaining)}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Question {index + 1} of {questions.length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            Question {index + 1} of {questions.length}
          </h2>
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">No questions available. Please start a new quiz.</p>
              <button
                onClick={() => setStartQuiz(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Back to Quiz Setup
              </button>
            </div>
          ) : questions[index] ? (
            <div>
              <p className="text-lg mb-4 font-semibold text-gray-900">
                {questions[index].question_text || questions[index].question}
              </p>
              <div className="space-y-2">
                {(questions[index].options || []).map((option, optIndex) => {
                  const optionKey = `option_${optIndex}`;
                  return (
                    <label key={optIndex} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={optionKey}
                        checked={answers[index] === optionKey}
                        onChange={() => setAnswers({ ...answers, [index]: optionKey })}
                        className="mr-3"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setIndex(Math.max(0, index - 1))}
                  disabled={index === 0}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    if (index < questions.length - 1) {
                      setIndex(index + 1);
                    } else {
                      handleSubmitQuiz();
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {index < questions.length - 1 ? "Next" : "Submit"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Question not found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Quiz;

