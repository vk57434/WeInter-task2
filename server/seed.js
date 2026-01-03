const mongoose = require("mongoose");
const Question = require("../models/Question");

const programmingQuestions = [
  // JavaScript Questions
  {
    question: "What does 'let' do in JavaScript?",
    answers: {
      answer_a: "Declares a variable with function scope",
      answer_b: "Declares a variable with block scope",
      answer_c: "Declares a constant variable",
      answer_d: "Declares a global variable",
    },
    correct_answer: "answer_b",
    category: "JavaScript",
    difficulty: "Easy",
  },
  {
    question: "What is the correct way to check if a variable is an array in JavaScript?",
    answers: {
      answer_a: "typeof arr === 'array'",
      answer_b: "Array.isArray(arr)",
      answer_c: "arr instanceof Array",
      answer_d: "arr.isArray()",
    },
    correct_answer: "answer_b",
    category: "JavaScript",
    difficulty: "Medium",
  },
  {
    question: "What will be the output of typeof undefined?",
    answers: {
      answer_a: "'undefined'",
      answer_b: "'null'",
      answer_c: "'object'",
      answer_d: "'boolean'",
    },
    correct_answer: "answer_a",
    category: "JavaScript",
    difficulty: "Medium",
  },
  {
    question: "Which method adds one or more elements to the end of an array?",
    answers: {
      answer_a: "push()",
      answer_b: "pop()",
      answer_c: "shift()",
      answer_d: "unshift()",
    },
    correct_answer: "answer_a",
    category: "JavaScript",
    difficulty: "Easy",
  },
  {
    question: "What is the difference between 'let' and 'var'?",
    answers: {
      answer_a: "No difference",
      answer_b: "let has block scope, var has function scope",
      answer_c: "var has block scope, let has function scope",
      answer_d: "let is faster than var",
    },
    correct_answer: "answer_b",
    category: "JavaScript",
    difficulty: "Medium",
  },

  // Python Questions
  {
    question: "Which built-in function is used to get the length of a list in Python?",
    answers: {
      answer_a: "length()",
      answer_b: "size()",
      answer_c: "len()",
      answer_d: "count()",
    },
    correct_answer: "answer_c",
    category: "Python",
    difficulty: "Easy",
  },
  {
    question: "What is the output of print(2 ** 3) in Python?",
    answers: {
      answer_a: "5",
      answer_b: "6",
      answer_c: "8",
      answer_d: "9",
    },
    correct_answer: "answer_c",
    category: "Python",
    difficulty: "Easy",
  },
  {
    question: "Which keyword is used to create a function in Python?",
    answers: {
      answer_a: "function",
      answer_b: "def",
      answer_c: "define",
      answer_d: "func",
    },
    correct_answer: "answer_b",
    category: "Python",
    difficulty: "Easy",
  },
  {
    question: "What data structure is used to store key-value pairs in Python?",
    answers: {
      answer_a: "List",
      answer_b: "Tuple",
      answer_c: "Dictionary",
      answer_d: "Set",
    },
    correct_answer: "answer_c",
    category: "Python",
    difficulty: "Easy",
  },
  {
    question: "What is the output of '5' == 5 in Python?",
    answers: {
      answer_a: "True",
      answer_b: "False",
      answer_c: "Error",
      answer_d: "'True'",
    },
    correct_answer: "answer_b",
    category: "Python",
    difficulty: "Medium",
  },

  // Java Questions
  {
    question: "Which keyword is used to create a class in Java?",
    answers: {
      answer_a: "Class",
      answer_b: "class",
      answer_c: "CLASS",
      answer_d: "Cls",
    },
    correct_answer: "answer_b",
    category: "Java",
    difficulty: "Easy",
  },
  {
    question: "What is the correct syntax to declare a String in Java?",
    answers: {
      answer_a: "String str = 'Hello';",
      answer_b: "string str = 'Hello';",
      answer_c: "String str = \"Hello\";",
      answer_d: "Str str = \"Hello\";",
    },
    correct_answer: "answer_c",
    category: "Java",
    difficulty: "Easy",
  },
  {
    question: "Which method is the entry point of a Java application?",
    answers: {
      answer_a: "start()",
      answer_b: "run()",
      answer_c: "main()",
      answer_d: "init()",
    },
    correct_answer: "answer_c",
    category: "Java",
    difficulty: "Easy",
  },
  {
    question: "What does JVM stand for?",
    answers: {
      answer_a: "Java Virtual Method",
      answer_b: "Java Virtual Machine",
      answer_c: "Java Valued Memory",
      answer_d: "Java Variable Manager",
    },
    correct_answer: "answer_b",
    category: "Java",
    difficulty: "Easy",
  },
  {
    question: "Which access modifier is used by default in Java?",
    answers: {
      answer_a: "public",
      answer_b: "private",
      answer_c: "protected",
      answer_d: "default (package-private)",
    },
    correct_answer: "answer_d",
    category: "Java",
    difficulty: "Medium",
  },

  // React Questions
  {
    question: "What is the correct way to use state in a React functional component?",
    answers: {
      answer_a: "useState()",
      answer_b: "useEffect()",
      answer_c: "useContext()",
      answer_d: "useReducer()",
    },
    correct_answer: "answer_a",
    category: "React",
    difficulty: "Easy",
  },
  {
    question: "What does useEffect hook do in React?",
    answers: {
      answer_a: "Manages component state",
      answer_b: "Performs side effects in functional components",
      answer_c: "Handles component events",
      answer_d: "Creates CSS effects",
    },
    correct_answer: "answer_b",
    category: "React",
    difficulty: "Medium",
  },
  {
    question: "What is JSX?",
    answers: {
      answer_a: "A JavaScript framework",
      answer_b: "A syntax extension to JavaScript",
      answer_c: "A CSS library",
      answer_d: "A database tool",
    },
    correct_answer: "answer_b",
    category: "React",
    difficulty: "Easy",
  },
  {
    question: "How do you pass data from parent to child component in React?",
    answers: {
      answer_a: "Through state",
      answer_b: "Through props",
      answer_c: "Through context",
      answer_d: "Through refs",
    },
    correct_answer: "answer_b",
    category: "React",
    difficulty: "Easy",
  },
  {
    question: "What is the virtual DOM in React?",
    answers: {
      answer_a: "A copy of the actual DOM in memory",
      answer_b: "A virtual reality feature",
      answer_c: "A library for animations",
      answer_d: "A CSS preprocessor",
    },
    correct_answer: "answer_a",
    category: "React",
    difficulty: "Medium",
  },

  // Node.js Questions
  {
    question: "What is Node.js?",
    answers: {
      answer_a: "A JavaScript framework",
      answer_b: "A JavaScript runtime for server-side development",
      answer_c: "A database",
      answer_d: "A CSS preprocessor",
    },
    correct_answer: "answer_b",
    category: "Node.js",
    difficulty: "Easy",
  },
  {
    question: "What package manager is used with Node.js?",
    answers: {
      answer_a: "pip",
      answer_b: "npm",
      answer_c: "composer",
      answer_d: "maven",
    },
    correct_answer: "answer_b",
    category: "Node.js",
    difficulty: "Easy",
  },
  {
    question: "What is Express.js used for?",
    answers: {
      answer_a: "Managing state",
      answer_b: "Creating web servers and APIs",
      answer_c: "Database management",
      answer_d: "File compression",
    },
    correct_answer: "answer_b",
    category: "Node.js",
    difficulty: "Easy",
  },
  {
    question: "What is a callback function in Node.js?",
    answers: {
      answer_a: "A function that runs once",
      answer_b: "A function passed as an argument and executed later",
      answer_c: "A function that returns data",
      answer_d: "A function that calls itself",
    },
    correct_answer: "answer_b",
    category: "Node.js",
    difficulty: "Medium",
  },
  {
    question: "What file lists all dependencies in a Node.js project?",
    answers: {
      answer_a: "config.json",
      answer_b: "dependencies.json",
      answer_c: "package.json",
      answer_d: "modules.json",
    },
    correct_answer: "answer_c",
    category: "Node.js",
    difficulty: "Easy",
  },

  // SQL Questions
  {
    question: "Which SQL keyword is used to retrieve data from a database?",
    answers: {
      answer_a: "GET",
      answer_b: "SELECT",
      answer_c: "FETCH",
      answer_d: "RETRIEVE",
    },
    correct_answer: "answer_b",
    category: "SQL",
    difficulty: "Easy",
  },
  {
    question: "What does JOIN do in SQL?",
    answers: {
      answer_a: "Combines rows from multiple tables",
      answer_b: "Deletes data",
      answer_c: "Updates data",
      answer_d: "Creates a new table",
    },
    correct_answer: "answer_a",
    category: "SQL",
    difficulty: "Medium",
  },
  {
    question: "What is a PRIMARY KEY in SQL?",
    answers: {
      answer_a: "A key that opens a database",
      answer_b: "A unique identifier for each row",
      answer_c: "The first key on keyboard",
      answer_d: "A password key",
    },
    correct_answer: "answer_b",
    category: "SQL",
    difficulty: "Easy",
  },
  {
    question: "Which keyword is used to filter results in SQL?",
    answers: {
      answer_a: "FILTER",
      answer_b: "WHERE",
      answer_c: "HAVING",
      answer_d: "SEARCH",
    },
    correct_answer: "answer_b",
    category: "SQL",
    difficulty: "Easy",
  },
  {
    question: "What does DISTINCT do in SQL?",
    answers: {
      answer_a: "Makes data distinct from others",
      answer_b: "Removes duplicate rows",
      answer_c: "Sorts data",
      answer_d: "Groups data",
    },
    correct_answer: "answer_b",
    category: "SQL",
    difficulty: "Medium",
  },

  // HTML/CSS Questions
  {
    question: "What does HTML stand for?",
    answers: {
      answer_a: "Hyper Text Markup Language",
      answer_b: "High Tech Markup Language",
      answer_c: "Home Tool Markup Language",
      answer_d: "Hyperlinks and Text Markup Language",
    },
    correct_answer: "answer_a",
    category: "HTML/CSS",
    difficulty: "Easy",
  },
  {
    question: "What is the correct syntax for an HTML comment?",
    answers: {
      answer_a: "// comment",
      answer_b: "<!-- comment -->",
      answer_c: "# comment",
      answer_d: "* comment *",
    },
    correct_answer: "answer_b",
    category: "HTML/CSS",
    difficulty: "Easy",
  },
  {
    question: "What is CSS used for?",
    answers: {
      answer_a: "Structuring web pages",
      answer_b: "Styling web pages",
      answer_c: "Adding interactivity",
      answer_d: "Managing databases",
    },
    correct_answer: "answer_b",
    category: "HTML/CSS",
    difficulty: "Easy",
  },
  {
    question: "What is the correct way to select an element by ID in CSS?",
    answers: {
      answer_a: ".id",
      answer_b: "#id",
      answer_c: "*id",
      answer_d: "@id",
    },
    correct_answer: "answer_b",
    category: "HTML/CSS",
    difficulty: "Easy",
  },
  {
    question: "What is the box model in CSS?",
    answers: {
      answer_a: "A 3D box effect",
      answer_b: "Margin, border, padding, and content",
      answer_c: "A layout technique",
      answer_d: "A color scheme",
    },
    correct_answer: "answer_b",
    category: "HTML/CSS",
    difficulty: "Medium",
  },

  // General Programming Questions
  {
    question: "What is the main purpose of programming?",
    answers: {
      answer_a: "To create websites only",
      answer_b: "To solve problems and automate tasks",
      answer_c: "To design graphics",
      answer_d: "To manage databases only",
    },
    correct_answer: "answer_b",
    category: "General Programming",
    difficulty: "Easy",
  },
  {
    question: "What is a variable in programming?",
    answers: {
      answer_a: "A function that changes",
      answer_b: "A named container that stores data",
      answer_c: "A type of loop",
      answer_d: "An error message",
    },
    correct_answer: "answer_b",
    category: "General Programming",
    difficulty: "Easy",
  },
  {
    question: "What is debugging?",
    answers: {
      answer_a: "Writing code faster",
      answer_b: "Finding and fixing errors in code",
      answer_c: "Adding comments to code",
      answer_d: "Uploading code to server",
    },
    correct_answer: "answer_b",
    category: "General Programming",
    difficulty: "Easy",
  },
  {
    question: "What is an algorithm?",
    answers: {
      answer_a: "A programming language",
      answer_b: "A step-by-step procedure to solve a problem",
      answer_c: "A type of data structure",
      answer_d: "A software library",
    },
    correct_answer: "answer_b",
    category: "General Programming",
    difficulty: "Medium",
  },
  {
    question: "What is the difference between compiled and interpreted languages?",
    answers: {
      answer_a: "No difference",
      answer_b: "Compiled converts to machine code before execution, interpreted executes line by line",
      answer_c: "Interpreted languages are faster",
      answer_d: "Compiled languages are easier to learn",
    },
    correct_answer: "answer_b",
    category: "General Programming",
    difficulty: "Medium",
  },
];

async function seedQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/quizapp");
    console.log("✅ Connected to MongoDB");

    // Check if questions already exist
    const existingCount = await Question.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️ Database already contains ${existingCount} questions. Skipping seed.`);
      process.exit(0);
    }

    // Insert questions
    await Question.insertMany(programmingQuestions);
    console.log(`✅ Successfully seeded ${programmingQuestions.length} questions`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding questions:", err);
    process.exit(1);
  }
}

seedQuestions();
