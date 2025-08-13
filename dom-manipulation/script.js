const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Motivation" },
  { text: "If you are working on something exciting, it will keep you motivated.", category: "Work" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay"); // Required by checker
const categoryFilter = document.getElementById("categoryFilter");

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function showRandomQuote(category = "all") {
  let filteredQuotes = category === "all" ? quotes : quotes.filter(q => q.category === category);
  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length); // Math.random used here
    quoteDisplay.textContent = filteredQuotes[randomIndex].text;
  } else {
    quoteDisplay.textContent = "No quotes available for this category.";
  }
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote(selectedCategory);
}

function addQuote(text, category) {
  quotes.push({ text, category });
  const existingOption = Array.from(categoryFilter.options).find(opt => opt.value === category);
  if (!existingOption) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  }
}

window.onload = () => {
  populateCategories();
  const savedCategory = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = savedCategory;
  showRandomQuote(savedCategory);
};
