// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");
const Score = require("./models/Score");
const User = require("./models/User");
const Quiz = require("./models/Quiz");
const Question = require("./models/Question");

// Initialize OpenAI (only if API key is provided)
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "") {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log("✅ OpenAI initialized");
} else {
  console.log("⚠️ OpenAI API key not set. OpenAI question generation will be disabled.");
}

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 🔹 MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/quizapp")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ============================================
// 🔹 USER ENDPOINTS
// ============================================

// Register user
app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.json({ message: "User registered successfully", userId: newUser._id });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

// Login user
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

// Get user profile
app.get("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      totalScore: user.totalScore || 0,
      quizzesCompleted: user.quizzesCompleted || 0,
      averageScore: user.averageScore || 0,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile", details: err.message });
  }
});

// ============================================
// 🔹 QUIZ ENDPOINTS
// ============================================

// Get all quizzes
app.get("/api/quizzes", async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("createdBy", "name email");
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quizzes", details: err.message });
  }
});

// Get quiz by ID
app.get("/api/quizzes/:quizId", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quiz", details: err.message });
  }
});

// Create quiz
app.post("/api/quizzes", async (req, res) => {
  try {
    const { title, description, category, difficulty, totalQuestions, timeLimit, questions, createdBy } = req.body;

    if (!title || !totalQuestions || !questions) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newQuiz = new Quiz({
      title,
      description,
      category,
      difficulty,
      totalQuestions,
      timeLimit,
      questions,
      createdBy,
    });

    await newQuiz.save();
    res.json({ message: "Quiz created successfully", quizId: newQuiz._id });
  } catch (err) {
    res.status(500).json({ error: "Failed to create quiz", details: err.message });
  }
});

// ============================================
// 🔹 RANDOM QUESTIONS ENDPOINTS (NEW)
// ============================================

// Get random programming questions
app.get("/api/questions/random", async (req, res) => {
  try {
    const count = req.query.count || 10;
    const category = req.query.category;
    const difficulty = req.query.difficulty;

    let filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(count) } },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found" });
    }

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions", details: err.message });
  }
});

// Get questions by category
app.get("/api/questions/category/:category", async (req, res) => {
  try {
    const count = req.query.count || 10;
    const questions = await Question.aggregate([
      { $match: { category: req.params.category } },
      { $sample: { size: parseInt(count) } },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ message: `No questions found for category: ${req.params.category}` });
    }

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions", details: err.message });
  }
});

