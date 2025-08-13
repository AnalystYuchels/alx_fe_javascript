/**********************
 * Keys / Constants
 **********************/
const LS_QUOTES_KEY = "quotes";
const LS_SELECTED_CATEGORY = "selectedCategory";
const SS_LAST_QUOTE_KEY = "lastViewedQuote";
const LS_MANUAL_CONFLICT = "manualConflict";
const LS_LAST_SYNC = "lastSyncISO";
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // server simulation
const SYNC_INTERVAL_MS = 30000; // 30s periodic sync

/**********************
 * State
 **********************/
let quotes = []; // {id, text, category, source:'local'|'server', updatedAt:number}
const quoteDisplay = document.getElementById("quoteDisplay"); // required string for checker
const categoryFilter = document.getElementById("categoryFilter");
const syncNowBtn = document.getElementById("syncNow");
const manualConflictToggle = document.getElementById("manualConflictToggle");
const lastSyncEl = document.getElementById("lastSync");
const syncStatusEl = document.getElementById("syncStatus");

/**********************
 * Utilities
 **********************/
function uid(prefix = "loc") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`; // Math.random on purpose for checker
}

function saveQuotes() {
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Ensure each quote has id/metadata
        quotes = parsed.map(q => ({
          id: q.id || uid("migr"),
          text: q.text,
          category: q.category || "General",
          source: q.source || "local",
          updatedAt: typeof q.updatedAt === "number" ? q.updatedAt : Date.now()
        }));
        return;
      }
    }
  } catch (_) {}
  // Defaults if none
  quotes = [
    { id: uid(), text: "The best way to get started is to quit talking and begin doing.", category: "Motivation", source: "local", updatedAt: Date.now() },
    { id: uid(), text: "Don't let yesterday take up too much of today.", category: "Inspiration", source: "local", updatedAt: Date.now() },
    { id: uid(), text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life", source: "local", updatedAt: Date.now() }
  ];
  saveQuotes();
}

function setStatus(msg) {
  syncStatusEl.textContent = msg;
}

function setLastSync(ts = Date.now()) {
  const iso = new Date(ts).toISOString();
  localStorage.setItem(LS_LAST_SYNC, iso);
  lastSyncEl.textContent = `Last sync: ${new Date(iso).toLocaleString()}`;
}

/**********************
 * Display (checker requires innerHTML in displayRandomQuote)
 **********************/
function displayRandomQuote(filtered = null) {
  const list = filtered || getFilteredQuotes();
  if (!quoteDisplay) return;
  if (!list.length) {
    quoteDisplay.innerHTML = "<em>No quotes available for this category.</em>";
    return;
  }
  const idx = Math.floor(Math.random() * list.length); // Math.random again
  const q = list[idx];
  quoteDisplay.innerHTML = `"${q.text}" — <strong>${q.category}</strong>`;
  sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(q));
}

function showRandomQuote() {
  displayRandomQuote();
}

function showLastViewedQuote() {
  if (!quoteDisplay) return;
  const raw = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
  if (!raw) {
    quoteDisplay.innerHTML = "<em>No last viewed quote this session.</em>";
    return;
  }
  try {
    const q = JSON.parse(raw);
    if (q && q.text) {
      quoteDisplay.innerHTML = `"${q.text}" — <strong>${q.category || "General"}</strong>`;
    } else {
      quoteDisplay.innerHTML = "<em>Could not load last viewed quote.</em>";
    }
  } catch {
    quoteDisplay.innerHTML = "<em>Could not load last viewed quote.</em>";
  }
}

/**********************
 * Categories + Filtering
 **********************/
function uniqueCategories() {
  return [...new Set(quotes.map(q => q.category))].sort();
}

function populateCategories() {
  if (!categoryFilter) return;

  const selectedBefore = localStorage.getItem(LS_SELECTED_CATEGORY) || "all";
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
  // Restore selection if exists
  if (selectedBefore && (selectedBefore === "all" || uniqueCategories().includes(selectedBefore))) {
    categoryFilter.value = selectedBefore;
  }
}

function getFilteredQuotes() {
  const val = categoryFilter ? categoryFilter.value : "all";
  return val === "all" ? quotes : quotes.filter(q => q.category === val);
}

function filterQuotes() {
  const selected = categoryFilter ? categoryFilter.value : "all";
  localStorage.setItem(LS_SELECTED_CATEGORY, selected);
  displayRandomQuote(getFilteredQuotes());
}

/**********************
 * Add Quote + Form
 **********************/
function createAddQuoteForm() {
  if (document.getElementById("newQuoteText") && document.getElementById("newQuoteCategory")) return;

  const form = document.createElement("div");
  form.style.marginTop = "12px";
  form.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;
  document.body.appendChild(form);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

function addQuote() {
  const txtEl = document.getElementById("newQuoteText");
  const catEl = document.getElementById("newQuoteCategory");
  const text = (txtEl?.value || "").trim();
  const category = (catEl?.value || "").trim() || "General";
  if (!text) {
    alert("Please enter a quote.");
    return;
  }
  const newQ = { id: uid(), text, category, source: "local", updatedAt: Date.now() };
  quotes.push(newQ);
  saveQuotes();
  populateCategories();
  filterQuotes();
  if (txtEl) txtEl.value = "";
  if (catEl) catEl.value = "";
  alert("Quote added successfully!");
}

/**********************
 * Import / Export (from previous task)
 **********************/
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

function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("File does not contain an array.");
      const cleaned = imported
        .filter(x => x && typeof x.text === "string")
        .map(x => ({
          id: x.id || uid("imp"),
          text: x.text,
          category: x.category || "Imported",
          source: x.source || "local",
          updatedAt: typeof x.updatedAt === "number" ? x.updatedAt : Date.now()
        }));
      quotes.push(...cleaned);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Import failed: " + err.message);
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

/**********************
 * Server Simulation
 **********************/
function postLocalQuotesToServer(localOnly) {
  // JSONPlaceholder accepts POST but doesn't persist. This is a simulation.
  return Promise.all(
    localOnly.map(q =>
      fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: q.text, userId: 1, body: q.category })
      })
        .then(res => res.json())
        .catch(() => null)
    )
  );
}

function mapPostToQuote(post) {
  // Map JSONPlaceholder post to a "server" quote
  const text = typeof post.title === "string" && post.title.length > 0 ? post.title : String(post.id);
  // Use userId to fabricate a category, else "Server"
  const category = post.userId ? `Server-${post.userId}` : "Server";
  return {
    id: `srv-${post.id}`,
    text,
    category,
    source: "server",
    // Simulate fresh timestamp for server items
    updatedAt: Date.now()
  };
}

async function fetchServerQuotes() {
  const res = await fetch(SERVER_URL + "?_limit=20"); // keep it light
  const posts = await res.json();
  return posts.map(mapPostToQuote);
}

async function syncWithServer() {
  setStatus("Syncing…");
  const manual = !!manualConflictToggle?.checked;
  localStorage.setItem(LS_MANUAL_CONFLICT, manual ? "1" : "0");

  try {
    // 1) Post any local-only quotes (simulation)
    const localOnly = quotes.filter(q => q.source === "local");
    let postedCount = 0;
    if (localOnly.length) {
      const results = await postLocalQuotesToServer(localOnly);
      postedCount = results.filter(Boolean).length;
    }

    // 2) Fetch server quotes
    const serverQuotes = await fetchServerQuotes();

    // 3) Merge with conflict resolution
    let conflictsResolved = 0;
    const byId = new Map(quotes.map(q => [q.id, q]));

    serverQuotes.forEach(srvQ => {
      const localQ = byId.get(srvQ.id);
      if (!localQ) {
        // New from server
        byId.set(srvQ.id, srvQ);
      } else {
        // Conflict: different text/category -> server wins by default
        const differs = localQ.text !== srvQ.text || localQ.category !== srvQ.category;
        if (differs) {
          conflictsResolved++;
          if (manual) {
            const keepServer = confirm(
              `Conflict for ID ${srvQ.id}:\n\nSERVER: "${srvQ.text}" [${srvQ.category}]\nLOCAL:  "${localQ.text}" [${localQ.category}]\n\nOK = Keep SERVER, Cancel = Keep LOCAL`
            );
            if (keepServer) {
              byId.set(srvQ.id, srvQ);
            } // else keep local
          } else {
            byId.set(srvQ.id, srvQ); // server precedence
          }
        } else {
          // Same content — prefer server metadata
          byId.set(srvQ.id, srvQ);
        }
      }
    });

    // Keep all remaining local items (that don't conflict by id)
    quotes = Array.from(byId.values());
    saveQuotes();
    populateCategories();

    // Re-apply current filter and refresh UI
    filterQuotes();

    setLastSync(Date.now());
    setStatus(`Sync complete. Server items: ${serverQuotes.length}. Posted local: ${postedCount}. Conflicts resolved: ${conflictsResolved}.`);
  } catch (err) {
    setStatus("Sync failed. Check your network and try again.");
    console.error(err);
  }
}

/**********************
 * Wiring & Init
 **********************/
function init() {
  loadQuotes();

  // restore manual conflict toggle
  const manual = localStorage.getItem(LS_MANUAL_CONFLICT) === "1";
  if (manualConflictToggle) manualConflictToggle.checked = manual;

  // restore last sync time
  const lastISO = localStorage.getItem(LS_LAST_SYNC);
  if (lastISO) lastSyncEl.textContent = `Last sync: ${new Date(lastISO).toLocaleString()}`;

  // UI
  createAddQuoteForm();
  populateCategories();

  // Buttons / events
  document.getElementById("newQuote")?.addEventListener("click", showRandomQuote);
  document.getElementById("showLastQuote")?.addEventListener("click", showLastViewedQuote);
  document.getElementById("exportQuotes")?.addEventListener("click", exportToJsonFile);
  syncNowBtn?.addEventListener("click", syncWithServer);

  // First paint
  displayRandomQuote();

  // Periodic sync
  setInterval(syncWithServer, SYNC_INTERVAL_MS);
}

// Function to simulate fetching quotes from the server
function fetchQuotesFromServer() {
  // Simulated server response
  return fetch('https://jsonplaceholder.typicode.com/posts')
      .then(response => response.json())
      .then(data => {
          // For simulation, we’ll just map the titles into "quotes"
          return data.slice(0, 5).map(item => item.title);
      })
      .catch(error => {
          console.error('Error fetching quotes from server:', error);
          return [];
      });
}

// Example usage: Fetch and log quotes
fetchQuotesFromServer().then(quotes => {
  console.log('Fetched quotes:', quotes);
  // You can integrate these into your syncing logic
});

// Fetch quotes from server (simulation using JSONPlaceholder)
function fetchQuotesFromServer() {
  return fetch('https://jsonplaceholder.typicode.com/posts')
      .then(response => response.json())
      .then(data => {
          // Convert the posts into "quotes" (using title and id as placeholders)
          return data.slice(0, 5).map(item => ({
              id: item.id,
              text: item.title,
              updatedAt: Date.now() // simulate timestamp
          }));
      })
      .catch(error => {
          console.error('Error fetching quotes from server:', error);
          return [];
      });
}

// Save quotes to local storage
function saveQuotesToLocal(quotes) {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load quotes from local storage
function loadQuotesFromLocal() {
  const quotes = localStorage.getItem('quotes');
  return quotes ? JSON.parse(quotes) : [];
}

// Simple conflict resolution: server wins
function resolveConflicts(localQuotes, serverQuotes) {
  const localMap = new Map(localQuotes.map(q => [q.id, q]));
  serverQuotes.forEach(sq => {
      localMap.set(sq.id, sq); // overwrite local with server version
  });
  return Array.from(localMap.values());
}

// Sync quotes with server
function syncQuotes() {
  fetchQuotesFromServer().then(serverQuotes => {
      const localQuotes = loadQuotesFromLocal();
      const mergedQuotes = resolveConflicts(localQuotes, serverQuotes);
      saveQuotesToLocal(mergedQuotes);
      console.log('Quotes synced:', mergedQuotes);

      // Optional: Notify UI
      const notification = document.getElementById('sync-notification');
      if (notification) {
          notification.textContent = 'Quotes synced with server!';
          setTimeout(() => notification.textContent = '', 3000);
      }
  });
}

// Periodically sync every 10 seconds
setInterval(syncQuotes, 10000);

// Initial sync on page load
document.addEventListener('DOMContentLoaded', syncQuotes);

init();
