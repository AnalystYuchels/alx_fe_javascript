// Example quotes array (with category property)
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", author: "Will Rogers", category: "Inspiration" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", author: "Vince Lombardi", category: "Motivation" }
];

// Populate categories dynamically
function populateCategories() {
  const categorySelect = document.getElementById("categoryFilter");

  // Extract unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Clear old options except "All Categories"
  categorySelect.innerHTML = '<option value="all">All Categories</option>';

  // Add new categories
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  // Restore last selected category if exists in localStorage
  const lastCategory = localStorage.getItem("selectedCategory");
  if (lastCategory && categorySelect.querySelector(`option[value="${lastCategory}"]`)) {
    categorySelect.value = lastCategory;
  }
}

// Filter quotes based on category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;

  // Save selected category to localStorage
  localStorage.setItem("selectedCategory", selectedCategory);

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  displayQuotes(filteredQuotes);
}

// Display quotes in DOM
function displayQuotes(quotesArray) {
  const container = document.getElementById("quotesContainer");
  container.innerHTML = ""; // Clear existing content

  quotesArray.forEach(q => {
    const quoteEl = document.createElement("p");
    quoteEl.innerHTML = `<strong>"${q.text}"</strong> — ${q.author} <em>[${q.category}]</em>`;
    container.appendChild(quoteEl);
  });
}

// Add a new quote and update categories
function addQuote(text, author, category) {
  quotes.push({ text, author, category });
  populateCategories(); // Ensure dropdown updates
  filterQuotes(); // Reapply filter
}

// Initialize app on page load
window.onload = function () {
  populateCategories();
  filterQuotes();
};