// Get all question categories
app.get("/api/questions/categories", async (req, res) => {
  try {
    // Get categories from database
    const dbCategories = await Question.distinct("category");
    
    // Extended list of available categories (including those that might come from QuizAPI.io)
    const allCategories = [
      "General Programming",
      "JavaScript",
      "Python",
      "Java",
      "React",
      "Node.js",
      "SQL",
      "HTML/CSS"
    ];
    
    // Combine and deduplicate
    const combinedCategories = Array.from(new Set([...dbCategories, ...allCategories]));
    
    // Sort alphabetically
    combinedCategories.sort();
    
    res.json(combinedCategories);
  } catch (err) {
    // If database fails, return the extended list
    res.json([
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
});

// Get questions by difficulty
app.get("/api/questions/difficulty/:difficulty", async (req, res) => {
  try {
    const count = req.query.count || 10;
    const questions = await Question.aggregate([
      { $match: { difficulty: req.params.difficulty } },
      { $sample: { size: parseInt(count) } },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ message: `No ${req.params.difficulty} questions found` });
    }

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions", details: err.message });
  }
});

// ============================================
// 🔹 Generate quiz from preferences (strict)
// ============================================

// Helper function to fetch questions from QuizAPI.io
async function fetchQuestionsFromQuizAPI(count, category = null, difficulty = null) {
  try {
    // Use environment variable if set, otherwise use the provided API key
    const apiKey = process.env.QUIZAPI_KEY || "LDvxQ3VegxXo4roLp236dKcJ3v1xmaExmur1FlYd";
    
    if (!apiKey || apiKey === "YOUR_API_KEY") {
      console.warn("⚠️ QuizAPI.io key not set. Using fallback questions.");
      return null;
    }

    let url = `https://quizapi.io/api/v1/questions?apiKey=${apiKey}&limit=${count}`;
    
    // Map our difficulty to QuizAPI format
    if (difficulty) {
      const difficultyMap = {
        easy: "easy",
        medium: "medium",
        hard: "hard"
      };
      if (difficultyMap[difficulty.toLowerCase()]) {
        url += `&difficulty=${difficultyMap[difficulty.toLowerCase()]}`;
      }
    }

    // Map category if provided
    if (category && category !== "" && category !== "Any Category") {
      // QuizAPI.io supports categories like: Linux, DevOps, Code, etc.
      // Map our categories to QuizAPI.io categories
      const categoryMap = {
        "Computer Science": "Code",
        "Engineering": "Code",
        "Linux": "Linux",
        "JavaScript": "Code",
        "Python": "Code",
        "Java": "Code",
        "React": "Code",
        "Node.js": "Code",
        "SQL": "SQL",
        "HTML/CSS": "Code",
        "DevOps": "DevOps",
        "Mathematics": "Code",
        "Physics": "Code",
        "Chemistry": "Code",
        "General Programming": "Code"
      };
      if (categoryMap[category]) {
        url += `&category=${categoryMap[category]}`;
      } else {
        // For unmapped categories, try using the category name directly or use Code as default
        url += `&category=Code`;
      }
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`QuizAPI.io error: ${response.status} ${response.statusText}`, errorText);
      return null;
    }

    const data = await response.json();
    
    // QuizAPI.io returns an array of questions
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching from QuizAPI.io:", error.message);
    return null;
  }
}

// Helper function to generate questions using OpenAI
async function generateQuestionsWithOpenAI(count, category = null, difficulty = "medium", format = "MCQ") {
  try {
    if (!openai) {
      console.warn("⚠️ OpenAI not initialized. API key not set.");
      return null;
    }

    // Build the prompt based on requirements
    let prompt = `Generate ${count} ${format} quiz questions`;
    
    if (category && category !== "" && category !== "Any Category") {
      prompt += ` about ${category}`;
    }
    
    prompt += ` with ${difficulty} difficulty level. `;
    
    if (format === "MCQ") {
      prompt += `Each question should have exactly 4 multiple choice options (A, B, C, D) with one correct answer. `;
    } else if (format === "True-False") {
      prompt += `Each question should be a statement that is either True or False. `;
    } else if (format === "Multiple Correct") {
      prompt += `Each question should have 4 options with multiple correct answers. `;
    }
    
    prompt += `Return the questions in JSON format as an array. Each question object should have:
- question_text: the question text
- options: array of answer options
- correct_answers: array of correct answer(s)
- explanation: brief explanation

Example format:
[
  {
    "question_text": "What is JavaScript?",
    "options": ["A programming language", "A database", "A framework", "An operating system"],
    "correct_answers": ["A programming language"],
    "explanation": "JavaScript is a high-level programming language used for web development."
  }
]

Return only valid JSON, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates educational quiz questions. Always return valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error("OpenAI returned empty response");
      return null;
    }

    // Parse JSON from response (might have markdown code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/```\n?/g, "");
    }

    const questions = JSON.parse(jsonContent);
    
    if (Array.isArray(questions) && questions.length > 0) {
      // Format questions to match our structure
      return questions.map((q, index) => ({
        id: index + 1,
        question_text: q.question_text || q.question,
        options: q.options || [],
        correct_answers: Array.isArray(q.correct_answers) ? q.correct_answers : [q.correct_answers || q.correct_answer],
        explanation: q.explanation || `Correct answer: ${q.correct_answers?.[0] || q.correct_answer || q.options?.[0]}.`,
      }));
    }

    return null;
  } catch (error) {
    console.error("Error generating questions with OpenAI:", error.message);
    return null;
  }
}

