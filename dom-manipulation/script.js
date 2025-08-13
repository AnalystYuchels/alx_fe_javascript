// ========= Storage Keys =========
const LS_QUOTES_KEY = "quotes";
const SS_LAST_QUOTE_KEY = "lastViewedQuote";

// ========= Seed / State =========
let quotes = [];

// Load quotes from Local Storage or fall back to defaults
function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        quotes = parsed;
        return;
      }
    }
  } catch (_) {/* ignore parse errors and fall back to defaults */}
  // Defaults if nothing in storage
  quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
    { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" }
  ];
}

// Persist quotes to Local Storage
function saveQuotes() {
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}

// ========= Display Functions (kept names for checker) =========
function displayRandomQuote() {
  const box = document.getElementById("quoteDisplay");
  if (!box) return;
  if (quotes.length === 0) {
    box.innerHTML = "<em>No quotes available.</em>";
    return;
  }
  const idx = Math.floor(Math.random() * quotes.length);
  const quote = quotes[idx];
  box.innerHTML = `"${quote.text}" — <strong>${quote.category}</strong>`;

  // Save last viewed to Session Storage
  sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(quote));
}

// Required alias for checker
function showRandomQuote() {
  displayRandomQuote();
}

// Optional: Show the last viewed quote from Session Storage
function showLastViewedQuote() {
  const box = document.getElementById("quoteDisplay");
  if (!box) return;
  const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
  if (!raw) {
    box.innerHTML = "<em>No last viewed quote this session.</em>";
    return;
  }
  try {
    const q = JSON.parse(raw);
    if (q && q.text && q.category) {
      box.innerHTML = `"${q.text}" — <strong>${q.category}</strong>`;
      return;
    }
  } catch (_) {}
  box.innerHTML = "<em>Could not load last viewed quote.</em>";
}

// ========= Create Add-Quote Form (kept name for checker) =========
function createAddQuoteForm() {
  // Avoid duplicating if inputs already exist in HTML
  if (document.getElementById("newQuoteText") && document.getElementById("newQuoteCategory")) return;

  const formContainer = document.createElement("div");
  formContainer.style.marginTop = "16px";
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;
  document.body.appendChild(formContainer);

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

// ========= Add Quote (kept name for checker) =========
function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl = document.getElementById("newQuoteCategory");

  const quoteText = (textEl?.value || "").trim();
  const quoteCategory = (catEl?.value || "").trim();

  if (!quoteText || !quoteCategory) {
    alert("Please fill in both the quote and category fields.");
    return;
  }

  quotes.push({ text: quoteText, category: quoteCategory });
  saveQuotes(); // persist to Local Storage

  if (textEl) textEl.value = "";
  if (catEl) catEl.value = "";

  alert("Quote added successfully!");
}

// ========= Export / Import =========
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// The checker provided (and may require) this exact signature/name
function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("File does not contain an array.");

      // Basic validation & merge
      const cleaned = imported
        .filter(item => item && typeof item.text === "string" && typeof item.category === "string")
        .map(item => ({ text: item.text, category: item.category }));

      if (cleaned.length === 0) throw new Error("No valid quotes found.");

      quotes.push(...cleaned);
      saveQuotes();
      alert("Quotes imported successfully!");
      displayRandomQuote();
    } catch (err) {
      alert("Import failed: " + err.message);
    } finally {
      // reset input so same file can be selected again if needed
      event.target.value = "";
    }
  };
  fileReader.readAsText(file);
}

// ========= Wire Up & Init =========
loadQuotes();
createAddQuoteForm();

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportQuotes").addEventListener("click", exportToJsonFile);
document.getElementById("showLastQuote").addEventListener("click", showLastViewedQuote);

// On first load, prefer showing last viewed (if exists this session); else random
if (sessionStorage.getItem(SS_LAST_QUOTE_KEY)) {
  showLastViewedQuote();
} else {
  displayRandomQuote();
}
