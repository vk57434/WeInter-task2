const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answers: {
    answer_a: String,
    answer_b: String,
    answer_c: String,
    answer_d: String,
  },
  correct_answer: {
    type: String,
    enum: ["answer_a", "answer_b", "answer_c", "answer_d"],
    required: true,
  },
  category: {
    type: String,
    enum: [
      "JavaScript",
      "Python",
      "Java",
      "React",
      "Node.js",
      "SQL",
      "HTML/CSS",
      "DevOps",
      "General Programming",
    ],
    default: "General Programming",
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Question", questionSchema);