// Helper function to convert QuizAPI.io format to our format
function convertQuizAPIQuestions(quizAPIQuestions, format = "MCQ") {
  if (!quizAPIQuestions || !Array.isArray(quizAPIQuestions)) {
    return [];
  }

  return quizAPIQuestions.map((q, index) => {
    const options = [];
    const correctAnswers = [];

    // QuizAPI.io structure: answers.answer_a, answers.answer_b, etc.
    // and correct_answers.answer_a_correct, etc.
    if (q.answers) {
      Object.keys(q.answers).forEach((key) => {
        if (q.answers[key]) {
          options.push(q.answers[key]);
          // Check if this is a correct answer
          if (q.correct_answers && q.correct_answers[`${key}_correct`] === "true") {
            correctAnswers.push(q.answers[key]);
          }
        }
      });
    }

    // For True-False format
    if (format === "True-False") {
      const isTrue = correctAnswers.length > 0 && correctAnswers.includes(options[0]);
      return {
        id: index + 1,
        question_text: q.question,
        options: ["True", "False"],
        correct_answers: [isTrue ? "True" : "False"],
        explanation: q.explanation || `The correct answer is ${isTrue ? "True" : "False"}.`,
      };
    }

    // For MCQ format
    return {
      id: index + 1,
      question_text: q.question,
      options: options.slice(0, 4), // Limit to 4 options
      correct_answers: correctAnswers.length > 0 ? [correctAnswers[0]] : [options[0]],
      explanation: q.explanation || `Correct answer: ${correctAnswers[0] || options[0]}.`,
    };
  });
}

// POST body: { subject, number_of_questions, time_limit_minutes, format, difficulty }
app.post("/api/generate-quiz", async (req, res) => {
  try {
    const {
      subject,
      number_of_questions = 10,
      time_limit_minutes = 10,
      format = "MCQ",
      difficulty = "medium",
    } = req.body;

    const count = parseInt(number_of_questions, 10) || 10;

    // Build filter: match category or question text if subject provided
    let filter = { difficulty };
    if (subject) {
      const re = new RegExp(subject, "i");
      filter.$or = [{ category: re }, { question: re }];
    }

    // Try to fetch a sufficiently large pool; increase sampling to improve chances
    const sampleSize = Math.max(50, count * 6);
    const pool = await Question.aggregate([
      { $match: filter },
      { $sample: { size: sampleSize } },
    ]);

    // If not enough questions in pool, try QuizAPI.io, then OpenAI
    if (!pool || pool.length < count) {
      console.log("⚠️ Insufficient local questions. Trying external sources...");
      
      // Try QuizAPI.io first
      const quizAPIQuestions = await fetchQuestionsFromQuizAPI(count, subject, difficulty);
      
      if (quizAPIQuestions && quizAPIQuestions.length > 0) {
        const convertedQuestions = convertQuizAPIQuestions(quizAPIQuestions, format);
        if (convertedQuestions.length >= count) {
          return res.json({
            time_limit_minutes: parseInt(time_limit_minutes, 10) || 10,
            scoring: { correct: 1, incorrect: 0 },
            questions: convertedQuestions.slice(0, count),
          });
        }
      }
      
      // If QuizAPI.io fails, try OpenAI
      console.log("⚠️ QuizAPI.io failed. Generating questions with OpenAI...");
      const openAIQuestions = await generateQuestionsWithOpenAI(count, subject, difficulty, format);
      
      if (openAIQuestions && openAIQuestions.length >= count) {
        return res.json({
          time_limit_minutes: parseInt(time_limit_minutes, 10) || 10,
          scoring: { correct: 1, incorrect: 0 },
          questions: openAIQuestions.slice(0, count),
        });
      }
      
      // If all sources fail, return error
      return res.status(400).json({ 
        message: "Insufficient questions available for the given preferences. Please try different settings or add more questions to the database." 
      });
    }

    // Build exactly `count` questions
    const quizQuestions = [];
    const usedIndexes = new Set();
    let idCounter = 1;

    while (quizQuestions.length < count) {
      const idx = Math.floor(Math.random() * pool.length);
      if (usedIndexes.has(idx)) continue;
      usedIndexes.add(idx);
      const q = pool[idx];
      const opts = Object.values(q.answers || {}).filter(Boolean);
      const correctText = q.answers?.[q.correct_answer] || opts[0] || "";

      if (format === "MCQ") {
        if (opts.length < 2) continue;
        const options = opts.slice(0, 4);
        quizQuestions.push({
          id: idCounter++,
          question_text: q.question,
          options,
          correct_answers: [correctText],
          explanation: `Correct answer: ${correctText}.`,
        });
      } else if (format === "True-False") {
        if (opts.length < 2) continue;
        const makeFalse = Math.random() < 0.5;
        let statementText = "";
        if (!makeFalse) {
          statementText = `${q.question.replace(/\?$/, "")} — ${correctText}`;
        } else {
          const wrongs = opts.filter((o) => o !== correctText);
          if (wrongs.length === 0) continue;
          const wrong = wrongs[Math.floor(Math.random() * wrongs.length)];
          statementText = `${q.question.replace(/\?$/, "")} — ${wrong}`;
        }

        quizQuestions.push({
          id: idCounter++,
          question_text: statementText,
          options: ["True", "False"],
          correct_answers: [!makeFalse ? "True" : "False"],
          explanation: `This statement is ${!makeFalse ? "true" : "false"} based on the original correct answer (${correctText}).`,
        });
      } else if (format === "Multiple Correct") {
        // For multiple correct, combine options from multiple pool items to ensure multiple correct answers
        const otherIdx = Math.floor(Math.random() * pool.length);
        if (otherIdx === idx) continue;
        const other = pool[otherIdx];
        const optsA = opts.slice(0, 3);
        const optsB = Object.values(other.answers || {}).filter(Boolean).slice(0, 3);
        const candidates = Array.from(new Set([...optsA, ...optsB]));
        if (candidates.length < 2) continue;

        const corrects = [];
        if (candidates.includes(correctText)) corrects.push(correctText);
        const otherCorrectText = other.answers?.[other.correct_answer];
        if (otherCorrectText && candidates.includes(otherCorrectText) && !corrects.includes(otherCorrectText)) corrects.push(otherCorrectText);
        if (corrects.length < 2) {
          const extras = candidates.filter((c) => !corrects.includes(c));
          if (extras.length > 0) corrects.push(extras[0]);
        }

        quizQuestions.push({
          id: idCounter++,
          question_text: `${q.question} (Select all that apply)`,
          options: candidates.slice(0, 4),
          correct_answers: corrects,
          explanation: `Correct answers: ${corrects.join(', ')}.`,
        });
      }
    }

    // Response must follow the exam rules: exact count and scoring rule
    return res.json({
      time_limit_minutes: parseInt(time_limit_minutes, 10) || 10,
      scoring: { correct: 1, incorrect: 0 },
      questions: quizQuestions,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate quiz", details: err.message });
  }
});

// ============================================
// 🔹 SCORE ENDPOINTS
// ============================================

// Get leaderboard (top scores)
app.get("/api/leaderboard", async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ score: -1 })
      .limit(10)
      .populate("userId", "name email");
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard", details: err.message });
  }
});

