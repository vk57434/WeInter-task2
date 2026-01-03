# OpenAI API Integration Setup

This application now integrates with OpenAI API to generate quiz questions dynamically when other sources are unavailable.

## Setup Instructions

### 1. Get Your API Key

1. Visit [https://platform.openai.com/](https://platform.openai.com/)
2. Sign up or log in to your OpenAI account
3. Navigate to API Keys section
4. Create a new API key
5. Copy your API key (starts with `sk-`)

### 2. Set Environment Variable

Add your OpenAI API key to the `.env` file in the `server` directory:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

Or set it directly when running the server:

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="sk-your-api-key-here"; node server.js
```

**Windows (CMD):**
```cmd
set OPENAI_API_KEY=sk-your-api-key-here && node server.js
```

**Linux/Mac:**
```bash
export OPENAI_API_KEY=sk-your-api-key-here
node server.js
```

### 3. How It Works

The quiz generation follows this priority order:

1. **Local Database** - First tries to fetch questions from MongoDB
2. **QuizAPI.io** - If local database has insufficient questions, tries QuizAPI.io
3. **OpenAI** - If QuizAPI.io fails, generates questions using OpenAI GPT-3.5-turbo

### 4. Features

- **Dynamic Question Generation**: Creates questions based on category, difficulty, and format
- **Multiple Formats**: Supports MCQ, True-False, and Multiple Correct answer formats
- **Customizable**: Questions are tailored to your specific requirements
- **Intelligent Fallback**: Automatically uses OpenAI when other sources fail

### 5. API Usage

The integration uses OpenAI's GPT-3.5-turbo model to generate questions. Each generation:
- Creates questions matching your category and difficulty
- Formats questions according to your selected type (MCQ, True-False, etc.)
- Includes explanations for each question
- Returns questions in the application's standard format

### 6. Cost Considerations

- OpenAI charges based on token usage
- GPT-3.5-turbo is cost-effective for question generation
- Typical cost: ~$0.001-0.002 per quiz (10 questions)
- Monitor your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

### 7. Model Used

- **Model**: `gpt-3.5-turbo`
- **Temperature**: 0.7 (balanced creativity and consistency)
- **Max Tokens**: 2000 (sufficient for multiple questions)

## Troubleshooting

### "OpenAI API key not set"
- Make sure you've set the `OPENAI_API_KEY` environment variable
- Check that the key starts with `sk-`
- Restart the server after setting the key

### "OpenAI returned empty response"
- Check your API key is valid and not expired
- Verify you have credits in your OpenAI account
- Check OpenAI service status

### Rate Limiting
- OpenAI has rate limits based on your plan
- Free tier: 3 requests per minute
- Paid tier: Higher limits
- If you hit limits, the system will fall back to other sources

### Invalid JSON Response
- OpenAI sometimes returns markdown-wrapped JSON
- The system automatically strips markdown code blocks
- If issues persist, try regenerating the quiz

## Example Usage

When generating a quiz:
1. Select category: "Computer Science"
2. Select difficulty: "Medium"
3. Select format: "MCQ"
4. Number of questions: 10

If local database and QuizAPI.io don't have enough questions, OpenAI will generate 10 custom questions about Computer Science at Medium difficulty level.

