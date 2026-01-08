💡 Daily Dev Byte
A micro-learning utility that delivers one bite-sized developer concept to your browser every day, powered by Google Gemini AI.

Daily Dev Byte fetches a daily topic from a private Google Sheet, generates a concise explanation and code example using AI, and displays it directly in your browser extension popup.

🚀 Features
Automated Learning: Automatically picks a new topic every 24 hours from your curated list.

AI-Powered Insights: Uses Google Gemini to provide context-aware explanations.

Zero Infrastructure: Uses Google Sheets as a database and Google Apps Script as a serverless backend.

Dev-Friendly UI: Dark mode support with syntax-highlighted code blocks.

🛠️ Setup & Installation
1. The Knowledge Base (Google Sheets)
Create a new Google Sheet.

Rename the first tab to DailyQuestions.

Add your topics/questions in Column A, starting from Row 2.

2. The Backend (Google Apps Script)
In your sheet, go to Extensions > Apps Script.

Paste the provided script (found in /backend/code.gs).

Replace SPREADSHEET_ID with your sheet's ID from the URL.

Replace GEMINI_API_KEY with your key from Google AI Studio.

Click Deploy > New Deployment.

Type: Web App

Execute as: Me

Who has access: Anyone

Copy the Web App URL.

3. The Extension (Chrome)
Clone this repository or download the source files.

Open popup.js and paste your Web App URL into the WEB_APP_URL constant.

Open Google Chrome and navigate to chrome://extensions/.

Enable Developer Mode (top right).

Click Load unpacked and select the project folder.

📂 Project Structure
Plaintext

├── manifest.json    # Extension configuration
├── popup.html       # UI Layout
├── popup.js         # Fetch logic & Markdown parsing
├── style.css        # Styling & Code block themes
└── README.md        # Documentation
🧪 Development & Testing
To avoid hitting Gemini API limits during development, the current doGet function in Apps Script is set to return a Mock AI Response.

To enable live AI responses:

Uncomment the callGemini() function in the Apps Script.

Update the doGet function to use the live API call.

📝 Configuration
To change the formatting of the AI's response, modify the system_instruction in the Apps Script:

"Explain this topic in 3 short bullet points and provide a code snippet."

🤝 Contributing
Contributions are welcome! If you have ideas for better UI or storage optimization, feel free to fork the repo and submit a PR.