// Get user scores
app.get("/api/scores/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const scores = await Score.find({ userId })
      .sort({ createdAt: -1 })
      .populate("quizId", "title category")
      .limit(50); // Limit to last 50 scores
    
    res.json(scores);
  } catch (err) {
    console.error("Error fetching user scores:", err);
    res.status(500).json({ error: "Failed to fetch scores", details: err.message });
  }
});

// Save score
app.post("/api/scores", async (req, res) => {
  try {
    const { userId, name, score, totalQuestions, quizId, category, difficulty, timeSpent } = req.body;

    if (!name || score === undefined) {
      return res.status(400).json({ message: "Name and score required" });
    }

    const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;

    const newScore = new Score({
      userId,
      name,
      score,
      totalQuestions,
      percentage,
      quizId,
      category,
      difficulty,
      timeSpent,
    });

    await newScore.save();

    // Update user stats
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.quizzesCompleted += 1;
        user.totalScore += score;
        user.averageScore = Math.round(user.totalScore / user.quizzesCompleted);
        await user.save();
      }
    }

    res.json({ message: "Score saved successfully", scoreId: newScore._id });
  } catch (err) {
    res.status(500).json({ error: "Failed to save score", details: err.message });
  }
});

// Get leaderboard by category
app.get("/api/leaderboard/:category", async (req, res) => {
  try {
    const scores = await Score.find({ category: req.params.category })
      .sort({ score: -1 })
      .limit(10)
      .populate("userId", "name email");
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard", details: err.message });
  }
});

// Get stats
app.get("/api/stats/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalScores = await Score.find({ userId: req.params.userId });
    const avgScore = totalScores.length ? Math.round(totalScores.reduce((sum, s) => sum + s.percentage, 0) / totalScores.length) : 0;

    res.json({
      name: user.name,
      quizzesCompleted: user.quizzesCompleted,
      totalScore: user.totalScore,
      averageScore: user.averageScore,
      overallPercentage: avgScore,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
