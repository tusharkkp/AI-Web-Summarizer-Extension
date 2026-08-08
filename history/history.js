const historyList = document.getElementById("historyList");
const search = document.getElementById("search");
const emptyState = document.getElementById("emptyState");
const totalCount = document.getElementById("totalCount");
const favoriteCount = document.getElementById("favoriteCount");
const weekCount = document.getElementById("weekCount");
const themeToggle = document.getElementById("themeToggle");

let allHistory = [];

function createButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function createCard(item) {
  const card = document.createElement("article");
  card.className = "card";

  const meta = document.createElement("div");
  meta.className = "card-meta";
  meta.textContent = formatSummaryDate(item.createdAt);

  const summary = document.createElement("p");
  summary.className = "card-summary";
  summary.textContent = item.summary;

  const details = document.createElement("div");
  details.className = "card-details";
  details.textContent = item.readingTime || "Reading time unavailable";

  const keywordList = document.createElement("div");
  keywordList.className = "card-keywords";
  (item.keywords || []).slice(0, 5).forEach((keyword) => {
    const chip = document.createElement("span");
    chip.textContent = keyword;
    keywordList.appendChild(chip);
  });

  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.append(
    createButton(item.favorite ? "★ Favorited" : "☆ Favorite", "action-button", async () => { await toggleFavorite(item.id); await load(); }),
    createButton("Copy", "action-button", async () => { await navigator.clipboard.writeText(formatSummaryForClipboard(item)); }),
    createButton("Export PDF", "action-button", () => { chrome.tabs.create({ url: chrome.runtime.getURL(`export/export.html?id=${encodeURIComponent(item.id)}`) }); }),
    createButton("Delete", "action-button danger-button", async () => { await deleteSummary(item.id); await load(); }),
  );

  card.append(meta, summary, details, keywordList, actions);
  return card;
}

function matchesSearch(item, query) {
  const concepts = (item.keyConcepts || []).flatMap((concept) => [concept?.term || "", concept?.explanation || ""]);
  return [item.summary, item.readingTime, ...(item.keyPoints || []), ...(item.keywords || []), ...concepts]
    .join(" ").toLowerCase().includes(query);
}

function render(data) {
  historyList.replaceChildren(...data.map(createCard));
  emptyState.hidden = data.length > 0;
}

async function updateStats() {
  const stats = await getHistoryStats();
  totalCount.textContent = stats.total;
  favoriteCount.textContent = stats.favorites;
  weekCount.textContent = stats.thisWeek;
}

function applySearch() {
  const query = search.value.trim().toLowerCase();
  render(query ? allHistory.filter((item) => matchesSearch(item, query)) : allHistory);
}

async function load() {
  [allHistory] = await Promise.all([getHistory(), updateStats()]);
  applySearch();
}

search.addEventListener("input", applySearch);
themeToggle.addEventListener("click", toggleTheme);
applyStoredTheme().then(load);
