let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t watch the clock; do what it does. Keep going.", category: "Motivation" },
  { text: "Be yourself; everyone else is already taken.", category: "Life" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function getUniqueCategories() {
  const categories = quotes.map(q => q.category);
  return [...new Set(categories)];
}

function populateCategories() {
  const savedFilter = localStorage.getItem("selectedCategory") || "all";
  const uniqueCategories = getUniqueCategories();

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  categoryFilter.value = savedFilter;
}

function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<em>No quotes found in this category.</em>`;
    return;
  }

  const random = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.innerHTML = `"${random.text}" <br><small><em>— ${random.category}</em></small>`;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(random));
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  alert("Quote added!");

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

function filterQuotes() {
  localStorage.setItem("selectedCategory", categoryFilter.value);
  showRandomQuote(); // Re-display quote based on filter
}

function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch (e) {
      alert("Failed to import: Invalid JSON file");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Restore last viewed quote and filter
window.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  const lastQuote = sessionStorage.getItem("lastViewedQuote");
  if (lastQuote) {
    const parsed = JSON.parse(lastQuote);
    quoteDisplay.innerHTML = `"${parsed.text}" <br><small><em>— ${parsed.category}</em></small>`;
  }
});

newQuoteButton.addEventListener("click", showRandomQuote);

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Simulated source

async function fetchFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();

    // Convert mock data to quote-like structure
    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));

    // Sync logic here
    const updated = syncWithServer(serverQuotes);

    if (updated) {
      alert("Quotes updated from server.");
    }
  } catch (err) {
    console.error("Failed to fetch from server:", err);
  }
}

function syncWithServer(serverQuotes) {
  let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

  let newQuotesAdded = false;

  serverQuotes.forEach(serverQuote => {
    const exists = localQuotes.some(
      q => q.text === serverQuote.text && q.category === serverQuote.category
    );

    if (!exists) {
      localQuotes.push(serverQuote);
      newQuotesAdded = true;
    }
  });

  if (newQuotesAdded) {
    quotes = localQuotes;
    saveQuotes();
    populateCategories();
  }

  return newQuotesAdded;
}

