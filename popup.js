// popup.js

// 1. Replace this with your Google Apps Script Web App URL
const WEB_APP_URL = CONFIG.WEB_APP_URL;
const MY_SECRET_TOKEN = CONFIG.MY_SECRET_TOKEN;

document.addEventListener('DOMContentLoaded', async () => {

  const mainScreen = document.getElementById('mainScreen');
  const settingsScreen = document.getElementById('settingsScreen');

  // Navigation Buttons
  document.getElementById('goToSettings').onclick = () => {
    loadSettingsInputs();
    switchScreen('settings');
  };

  document.getElementById('backToMain').onclick = () => switchScreen('main');

  // Save Settings Logic
  document.getElementById('saveSettings').onclick = () => {
    const sheetId = document.getElementById('sheetIdInput').value;
    const apiKey = document.getElementById('apiKeyInput').value;

    chrome.storage.sync.set({ sheetId, geminiKey: apiKey }, () => {
      // Clear cache so it fetches fresh for the new sheet/key
      chrome.storage.local.remove(['lastFetchDate', 'cachedData'], () => {
        window.location.reload(); 
      });
    });
  };

  // Helper: Switch between screens
  function switchScreen(screen) {
    if (screen === 'settings') {
      mainScreen.classList.remove('active');
      settingsScreen.classList.add('active');
    } else {
      settingsScreen.classList.remove('active');
      mainScreen.classList.add('active');
    }
  }

  // Helper: Pre-fill inputs from storage
  function loadSettingsInputs() {
    chrome.storage.sync.get(['sheetId', 'geminiKey'], (data) => {
      if (data.sheetId) document.getElementById('sheetIdInput').value = data.sheetId;
      if (data.geminiKey) document.getElementById('apiKeyInput').value = data.geminiKey;
    });
  }

  const questionElement = document.getElementById('questionTitle');
  const answerElement = document.getElementById('answerContent');

  // 1. Get Settings (IDs/Keys) and Cache from storage
  chrome.storage.sync.get(['sheetId', 'geminiKey'], async (settings) => {
    chrome.storage.local.get(['lastId', 'lastFetchDate', 'cachedData'], async (cache) => {
      
      const { sheetId, geminiKey } = settings;
      const today = new Date().toLocaleDateString();

      // 2. Check if we already have today's content cached
      if (cache.lastFetchDate === today && cache.cachedData) {
        console.log("Loading from cache...");
        displayData(cache.cachedData);
        return;
      }

      // 3. If it's a new day or no cache, fetch from Apps Script
      if (!sheetId) {
        answerElement.innerHTML = "Please configure your settings in Options.";
        return;
      }

      try {
        const response = await fetch(WEB_APP_URL, {
          method: "POST",
          body: JSON.stringify({
            token: MY_SECRET_TOKEN,
            sheetId: sheetId,
            lastId: cache.lastId || 0 // Send 0 if it's the first time
          })
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error);

        // 4. Update Cache and Display
        chrome.storage.local.set({
          lastId: data.currentId,
          lastFetchDate: today,
          cachedData: data
        });

        displayData(data);

      } catch (err) {
        console.error("Fetch failed:", err);
        answerElement.textContent = "Error fetching new byte: " + err.message;
      }
    });
  });

  function displayData(data) {
    questionElement.textContent = data.question;
    answerElement.innerHTML = formatAnswer(data.answer);
    answerElement.classList.remove('loader');
  }
});

document.getElementById('refreshBtn').addEventListener('click', function() {
  const btn = this;
  btn.classList.add('spinning'); // Add animation
  
  // 1. Remove the cached date and content
  chrome.storage.local.remove(['lastFetchDate', 'cachedData'], () => {
    // 2. Reload the popup logic to trigger a fresh fetch
    // Since lastFetchDate is gone, the main fetch logic will hit the API
    window.location.reload();
  });
});

function forceRefresh() {
  chrome.storage.local.remove(['lastFetchDate', 'cachedData'], () => {
    location.reload(); // This triggers the logic above to fetch new data
  });
}


function formatAnswer(text) {
  if (!text) return "";

  let html = text;

  // 1. CODE BLOCKS: Triple backticks (handled first to protect content)
  html = html.replace(/^```(?:[a-z]+)?\n([\s\S]*?)\n```/gm, '<pre><code>$1</code></pre>');

  // 2. HEADINGS: # H1, ## H2, ### H3
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // 3. LISTS: Lines starting with * or - or 1.
  // Unordered list
  html = html.replace(/^\s*[\*\-]\s+(.*)/gm, '<li>$1</li>');
  // Wrap <li> groups in <ul>
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // 4. BOLD & ITALIC
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 5. INLINE CODE: Single backticks
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // 6. LINE BREAKS (only for non-list, non-heading lines)
  // We split by tags and add <br> to plain text segments
  return html.split(/(<[^>]*>)/g).map(part => {
    if (part.startsWith('<')) return part;
    return part.replace(/\n/g, '<br>');
  }).join('');
}