// Initial quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" }
];

// Function to display a random quote (required name & innerHTML)
function displayRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<em>No quotes available.</em>";
    return;
  }

  let randomIndex = Math.floor(Math.random() * quotes.length);
  let quote = quotes[randomIndex];
  document.getElementById("quoteDisplay").innerHTML = `"${quote.text}" — <strong>${quote.category}</strong>`;
}

// Function to add a new quote
function addQuote() {
  let quoteText = document.getElementById("newQuoteText").value.trim();
  let quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (quoteText === "" || quoteCategory === "") {
    alert("Please fill in both the quote and category fields.");
    return;
  }

  quotes.push({ text: quoteText, category: quoteCategory });
  
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  
  alert("Quote added successfully!");
}

// Attach event listener to 'Show New Quote' button
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);

// Show the first random quote on page load
displayRandomQuote();
