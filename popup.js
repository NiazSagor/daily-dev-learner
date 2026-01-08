// popup.js

// 1. Replace this with your Google Apps Script Web App URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby7bMsNog8zuidWMfpkHd_MyLgjlUsTY56nPySRkS6aEH7H9AZdnKqnsQGdJFEzbuCk/exec";

document.addEventListener('DOMContentLoaded', function() {
  const questionElement = document.getElementById('questionTitle');
  const answerElement = document.getElementById('answerContent');

  console.log("Attempting to fetch from:", WEB_APP_URL);

  // 2. The Fetch call with Redirect handling
  fetch(WEB_APP_URL)
    .then(response => {
      // Check if the response is a redirect (Google Apps Script quirk)
      if (response.status === 302 || response.type === 'opaqueredirect') {
        console.warn("Redirect detected. Browsers usually handle this, but checking response...");
      }
      return response.json();
    })
    .then(data => {
      console.log("Success! Data received:", data);
      
      // 3. Display the Question
      questionElement.textContent = data.question;

      // 4. Format and Display the Answer
      // Using innerHTML to allow for basic formatting (like code tags)
      answerElement.innerHTML = formatAnswer(data.answer);
      answerElement.classList.remove('loader');
    })
    .catch(error => {
      console.error('Fetch Error:', error);
      answerElement.textContent = "Error: " + error.message + ". Make sure your Apps Script is deployed as 'Anyone'.";
    });
});

/**
 * Simple helper to format AI text
 * - Wraps `code` in <code> tags
 * - Converts newlines to <br>
 */
function formatAnswer(text) {
  if (!text) return "";
  
  // Replace triple backticks (code blocks)
  let formatted = text.replace(/```(?:[a-z]+)?\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>');
  
  // Replace single backticks (inline code)
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Convert newlines to breaks for readability
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
}
