# QuizAPI.io Integration Setup

This application now integrates with QuizAPI.io to fetch questions when local database has insufficient questions.

## Setup Instructions

### 1. Get Your API Key

1. Visit [https://quizapi.io/](https://quizapi.io/)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Set Environment Variable

Create a `.env` file in the `server` directory:

```env
QUIZAPI_KEY=your_api_key_here
```

Or set it directly when running the server:

**Windows (PowerShell):**
```powershell
$env:QUIZAPI_KEY="your_api_key_here"; node server.js
```

**Windows (CMD):**
```cmd
set QUIZAPI_KEY=your_api_key_here && node server.js
```

**Linux/Mac:**
```bash
export QUIZAPI_KEY=your_api_key_here
node server.js
```

### 3. How It Works

- The system first tries to fetch questions from the local MongoDB database
- If insufficient questions are found, it automatically falls back to QuizAPI.io
- Questions from QuizAPI.io are converted to match the application's format
- Supports MCQ, True-False, and Multiple Correct answer formats

### 4. API Usage

The integration uses the QuizAPI.io endpoint:
```
https://quizapi.io/api/v1/questions?apiKey=YOUR_API_KEY&limit=10
```

### 5. Category Mapping

The following categories are mapped:
- Linux → Linux
- JavaScript, Python, Java, React, Node.js, HTML/CSS, General Programming → Code
- SQL → SQL

### 6. Free Tier Limits

QuizAPI.io free tier typically includes:
- Limited requests per day
- Basic question categories
- Standard difficulty levels

Check [QuizAPI.io pricing](https://quizapi.io/pricing) for current limits.

## Troubleshooting

If you see "Insufficient questions available":
1. Check if your API key is set correctly
2. Verify your API key is valid and not expired
3. Check if you've exceeded your daily API limit
4. Try different category or difficulty settings

